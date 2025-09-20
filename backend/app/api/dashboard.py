from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.jobs import Job
from app.models.jobs_log import JobLog
from app.models.sender import Sender
from app.utils.security import authenticated_user
from app.utils.responses import send_status_response
from sqlalchemy import func

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("")
def get_dashboard_data(
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    try:
        # Umami Instanzen
        umami_instances = []
        from app.models.umami import Umami
        umamis = db.query(Umami).filter(Umami.user_id == user.id).all()
        for u in umamis:
            umami_instances.append({
                "name": u.name,
                "type": u.type,
                "is_healthy": u.is_healthy
            })
            
        # Jobs
        jobs = db.query(Job).filter(Job.user_id == user.id).order_by(Job.created_at.desc()).all()

        # Logs (letzte 20)
        logs = (
            db.query(JobLog)
            .join(Job, JobLog.job_id == Job.id)
            .filter(Job.user_id == user.id)
            .order_by(JobLog.finished_at.desc())
            .limit(20)
            .all()
        )

        # Logs der letzten 7 Tage für Statistik
        from datetime import datetime, timedelta
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        logs_last_7_days = [l for l in logs if l.finished_at and l.finished_at >= seven_days_ago]
        failed_last_7_days = sum(1 for l in logs_last_7_days if l.status == "failed")
        success_last_7_days = sum(1 for l in logs_last_7_days if l.status == "success")
        total_last_7_days = len(logs_last_7_days)
        success_rate = int((success_last_7_days / total_last_7_days) * 100) if total_last_7_days > 0 else 0

        # Problem Jobs: Sammle alle Jobs mit Status failed oder warning, je Job nur einmal, Fehler zusammengefasst
        problem_logs = [l for l in logs if l.status in ("failed", "warning")]
        problem_jobs_dict = {}
        for log in problem_logs:
            job_id = str(log.job_id)
            if job_id not in problem_jobs_dict:
                # Fehlertext aus details extrahieren
                errors = []
                details = log.details or []
                if details and isinstance(details, list):
                    for d in details:
                        if d.get("status") in ("failed", "warning") and d.get("error"):
                            errors.append(str(d["error"]))
                # Fallback: falls kein Fehlertext, Status als Fehler
                if not errors:
                    errors = [log.status]
                problem_jobs_dict[job_id] = {
                    "id": job_id,
                    "name": log.job.name if log.job else None,
                    "errors": "; ".join(errors),
                    "last_run": log.finished_at or log.started_at
                }
        # Sortiere nach last_run absteigend und nimm die neuesten drei
        problem_jobs = sorted(problem_jobs_dict.values(), key=lambda x: x["last_run"], reverse=True)[:3]

        # Sender
        senders = db.query(Sender).filter(Sender.user_id == user.id).all()

        # Webhooks
        from app.models.webhooks import WebhookRecipient
        webhooks = db.query(WebhookRecipient).filter(WebhookRecipient.user_id == user.id).all()



        # Statistiken
        stats = {
            "umami": len(umamis),
            "jobs": len(jobs),
            "mailer": len(senders),
            "webhook": len(webhooks),
            "failed_last_7_days": failed_last_7_days,
            "success_last_7_days": success_last_7_days,
            "success_rate_last_7_days": success_rate,
        }

        # Filter: nur aktive Jobs
        jobs_active = [j for j in jobs if j.is_active]
        # Aggregiere die Anzahl der Status pro Tag
        from collections import defaultdict
        activity_by_date = defaultdict(lambda: {"success": 0, "failed": 0, "warning": 0})
        # Alle Logs berücksichtigen, egal ob Job aktiv oder Zeitraum
        all_logs = db.query(JobLog).join(Job, JobLog.job_id == Job.id).filter(Job.user_id == user.id).all()
        for l in all_logs:
            if l.finished_at:
                date_str = l.finished_at.date().isoformat()
                if l.status in ("success", "failed", "warning"):
                    activity_by_date[date_str][l.status] += 1
        # Erzeuge sortierte Liste mit Datum und Counts
        activity = [
            {"date": date, "success": counts["success"], "failed": counts["failed"], "warning": counts["warning"]}
            for date, counts in sorted(activity_by_date.items())
        ]
        # Last Runs: letzte 3 Job-Logs mit Name, Startdatum, Dauer
        last_runs = []
        for log in logs[:3]:
            duration_ms = 0
            if log.started_at and log.finished_at:
                duration_ms = int((log.finished_at - log.started_at).total_seconds() * 1000)
            last_runs.append({
                "name": log.job.name if log.job else None,
                "start": log.started_at.isoformat() if log.started_at else None,
                "duration_ms": duration_ms,
                "status": log.status
            })

        # Next Runs: Berechne für jeden aktiven Job die nächsten drei geplanten Runs
        from datetime import datetime, timedelta, time, date
        import calendar
        now = datetime.utcnow()
        next_runs = []
        for job in jobs_active:
            exec_time = job.execution_time
            runs = []
            if job.frequency == "daily":
                count = 0
                i = 0
                while count < 3:
                    run_date = date.today() + timedelta(days=i)
                    next_run_dt = datetime.combine(run_date, exec_time)
                    if next_run_dt >= now:
                        runs.append(next_run_dt)
                        count += 1
                    i += 1
            elif job.frequency == "weekly":
                today_weekday = now.weekday()
                for i in range(3):
                    days_ahead = (job.day - today_weekday + 7 * i) % 7 + 7 * i
                    run_date = date.today() + timedelta(days=days_ahead)
                    next_run_dt = datetime.combine(run_date, exec_time)
                    runs.append(next_run_dt)
            elif job.frequency == "monthly":
                year = now.year
                month = now.month
                run_day = job.day
                count = 0
                i = 0
                while count < 3:
                    m = month + i
                    y = year + (m - 1) // 12
                    m = (m - 1) % 12 + 1
                    try:
                        run_date = date(y, m, run_day)
                    except ValueError:
                        last_day = calendar.monthrange(y, m)[1]
                        run_date = date(y, m, last_day)
                    next_run_dt = datetime.combine(run_date, exec_time)
                    if next_run_dt >= now:
                        runs.append(next_run_dt)
                        count += 1
                    i += 1
            for run_dt in runs:
                next_runs.append({
                    "name": job.name,
                    "type": job.frequency,
                    "next_run": run_dt.isoformat()
                })
        # Sortiere nach Datum und nimm die nächsten 3 (über alle Jobs)
        next_runs = sorted(next_runs, key=lambda x: x["next_run"])[:3]

        return {
            "stats": stats,
            "activity": activity,
            "last_runs": last_runs,
            "next_runs": next_runs,
            "problem_jobs": problem_jobs,
            "instances": umami_instances,
        }
    except Exception as e:
        return send_status_response(
            code="DASHBOARD_ERROR",
            message="Failed to retrieve dashboard data",
            status=500,
            detail=str(e)
        )
