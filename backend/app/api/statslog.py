# app/api/api_v1/endpoints/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.database import get_db
from app.models.log import MailerJobLog

router = APIRouter()

@router.get("/stats/log")
def get_job_log_chart(db: Session = Depends(get_db)):
    data = (
        db.query(
            cast(MailerJobLog.timestamp, Date).label("date"),
            func.count(func.nullif(MailerJobLog.status != "success", True)).label("success"),
            func.count(func.nullif(MailerJobLog.status != "failed", True)).label("failed"),
            func.count(func.nullif(MailerJobLog.status != "skipped", True)).label("skipped"),
        )
        .group_by(cast(MailerJobLog.timestamp, Date))
        .order_by(cast(MailerJobLog.timestamp, Date))
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