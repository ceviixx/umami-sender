from sqlalchemy.orm import Session
from app.models.mailer import MailerJob
from app.models.webhooks import WebhookRecipient
from app.core.send_webhook import send_webhook
from app.models.template import MailTemplate
from app.core.render_template import render_webhook_template
import json

def send_webhook_report(db: Session, job: MailerJob, summary: dict):
    recipients = db.query(WebhookRecipient).filter(WebhookRecipient.id.in_(job.webhook_recipients)).all()
    if not recipients:
        raise Exception("No webhook recipients configured.")

    for webhook in recipients:
        webhook_type = 'WEBHOOK_' + webhook.type
        template = db.query(MailTemplate).filter_by(type=job.template_type, sender_type=webhook_type).first()
        if not template:
            raise Exception("Mail template not found.", webhook.type)
        
        template_json = json.dumps(template.json)
        html_body = render_webhook_template(template_json, {
            "summary": summary,
            "job": job,
        })

        json_body = json.loads(html_body)
        
        send_webhook(
            webhook, 
            json_body, 
            job
        )


