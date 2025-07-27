from sqlalchemy.orm import Session
from app.models.jobs import Job
from app.models.umami import Umami
from app.core.umami import fetch_website_summary, fetch_report_summary

def generate_report_summary(db: Session, job: Job) -> dict:

    instance = db.query(Umami).filter_by(id=job.host_id).first()
    if not instance:
        raise Exception(f"No Umami instance found for ID {job.host_id}")
    
    if job.report_type == "summary":
        summary = fetch_website_summary(instance, job)
        summary['period'] = 'yyyy'
    elif job.report_type == "report":
        summary = fetch_report_summary(instance, job)
    if not summary:
        raise Exception("No summary data returned.")

    summary['name'] = job.name

    return summary