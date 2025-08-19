from celery import Celery
from celery.schedules import crontab

app = Celery("UmamiSender", broker="redis://redis:6379/0")

app.conf.beat_schedule = {
    "run-worker-every-minute": {
        "task": "tasks.worker.check_and_run_jobs",
        "schedule": crontab(minute="*/1"),
    },
    "check-instances-daily": {
        "task": "tasks.worker.check_instances_health",
        "schedule": crontab(minute=0, hour=0),
    },
}

from app.core.jobs import run_due_jobs
@app.task(name="tasks.worker.check_and_run_jobs")
def check_and_run_jobs():
    run_due_jobs()


from app.core.instance_health import check_all_instances_health
@app.task(name="tasks.worker.check_instances_health")
def check_instances_health():
    ok, fail = check_all_instances_health()
    print(f"🔍 Instance health done — healthy={ok}, unhealthy={fail}")