from sqlalchemy.orm import Session
from app.models.jobs import Job
from app.models.sender import Sender
from app.models.template import MailTemplate
from app.core.email.send_email import send_email
from app.core.render_template import render_template
from app.utils.response_clean import process_api_response

def send_email_report(db: Session, job: Job, summary: dict):
    sender = db.query(Sender).filter_by(id=job.mailer_id).first()
    if not sender:
        raise Exception(f"No sender found for ID {job.mailer_id}")

    report_type = summary.get("type", "").upper()
    job_report_type = job.report_type.upper()
    sender_type = 'EMAIL_' + job_report_type + (f'_{report_type}' if report_type else '')

    template = db.query(MailTemplate).filter_by(
        type=job.template_type, 
        sender_type=sender_type
    ).first()

    if not template:
        raise Exception(f"Mail template not found. {sender_type}")

    if not job.email_recipients:
        raise Exception("skipped|No email recipients specified for the job.")

    html_body = render_template(template.content, {
        "summary": summary,
        "job": job
    })
    html_body = process_api_response(response=html_body, db=db)

    text_body = "No plain text available"

    send_email(
        sender=sender,
        to=job.email_recipients,
        subject=f"Umami Report – {job.name}",
        body=text_body,
        html=html_body,
    )