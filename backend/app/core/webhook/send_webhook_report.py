from sqlalchemy.orm import Session
from app.models.jobs import Job
from app.models.webhooks import WebhookRecipient
from app.core.webhook.send_webhook import send_webhook
from app.models.template import MailTemplate
from app.core.render_template import render_template
from app.utils.response_clean import process_api_response
import json

def send_webhook_report(db: Session, job: Job, summary: dict, webhook: WebhookRecipient):
    report_type = summary.get("type", "").upper()
    job_report_type = job.report_type.upper()
    sender_type = 'WEBHOOK_' + job_report_type + (f'_{report_type}' if report_type else '') + '_' + webhook.type

    template = db.query(MailTemplate).filter_by(type=job.template_type, sender_type=sender_type).first()
    if not template:
        raise Exception(f"Template not found for {webhook.name} ({webhook.type})")
    
    html_body = render_template(template.content, {
        "summary": summary,
        "job": job,
    })
    html_body = process_api_response(response=html_body, db=db)

    json_body = json.loads(html_body)
    send_webhook(
        webhook=webhook, 
        summary=json_body, 
        job=job
    )


