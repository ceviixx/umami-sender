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
from typing import Any, Dict, List, Optional
from datetime import datetime

router = APIRouter(prefix="/logs", tags=["logs"])

def _serialize_row(r) -> Dict[str, Any]:
    # Dauer in ms (falls finished_at fehlt, 0)
    duration_ms = 0
    if r.finished_at and r.started_at:
        duration_ms = int((r.finished_at - r.started_at).total_seconds() * 1000)

    return {
        "job_id": str(r.job_id),
        "job_name": r.job_name,
        "log_id": str(r.log_id),
        "started_at": r.started_at.isoformat() if isinstance(r.started_at, datetime) else r.started_at,
        "finished_at": r.finished_at.isoformat() if isinstance(r.finished_at, datetime) else r.finished_at,
        "status": (r.status or "").lower(),               # "success" | "warning" | "failed" | "running" | "skipped"
        "details": r.details or [],                       # Liste aus {channel, target_id, status, error}
        "count_success": r.count_success or 0,
        "count_failed": r.count_failed or 0,
        "count_skipped": r.count_skipped or 0,
        "duration_ms": duration_ms,
        # Für Sortierung/Anzeige praktisch:
        "sort_ts": (r.finished_at or r.started_at).isoformat() if (r.finished_at or r.started_at) else None,
    }

@router.get("")
def all_logs(request: Request, db: Session = Depends(get_db)):
    """
    Liefert alle Logs des Users. Ein Eintrag == ein Run.
    Sortierung: finished_at DESC, fallback started_at DESC.
    """
    user = Security(request).get_user()

    try:
        rows = (
            db.query(
                Job.id.label("job_id"),
                Job.name.label("job_name"),
                JobLog.id.label("log_id"),
                JobLog.started_at.label("started_at"),
                JobLog.finished_at.label("finished_at"),
                JobLog.status.label("status"),
                JobLog.details.label("details"),
                JobLog.count_success.label("count_success"),
                JobLog.count_failed.label("count_failed"),
                JobLog.count_skipped.label("count_skipped"),
            )
            .join(Job, JobLog.job_id == Job.id)
            .filter(Job.user_id == user.id)
            .order_by(func.coalesce(JobLog.finished_at, JobLog.started_at).desc())
            .all()
        )

        return [_serialize_row(r) for r in rows]

    except Exception as e:
        return send_status_response(
            code="LOGS_ERROR",
            message="Failed to retrieve logs",
            status=500,
            detail=str(e),
        )

@router.get("/{job_id}")
def job_logs(request: Request, job_id: str, db: Session = Depends(get_db)):
    """
    Liefert alle Runs (Logs) für ein bestimmtes Job‑ID.
    """
    user = Security(request).get_user()

    try:
        rows = (
            db.query(
                Job.id.label("job_id"),
                Job.name.label("job_name"),
                JobLog.id.label("log_id"),
                JobLog.started_at.label("started_at"),
                JobLog.finished_at.label("finished_at"),
                JobLog.status.label("status"),
                JobLog.details.label("details"),
                JobLog.count_success.label("count_success"),
                JobLog.count_failed.label("count_failed"),
                JobLog.count_skipped.label("count_skipped"),
            )
            .join(Job, JobLog.job_id == Job.id)
            .filter(
                Job.user_id == user.id,
                Job.id == job_id,
            )
            .order_by(func.coalesce(JobLog.finished_at, JobLog.started_at).desc())
            .all()
        )

        return [_serialize_row(r) for r in rows]

    except Exception as e:
        return send_status_response(
            code="LOGS_ERROR",
            message="Failed to retrieve logs",
            status=500,
            detail=str(e),
        )