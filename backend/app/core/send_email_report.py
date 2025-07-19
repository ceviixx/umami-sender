from sqlalchemy.orm import Session
from app.models.mailer import MailerJob
from app.models.sender import Sender
from app.models.template import MailTemplate
from app.core.send_email import send_email
from app.core.render_template import render_mail_template

def send_email_report(db: Session, job: MailerJob, summary: dict):
    sender = db.query(Sender).filter_by(id=job.sender_id).first()
    if not sender:
        raise Exception(f"No sender found for ID {job.sender_id}")

    template = db.query(MailTemplate).filter_by(type=job.template_type, sender_type='EMAIL').first()
    if not template:
        raise Exception("Mail template not found.")

    html_body = render_mail_template(template.html, {
        "summary": summary,
        "job": job,
    })

    text_body = "No plain text available"

    send_email(
        sender=sender,
        to=job.email_recipients,
        subject=f"Umami Report – {job.name}",
        body=text_body,
        html=html_body,
    )