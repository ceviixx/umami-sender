from celery import Celery
from celery.schedules import crontab
from app.core.jobs import run_due_jobs

app = Celery("UmamiSender", broker="redis://redis:6379/0")

app.conf.beat_schedule = {
    "run-worker-every-minute": {
        "task": "tasks.worker.check_and_run_jobs",
        "schedule": crontab(minute="*/1"),
    },
}

@app.task(name="tasks.worker.check_and_run_jobs")
def check_and_run_jobs():
    # print("⏰ start job check")
    run_due_jobs()

@app.task(name="tasks.worker.debug_task")
def debug_task():
    print("✅ Celery is running.")