from sqlalchemy.orm import Session
from app.models.jobs_log import JobLog
import uuid

def log_mailer_job(db: Session, job_run_id: uuid, job_id: int, status: str, error: str = None, channel: str = "email"):
    from app.models.jobs_log import JobLog

    log = JobLog(
        job_id=job_id,
        run=job_run_id,
        status=status,
        error=error,
        channel=channel
    )
    db.add(log)
    db.commit()