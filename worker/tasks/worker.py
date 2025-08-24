from celery import Celery
from celery.schedules import crontab

from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from app.database import engine
import app.audit.celery_audit

app = Celery("UmamiSender", broker="redis://redis:6379/0")

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

app.conf.update(
    imports=("app.audit.celery_audit", "tasks.worker"),
)

app.conf.beat_schedule = {
    "run-worker-every-minute": {
        "task": "tasks.worker.check_and_run_jobs",
        "schedule": crontab(minute="*/1"),
    },
    "check-instances-daily": {
        "task": "tasks.worker.check_instances_health",
        "schedule": crontab(minute=0, hour=0),
    },
    "purge-audit-logs-daily": {
        "task": "tasks.worker.purge_old_audit_logs_system",
        "schedule": crontab(minute=0, hour=0),
    },
    "purge-audit-logs-daily": {
        "task": "tasks.worker.purge_old_audit_logs_user",
        "schedule": crontab(minute=0, hour=0),
    },
}


from app.core.jobs import run_due_jobs
@app.task(name="tasks.worker.check_and_run_jobs")
def check_and_run_jobs():
    run_due_jobs()

from app.core.instance_health import check_all_instances_health
@app.task(name="tasks.worker.check_instances_health")
def check_instances_health():
    ok, fail = check_all_instances_health()
    print(f"🔍 Instance health done — healthy={ok}, unhealthy={fail}")


@app.task(name="tasks.worker.purge_old_audit_logs_system")
def purge_old_audit_logs_system(retention_days: int | None = None) -> int:
    days = retention_days or 30
    with SessionLocal() as db:
        result = db.execute(
            text("""
                DELETE FROM audit_logs
                WHERE created_at < NOW() - (:days * INTERVAL '1 day')
                AND actor='system'
            """),
            {"days": days},
        )
        db.commit()
        deleted = result.rowcount if result.rowcount is not None else 0
        print(f"🧹 purge_old_audit_logs: deleted={deleted}, days={days}")
        return deleted

@app.task(name="tasks.worker.purge_old_audit_logs_user")
def purge_old_audit_logs_user(retention_days: int | None = None) -> int:
    days = retention_days or 90
    with SessionLocal() as db:
        result = db.execute(
            text("""
                DELETE FROM audit_logs
                WHERE created_at < NOW() - (:days * INTERVAL '1 day')
                 AND actor='user'
            """),
            {"days": days},
        )
        db.commit()
        deleted = result.rowcount if result.rowcount is not None else 0
        print(f"🧹 purge_old_audit_logs: deleted={deleted}, days={days}")
        return deleted
