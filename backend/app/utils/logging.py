# app/services/job_logging.py
from contextlib import contextmanager
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.jobs_log import JobLog

def _aggregate_status_from_details(details: list[str]) -> str:
    if not details:
        return "skipped"  # Nichts getan
    statuses = [d.get("status") for d in details]
    if all(s == "success" for s in statuses):
        return "success"
    if all(s == "failed" for s in statuses):
        return "failed"
    # Mischung oder enthaltene "skipped"/"failed" → warning
    return "warning"

def add_log_detail(log: JobLog, *, channel: str, target_id: Optional[str], status: str, error: Optional[str] = None) -> None:
    d = (log.details or [])
    d.append({
        "channel": channel,
        "target_id": str(target_id) if target_id is not None else None,
        "status": status,
        "error": error
    })
    log.details = d

    # Zähler pflegen
    if status == "success":
        log.count_success += 1
    elif status == "failed":
        log.count_failed += 1
    elif status == "skipped":
        log.count_skipped += 1

@contextmanager
def job_log_context(db: Session, *, job_id) -> JobLog:
    log = JobLog(job_id=job_id, started_at=datetime.utcnow(), status="running", details=[])
    db.add(log)
    db.flush()  # ID verfügbar

    try:
        yield log

        # Status aus Details verdichten
        log.status = _aggregate_status_from_details(log.details)
    except Exception as e:
        # Unerwarteter Fehler auf Run-Ebene
        add_log_detail(log, channel="GLOBAL", target_id=None, status="failed", error=str(e))
        log.status = "failed"
        raise
    finally:
        log.finished_at = datetime.utcnow()
        db.commit()
