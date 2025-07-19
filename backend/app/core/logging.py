from sqlalchemy.orm import Session
from app.models.log import MailerJobLog

def log_mailer_job(db: Session, job_id: int, status: str, error: str = None, channel: str = "email"):
    from app.models.log import MailerJobLog

    log = MailerJobLog(
        job_id=job_id,
        status=status,
        error=error,
        channel=channel 
    )
    db.add(log)
    db.commit()