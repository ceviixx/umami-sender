from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import SessionLocal
from app.models.mailer import MailerJob
from app.models.log import MailerJobLog
from app.models.webhooks import WebhookRecipient
from app.core.logging import log_mailer_job
from app.core.send_email_report import send_email_report
from app.core.send_webhook_report import send_webhook_report
from app.core.generate_report_summary import generate_report_summary


def run_due_jobs():
    db: Session = SessionLocal()
    now = datetime.utcnow()

    run_daily_jobs(db, now)
    run_weekly_jobs(db, now)
    run_monthly_jobs(db, now)

    db.close()




def run_daily_jobs(db: Session, now: datetime):
    lower_bound = (now - timedelta(seconds=30)).time()
    upper_bound = (now + timedelta(seconds=30)).time()

    jobs = db.query(MailerJob).filter(
        MailerJob.is_active == True,
        MailerJob.frequency == "daily",
        MailerJob.execution_time >= lower_bound,
        MailerJob.execution_time <= upper_bound
    ).all()

    process_jobs(db, jobs, now.date())

def run_weekly_jobs(db: Session, now: datetime):
    lower_bound = (now - timedelta(seconds=30)).time()
    upper_bound = (now + timedelta(seconds=30)).time()
    weekday = now.weekday()

    jobs = db.query(MailerJob).filter(
        MailerJob.is_active == True,
        MailerJob.frequency == "weekly",
        MailerJob.day == weekday,
        MailerJob.execution_time >= lower_bound,
        MailerJob.execution_time <= upper_bound
    ).all()

    process_jobs(db, jobs, now.date())

def run_monthly_jobs(db: Session, now: datetime):
    lower_bound = (now - timedelta(seconds=30)).time()
    upper_bound = (now + timedelta(seconds=30)).time()
    today = now.day

    jobs = db.query(MailerJob).filter(
        MailerJob.is_active == True,
        MailerJob.frequency == "monthly",
        MailerJob.day == today,
        MailerJob.execution_time >= lower_bound,
        MailerJob.execution_time <= upper_bound
    ).all()

    process_jobs(db, jobs, now.date())


def process_jobs(db: Session, jobs: list[MailerJob], today: date):
    for job in jobs:
        
        # 📧 E-Mail Check
        mail_sent = db.query(MailerJobLog).filter(
            MailerJobLog.job_id == job.id,
            MailerJobLog.channel == "EMAIL",
            MailerJobLog.timestamp >= datetime(today.year, today.month, today.day),
            MailerJobLog.status == "success"
        ).first()

        # 🔗 Webhook-IDs → Empfänger auflösen
        webhook_channels = []
        if job.webhook_recipients:
            webhook_objects = db.query(WebhookRecipient).filter(
                WebhookRecipient.id.in_(job.webhook_recipients)
            ).all()
            webhook_channels = [(wh.id, wh.type) for wh in webhook_objects]

        # 🔎 Noch nicht versendete Webhooks
        unsent_webhooks = []
        for webhook_id, channel_type in webhook_channels:
            already_sent = db.query(MailerJobLog).filter(
                MailerJobLog.job_id == job.id,
                MailerJobLog.channel == channel_type,
                MailerJobLog.timestamp >= datetime(today.year, today.month, today.day),
                MailerJobLog.status == "success"
            ).first()
            if not already_sent:
                unsent_webhooks.append((webhook_id, channel_type))

        if mail_sent and not unsent_webhooks:
            continue  # Nichts zu tun

        # 📝 Create summary
        try:
            summary = generate_report_summary(db, job)
        except Exception as e:
            print(f"❌ Failed to fetch summary for job {job.id}: {e}")
            continue

        # ✉️ Sende E-Mail
        if job.sender_id and not mail_sent:
            try:
                send_email_report(db, job, summary)
                log_mailer_job(db, job.id, "success", channel="EMAIL")
                # print(f"📧 Email sent for job {job.id}")
            except Exception as e:
                log_mailer_job(db, job.id, "failed", str(e), channel="EMAIL")
                # print(f"❌ Email failed for job {job.id}: {e}")

        # 🌐 Sende Webhooks
        for webhook_id, channel_type in unsent_webhooks:
            try:
                send_webhook_report(db, job, summary)
                log_mailer_job(db, job.id, "success", channel=channel_type)
                # print(f"🔗 Webhook {channel_type} sent for job {job.id}")
            except Exception as e:
                log_mailer_job(db, job.id, "failed", str(e), channel=channel_type)
                # print(f"❌ Webhook {channel_type} failed for job {job.id}: {e}")
