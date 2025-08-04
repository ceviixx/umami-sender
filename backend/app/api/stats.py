from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.database import get_db
from app.models.sender import Sender
from app.models.umami import Umami
from app.models.jobs import Job
from app.models.webhooks import WebhookRecipient
from app.models.jobs_log import JobLog
from app.utils.responses import send_status_response

router = APIRouter()

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/")
def get_dashboard_stats(db: Session = Depends(get_db)):
    try:
        senders_count = db.query(Sender).count()
        umami_count = db.query(Umami).count()
        jobs_count = db.query(Job).count()
        webhooks_count = db.query(WebhookRecipient).count()

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

@router.get("/log")
def get_job_log_chart(db: Session = Depends(get_db)):
    try:
        data = (
            db.query(
                cast(JobLog.timestamp, Date).label("date"),
                func.count(func.nullif(JobLog.status != "success", True)).label("success"),
                func.count(func.nullif(JobLog.status != "failed", True)).label("failed"),
                func.count(func.nullif(JobLog.status != "skipped", True)).label("skipped"),
            )
            .group_by(cast(JobLog.timestamp, Date))
            .order_by(cast(JobLog.timestamp, Date))
            .all()
        )

        return [
            {
                "date": row.date.isoformat(),
                "success": row.success,
                "failed": row.failed,
                "skipped": row.skipped,
            }
            for row in data
        ]
    except Exception as e:
        return send_status_response(
            code="LOG_STATS_ERROR",
            message="Failed to load job log chart data",
            status=500,
            detail=str(e)
        )