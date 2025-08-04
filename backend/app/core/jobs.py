from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import SessionLocal
from app.models.jobs import Job
from app.models.jobs_log import JobLog
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

    jobs = db.query(Job).filter(
        Job.is_active == True,
        Job.frequency == "daily",
        Job.execution_time >= lower_bound,
        Job.execution_time <= upper_bound
    ).all()

    process_jobs(db, jobs, now.date())

def run_weekly_jobs(db: Session, now: datetime):
    lower_bound = (now - timedelta(seconds=30)).time()
    upper_bound = (now + timedelta(seconds=30)).time()
    weekday = now.weekday()

    jobs = db.query(Job).filter(
        Job.is_active == True,
        Job.frequency == "weekly",
        Job.day == weekday,
        Job.execution_time >= lower_bound,
        Job.execution_time <= upper_bound
    ).all()

    process_jobs(db, jobs, now.date())

def run_monthly_jobs(db: Session, now: datetime):
    lower_bound = (now - timedelta(seconds=30)).time()
    upper_bound = (now + timedelta(seconds=30)).time()
    today = now.day

    jobs = db.query(Job).filter(
        Job.is_active == True,
        Job.frequency == "monthly",
        Job.day == today,
        Job.execution_time >= lower_bound,
        Job.execution_time <= upper_bound
    ).all()

    process_jobs(db, jobs, now.date())


def process_jobs(db: Session, jobs: list[Job], today: date):
    for job in jobs:
        
        mail_sent = db.query(JobLog).filter(
            JobLog.job_id == job.id,
            JobLog.channel == "EMAIL",
            JobLog.timestamp >= datetime(today.year, today.month, today.day),
            JobLog.status == "success"
        ).first()

        webhook_channels = []
        if job.webhook_recipients:
            webhook_objects = db.query(WebhookRecipient).filter(
                WebhookRecipient.id.in_(job.webhook_recipients)
            ).all()
            webhook_channels = [(wh.id, wh.type) for wh in webhook_objects]

        unsent_webhooks = []
        for webhook_id, channel_type in webhook_channels:
            already_sent = db.query(JobLog).filter(
                JobLog.job_id == job.id,
                JobLog.channel == channel_type,
                JobLog.timestamp >= datetime(today.year, today.month, today.day),
                JobLog.status == "success"
            ).first()
            if not already_sent:
                unsent_webhooks.append((webhook_id, channel_type))

        if mail_sent and not unsent_webhooks:
            continue

        try:
            summary = generate_report_summary(db, job)
        except Exception as e:
            log_mailer_job(db, job.id, "failed", f"{e}", channel="ALL")
            continue

        if job.sender_id and not mail_sent:
            try:
                send_email_report(db, job, summary)
                log_mailer_job(db, job.id, "success", channel="EMAIL")
            except Exception as e:
                log_mailer_job(db, job.id, "failed", str(e), channel="EMAIL")

        for webhook_id, channel_type in unsent_webhooks:
            try:
                send_webhook_report(db, job, summary)
                log_mailer_job(db, job.id, "success", channel=channel_type)
            except Exception as e:
                log_mailer_job(db, job.id, "failed", str(e), channel=channel_type)
