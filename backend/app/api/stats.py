from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, select, case
from app.database import get_db
from app.models.sender import Sender
from app.models.umami import Umami
from app.models.jobs import Job
from app.models.webhooks import WebhookRecipient
from app.models.jobs_log import JobLog
from app.utils.responses import send_status_response

from app.utils.security import Security

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("")
def get_dashboard_stats(request: Request, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    try:
        senders_count = db.query(Sender).filter(Sender.user_id == user.id).count()
        umami_count = db.query(Umami).filter(Umami.user_id == user.id).count()
        jobs_count = db.query(Job).filter(Job.user_id == user.id).count()
        webhooks_count = db.query(WebhookRecipient).filter(WebhookRecipient.user_id == user.id).count()

        return {
            "senders": senders_count,
            "umami": umami_count,
            "jobs": jobs_count,
            "webhooks": webhooks_count,
        }
    except Exception as e:
        return send_status_response(
            code="STATS_ERROR",
            message="Failed to retrieve dashboard statistics",
            status=500,
            detail=str(e)
        )

from datetime import datetime
from fastapi import Depends, Request
from sqlalchemy import func, case, cast
from sqlalchemy.sql import select
from sqlalchemy.types import Date
from sqlalchemy.orm import Session
from app.models.jobs_log import JobLog
from app.utils.responses import send_status_response


@router.get("/log")
def get_job_log_chart(request: Request, db: Session = Depends(get_db)):
    """
    Chart-Daten pro Tag über alle Job-Runs des Users.
    Nutzt den Root-Status des JobLog (kein Run-Grouping mehr).
    """
    user = Security(request).get_user()

    try:
        job_ids_subq = select(Job.id).where(Job.user_id == user.id)

        day_expr = cast(func.coalesce(JobLog.finished_at, JobLog.started_at), Date)

        data = (
            db.query(
                day_expr.label("date"),
                func.sum(case((JobLog.status == "success", 1), else_=0)).label("success"),
                func.sum(case((JobLog.status == "failed", 1), else_=0)).label("failed"),
                func.sum(case((JobLog.status == "warning", 1), else_=0)).label("skipped"),
            )
            .filter(JobLog.job_id.in_(job_ids_subq))
            .filter(JobLog.status != "running")  # laufende Runs i. d. R. nicht im Chart
            .group_by(day_expr)
            .order_by(day_expr.asc())
            .all()
        )

        return [
            {
                "date": row.date.isoformat(),
                "success": int(row.success or 0),
                "failed": int(row.failed or 0),
                "warning": int(row.skipped or 0),
            }
            for row in data
        ]

    except Exception as e:
        return send_status_response(
            code="LOG_STATS_ERROR",
            message="Failed to load job log chart data",
            status=500,
            detail=str(e),
        )
