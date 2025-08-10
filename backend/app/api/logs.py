from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, select
from app.database import get_db
from app.models.sender import Sender
from app.models.umami import Umami
from app.models.jobs import Job
from app.models.webhooks import WebhookRecipient
from app.models.jobs_log import JobLog
from app.utils.responses import send_status_response

from app.utils.security import Security

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("")
def get_user_job_logs(request: Request, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    try:
        result = (
            db.query(
                JobLog.id,
                JobLog.timestamp,
                JobLog.status,
                JobLog.error,
                JobLog.channel,
                Job.name
            )
            .join(Job)
            .filter(Job.user_id == user.id)
            .order_by(JobLog.timestamp.desc())
            .all()
        )

        logs = [
            {
                "id": id,
                "name": name,
                "timestamp": timestamp,
                "status": status,
                "error": error,
                "channel": channel
            }
            for id, timestamp, status, error, channel, name in result
        ]

        return logs

    except Exception as e:
        return send_status_response(
            code="LOGS_ERROR",
            message="Failed to retrieve logs",
            status=500,
            detail=str(e)
        )

@router.get("/{job_id}")
def get_user_job_logs(request: Request, job_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    try:
        result = (
            db.query(
                JobLog.id,
                JobLog.timestamp,
                JobLog.status,
                JobLog.error,
                JobLog.channel,
                Job.name
            )
            .join(Job)
            .filter(
                Job.user_id == user.id,
                Job.id == job_id
            )
            .order_by(JobLog.timestamp.desc())
            .all()
        )

        logs = [
            {
                "id": id,
                "name": name,
                "timestamp": timestamp,
                "status": status,
                "error": error,
                "channel": channel
            }
            for id, timestamp, status, error, channel, name in result
        ]

        return logs

    except Exception as e:
        return send_status_response(
            code="LOGS_ERROR",
            message="Failed to retrieve logs",
            status=500,
            detail=str(e)
        )