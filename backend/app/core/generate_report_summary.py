from sqlalchemy.orm import Session
from app.models.mailer import MailerJob
from app.models.umami import Umami
from app.core.umami import fetch_website_summary

def generate_report_summary(db: Session, job: MailerJob) -> dict:
    instance = db.query(Umami).filter_by(id=job.host_id).first()
    if not instance:
        raise Exception(f"No Umami instance found for ID {job.host_id}")
    
    summary = fetch_website_summary(instance, job)
    if not summary:
        raise Exception("No summary data returned.")

    summary['name'] = job.name
    summary['period'] = 'yyyy'
    return summary