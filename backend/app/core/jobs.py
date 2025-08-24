from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import SessionLocal
from app.models.jobs import Job
from app.models.jobs_log import JobLog
from app.models.webhooks import WebhookRecipient
from app.core.email.send_email_report import send_email_report
from app.core.webhook.send_webhook_report import send_webhook_report
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

"""
def process_jobs(db: Session, jobs: list[Job], today: date):
    for job in jobs:
        print(f"JOB:{job.name}")
        job_run_id = uuid.uuid4()
        
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
            webhook_channels = [wh for wh in webhook_objects]

        unsent_webhooks:list[WebhookRecipient] = []
        for wh in webhook_channels:
            already_sent = db.query(JobLog).filter(
                JobLog.job_id == job.id,
                JobLog.channel == wh.type,
                JobLog.timestamp >= datetime(today.year, today.month, today.day),
                JobLog.status == "success"
            ).first()
            if not already_sent:
                unsent_webhooks.append(wh)

        if mail_sent and not unsent_webhooks:
            continue

        try:
            summary = generate_report_summary(db, job)
        except Exception as e:
            log_mailer_job(
                db=db, 
                job_run_id=job_run_id,
                job_id=job.id,
                status="failed",
                error=f"{e}",
                channel="GLOBAL"
            )
            continue

        if job.mailer_id and not mail_sent:
            try:
                send_email_report(db, job, summary)
                log_mailer_job(
                    db=db, 
                    job_run_id=job_run_id, 
                    job_id=job.id, 
                    status="success",
                    channel="EMAIL"
                )
            except Exception as e:
                if "skipped|" in str(e):
                    e = str(e).replace("skipped|", "")
                    log_mailer_job(
                        db=db, 
                        job_run_id=job_run_id, 
                        job_id=job.id, 
                        status="skipped",
                        error=e, 
                        channel="EMAIL"
                    )
                else:
                    log_mailer_job(
                        db=db, 
                        job_run_id=job_run_id,
                        job_id=job.id, 
                        status="failed", 
                        error=str(e), 
                        channel="EMAIL"
                    )

        for webhook in unsent_webhooks:
            try:
                send_webhook_report(db, job, summary, webhook)
                log_mailer_job(
                    db=db, 
                    job_run_id=job_run_id, 
                    job_id=job.id, 
                    status="success", 
                    channel=webhook.type
                )
            except Exception as e:
                if "skipped|" in str(e):
                    e = str(e).replace("skipped|", "")
                    log_mailer_job(
                        db=db, 
                        job_run_id=job_run_id, 
                        job_id=job.id, 
                        status="skipped", 
                        error=e, 
                        channel=webhook.type
                    )
                else:
                    log_mailer_job(
                        db=db, 
                        job_run_id=job_run_id, 
                        job_id=job.id, 
                        status="failed", 
                        error=str(e), 
                        channel=webhook.type
                    )
"""



from datetime import datetime, date
from sqlalchemy.orm import Session

from app.utils.logging import job_log_context, add_log_detail

def process_jobs(
    db: Session,
    jobs: list,
    today: date,
    *,
    force_send: bool = False
) -> None:
    start_of_day = datetime(today.year, today.month, today.day)

    for job in jobs:
        with job_log_context(db, job_id=job.id) as log:
            webhook_channels = []
            if job.webhook_recipients:
                webhook_objects = db.query(WebhookRecipient).filter(
                    WebhookRecipient.id.in_(job.webhook_recipients)
                ).all()
                webhook_channels = [wh for wh in webhook_objects]

            if not force_send:
                mail_sent = db.query(JobLog).filter(
                    JobLog.job_id == job.id,
                    JobLog.finished_at >= start_of_day,
                    JobLog.status.in_(["success", "warning"]),
                ).first()

                unsent_webhooks = []
                if webhook_channels:
                    todays_logs = db.query(JobLog).filter(
                        JobLog.job_id == job.id,
                        JobLog.finished_at >= start_of_day
                    ).all()

                    def channel_had_success_today(ch: str, target_id: str) -> bool:
                        for l in todays_logs:
                            for d in (l.details or []):
                                if (
                                    d.get("channel") == ch
                                    and str(d.get("target_id")) == str(target_id)
                                    and d.get("status") == "success"
                                ):
                                    return True
                        return False

                    for wh in webhook_channels:
                        if not channel_had_success_today(wh.type, wh.id):
                            unsent_webhooks.append(wh)

                if mail_sent and not unsent_webhooks:
                    add_log_detail(log, channel="GLOBAL", target_id=None, status="skipped", error="Nothing to send: already completed for today."
                    )
                    continue
            else:
                unsent_webhooks = webhook_channels[:]

            try:
                summary = generate_report_summary(db, job)
            except Exception as e:
                add_log_detail(log, channel="GLOBAL", target_id=None, status="failed", error=str(e))
                continue

            if job.mailer_id:
                if force_send:
                    should_send_email = True
                else:
                    todays_logs = db.query(JobLog).filter(
                        JobLog.job_id == job.id,
                        JobLog.finished_at >= start_of_day
                    ).all()
                    already_sent_email_today = any(
                        any(
                            d.get("channel") == "EMAIL" and d.get("status") == "success"
                            for d in (l.details or [])
                        )
                        for l in todays_logs
                    )
                    should_send_email = not already_sent_email_today

                if should_send_email:
                    try:
                        send_email_report(db, job, summary)
                        add_log_detail(log, channel="EMAIL", target_id=job.mailer_id, status="success", error=None)
                    except Exception as e:
                        msg = str(e)
                        if "skipped|" in msg:
                            add_log_detail(log, channel="EMAIL", target_id=job.mailer_id, status="skipped",
                                           error=msg.replace("skipped|", ""))
                        else:
                            add_log_detail(log, channel="EMAIL", target_id=job.mailer_id, status="failed", error=msg)
                else:
                    add_log_detail(log, channel="EMAIL", target_id=job.mailer_id, status="skipped", error="Email already sent today.")

            # --- WEBHOOKS ---
            targets = webhook_channels if force_send else unsent_webhooks
            for webhook in targets:
                try:
                    send_webhook_report(db, job, summary, webhook)
                    add_log_detail(log, channel=webhook.type, target_id=webhook.id, status="success", error=None)
                except Exception as e:
                    msg = str(e)
                    if "skipped|" in msg:
                        add_log_detail(log, channel=webhook.type, target_id=webhook.id, status="skipped",
                                       error=msg.replace("skipped|", ""))
                    else:
                        add_log_detail(log, channel=webhook.type, target_id=webhook.id, status="failed", error=msg)
