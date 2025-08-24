import os
from app.utils.feature_flags import env_bool
AUDIT_WORKER_ENABLED = env_bool("AUDIT_WORKER_ENABLED", False)

if not AUDIT_WORKER_ENABLED:
    pass
else:
    import os, socket, time, sys
    from typing import Optional
    from celery import signals
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.exc import OperationalError
    from app.database import engine
    from app.audit.audit import write_audit
    from app.models.audit import ActorKind, AuditStatus
    from app.audit.change_tracker import audit_changes_buffer
    from app.audit.change_tracker import _pk as _safe_pk

    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    HOST = socket.gethostname()
    ROLE = os.getenv("CELERY_ROLE", "").lower()  # "beat" oder ""

    def _ctx(**base): return {k: v for k, v in base.items() if v is not None}

    def _safe_write_audit(*, payload: dict, retries: int = 5, base_delay: float = 0.5) -> bool:
        delay = base_delay
        for attempt in range(retries):
            try:
                with SessionLocal() as db:
                    write_audit(db, **payload)
                return True
            except OperationalError:
                engine.dispose()
                time.sleep(delay)
                delay = min(delay * 2, 5.0)
            except Exception:
                return False
        return False

    def _get_corr(headers: dict | None, task_id: str | None, req=None) -> str | None:
        if headers:
            if cid := headers.get("x-correlation-id"):
                return cid
            if rid := headers.get("root_id"):
                return rid
        if req is not None:
            rid = getattr(req, "root_id", None)
            if rid:
                return rid
        return task_id

    def _flush_changes(*, user_id, actor_label, task_id, sender_name, extra_ctx, correlation_id):
        changes_buffer = audit_changes_buffer.get() or []
        if not changes_buffer:
            return
        for item in changes_buffer:
            payload = dict(
                actor_kind=ActorKind.system,
                user_id=user_id,
                actor_label=actor_label,
                action=f"{item.get('op')} {item.get('type')}",
                status=AuditStatus.info,
                target_type=item.get("type"),
                target_id=str(item.get("id") or _safe_pk(item.get("__obj"))) if (item.get("id") or item.get("__obj")) else None,
                message=None,
                request_id=task_id,
                correlation_id=correlation_id,
                context={**extra_ctx, "via": f"celery {sender_name}"},
                changes=item.get("changes") or {},
            )
            _safe_write_audit(payload=payload)

    @signals.worker_process_init.connect
    def _worker_process_init(**_):
        engine.dispose()

    @signals.worker_ready.connect
    def _worker_ready(sender=None, **_):
        if ROLE == "beat":
            return
        _safe_write_audit(payload=dict(
            actor_kind=ActorKind.system,
            user_id=None,
            actor_label=f"worker@{HOST}",
            action="worker.ready",
            status=AuditStatus.info,
            target_type="worker",
            target_id=None,
            message=None,
            request_id=None,
            correlation_id=None,
            context=_ctx(pid=os.getpid(), hostname=HOST),
        ))

    @signals.worker_shutdown.connect
    def _worker_shutdown(sender=None, **_):
        if ROLE == "beat":
            return
        _safe_write_audit(payload=dict(
            actor_kind=ActorKind.system,
            user_id=None,
            actor_label=f"worker@{HOST}",
            action="worker.shutdown",
            status=AuditStatus.info,
            target_type="worker",
            target_id=None,
            message=None,
            request_id=None,
            correlation_id=None,
            context=_ctx(pid=os.getpid()),
        ))

    @signals.beat_init.connect
    def _beat_init(sender=None, **kwargs):
        service = sender or kwargs.get("service")
        _safe_write_audit(payload=dict(
            actor_kind=ActorKind.system,
            user_id=None,
            actor_label=f"beat@{HOST}",
            action="beat.init",
            status=AuditStatus.info,
            target_type="beat",
            target_id=None,
            message=None,
            request_id=None,
            correlation_id=None,
            context=_ctx(pid=os.getpid(), hostname=HOST, beat_cls=(type(service).__name__ if service else None)),
        ))

    if ROLE == "beat" or " beat" in " ".join(sys.argv):
        _safe_write_audit(payload=dict(
            actor_kind=ActorKind.system,
            user_id=None,
            actor_label=f"beat@{HOST}",
            action="beat.init",
            status=AuditStatus.info,
            target_type="beat",
            target_id=None,
            message=None,
            request_id=None,
            correlation_id=None,
            context=_ctx(pid=os.getpid(), hostname=HOST, via="fallback"),
        ))

    @signals.after_task_publish.connect
    def _after_task_publish(sender=None, headers=None, body=None, **_):
        task_id = (headers or {}).get("id") or (body or {}).get("id")
        kwargs = (headers or {}).get("kwargsrepr") or (body or {}).get("kwargs") or {}
        job_id = (kwargs or {}).get("job_id") if isinstance(kwargs, dict) else None
        corr = _get_corr(headers, task_id)
        _safe_write_audit(payload=dict(
            actor_kind=ActorKind.system,
            user_id=None,
            actor_label=f"beat@{HOST}",
            action=f"task.scheduled {sender}",
            status=AuditStatus.info,
            target_type="job" if job_id else "task",
            target_id=str(job_id) if job_id else None,
            message=None,
            request_id=task_id,
            correlation_id=corr,
            context=_ctx(task=str(sender), eta=(headers or {}).get("eta"), retries=(headers or {}).get("retries")),
        ))

    @signals.task_prerun.connect
    def _task_prerun(sender=None, task_id=None, task=None, args=None, kwargs=None, **_):
        req = getattr(task, "request", None)
        headers = getattr(req, "headers", {}) or {}
        corr = _get_corr(headers, task_id, req)
        triggered_by = headers.get("x-triggered-by") or (kwargs or {}).get("triggered_by")
        job_id = (kwargs or {}).get("job_id")
        target_type = "job" if job_id else "task"
        token = audit_changes_buffer.set([])
        setattr(task, "_audit_token", token)
        setattr(task, "_audit_started_at", time.time())
        setattr(task, "_audit_meta", {
            "correlation_id": corr,
            "triggered_by": str(triggered_by) if triggered_by else None,
            "job_id": str(job_id) if job_id else None,
            "target_type": target_type,
        })
        _safe_write_audit(payload=dict(
            actor_kind=ActorKind.system,
            user_id=str(triggered_by) if triggered_by else None,
            actor_label=f"worker@{HOST}",
            action=f"task.start {sender.name}",
            status=AuditStatus.info,
            target_type=target_type,
            target_id=str(job_id) if job_id else None,
            message=None,
            request_id=task_id,
            correlation_id=corr,
            context=_ctx(args_len=len(args or []), kwargs_keys=list((kwargs or {}).keys())),
        ))

    @signals.task_postrun.connect
    def _task_postrun(sender=None, task_id=None, task=None, args=None, kwargs=None, retval=None, state=None, **_):
        meta = getattr(task, "_audit_meta", {}) or {}
        corr = meta.get("correlation_id")
        job_id = meta.get("job_id")
        target_type = meta.get("target_type") or ("job" if job_id else "task")
        started = getattr(task, "_audit_started_at", None)
        dur_ms = round((time.time() - started) * 1000) if started else None
        _flush_changes(
            user_id=meta.get("triggered_by"),
            actor_label=f"worker@{HOST}",
            task_id=task_id,
            sender_name=sender.name,
            extra_ctx=_ctx(),
            correlation_id=corr,
        )
        token = getattr(task, "_audit_token", None)
        if token is not None:
            try: audit_changes_buffer.reset(token)
            except Exception: pass
        _safe_write_audit(payload=dict(
            actor_kind=ActorKind.system,
            user_id=None,
            actor_label=f"worker@{HOST}",
            action=f"task.finish {sender.name}",
            status=AuditStatus.success if (state or "").upper() == "SUCCESS" else AuditStatus.warning,
            target_type=target_type,
            target_id=str(job_id) if job_id else None,
            message=None,
            request_id=task_id,
            correlation_id=corr,
            context=_ctx(state=state, duration_ms=dur_ms),
        ))

    @signals.task_failure.connect
    def _task_failure(task_id=None, exception=None, traceback=None, sender=None, args=None, kwargs=None, einfo=None, **_):
        req = getattr(sender, "request", None)
        headers = getattr(req, "headers", {}) if req else {}
        corr = _get_corr(headers, task_id, req)
        triggered_by = headers.get("x-triggered-by") or (kwargs or {}).get("triggered_by")
        job_id = (kwargs or {}).get("job_id")
        target_type = "job" if job_id else "task"
        _flush_changes(
            user_id=str(triggered_by) if triggered_by else None,
            actor_label=f"worker@{HOST}",
            task_id=task_id,
            sender_name=sender.name,
            extra_ctx=_ctx(),
            correlation_id=corr,
        )
        try:
            audit_changes_buffer.set(None)
        except Exception:
            pass
        _safe_write_audit(payload=dict(
            actor_kind=ActorKind.system,
            user_id=str(triggered_by) if triggered_by else None,
            actor_label=f"worker@{HOST}",
            action=f"task.fail {sender.name}",
            status=AuditStatus.failed,
            target_type=target_type,
            target_id=str(job_id) if job_id else None,
            message=str(exception),
            request_id=task_id,
            correlation_id=corr,
            context=_ctx(exc=str(type(exception).__name__)),
        ))