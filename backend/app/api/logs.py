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
from typing import Dict, Tuple
from datetime import datetime

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("")
def all_logs(request: Request, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    try:
        rows = (
            db.query(
                Job.id.label("job_id"),
                Job.name.label("job_name"),
                JobLog.id.label("log_id"),
                JobLog.run.label("run_id"),
                JobLog.timestamp.label("ts"),
                JobLog.status.label("status"),
                JobLog.error.label("error"),
                JobLog.channel.label("channel"),
            )
            .join(Job, JobLog.job_id == Job.id)
            .filter(Job.user_id == user.id)
            .order_by(JobLog.timestamp.desc())
            .all()
        )

        def aggregate_status(statuses: list[str]) -> str:
            s = [ (st or "").lower() for st in statuses ]
            if any(st in ("failed", "error") for st in s):
                return "failed"
            if any(st not in ("success",) for st in s):
                return "warning"
            return "success"
        
        groups: Dict[Tuple[str, str], dict] = {}
        for r in rows:
            job_id = str(r.job_id)
            run_or_log = str(r.run_id or r.log_id)
            key = (job_id, run_or_log)

            if key not in groups:
                groups[key] = {
                    "id": job_id,
                    "run": run_or_log,
                    "name": r.job_name,
                    "details": [],
                    "_statuses": [],
                    "_latest_ts": r.ts,
                }

            groups[key]["details"].append({
                "timestamp": r.ts.isoformat() if isinstance(r.ts, datetime) else str(r.ts),
                "status": (r.status or "").lower(),
                "error": r.error,
                "channel": (r.channel or "").upper(),
            })
            groups[key]["_statuses"].append(r.status or "")
            if r.ts and r.ts > groups[key]["_latest_ts"]:
                groups[key]["_latest_ts"] = r.ts

        result = []
        for g in groups.values():
            g["status"] = aggregate_status(g["_statuses"])
            g.pop("_statuses", None)
            g["details"].sort(key=lambda d: d["timestamp"])
            result.append(g)

        result.sort(key=lambda g: g["_latest_ts"], reverse=True)
        for g in result:
            g.pop("_latest_ts", None)

        return result

    except Exception as e:
        return send_status_response(
            code="LOGS_ERROR",
            message="Failed to retrieve logs",
            status=500,
            detail=str(e)
        )

@router.get("/{job_id}")
def job_logs(request: Request, job_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    try:
        rows = (
            db.query(
                Job.id.label("job_id"),
                Job.name.label("job_name"),
                JobLog.id.label("log_id"),
                JobLog.run.label("run_id"),
                JobLog.timestamp.label("ts"),
                JobLog.status.label("status"),
                JobLog.error.label("error"),
                JobLog.channel.label("channel"),
            )
            .join(Job, JobLog.job_id == Job.id)
            .filter(
                Job.user_id == user.id,
                Job.id == job_id
            )
            .order_by(JobLog.timestamp.desc())
            .all()
        )

        def aggregate_status(statuses: list[str]) -> str:
            s = [ (st or "").lower() for st in statuses ]
            if any(st in ("failed", "error") for st in s):
                return "failed"
            if any(st not in ("success",) for st in s):
                return "warning"
            return "success"
        
        groups: Dict[Tuple[str, str], dict] = {}
        for r in rows:
            job_id = str(r.job_id)
            run_or_log = str(r.run_id or r.log_id)
            key = (job_id, run_or_log)

            if key not in groups:
                groups[key] = {
                    "id": job_id,
                    "run": run_or_log,
                    "name": r.job_name,
                    "details": [],
                    "_statuses": [],
                    "_latest_ts": r.ts,
                }

            groups[key]["details"].append({
                "timestamp": r.ts.isoformat() if isinstance(r.ts, datetime) else str(r.ts),
                "status": (r.status or "").lower(),
                "error": r.error,
                "channel": (r.channel or "").upper(),
            })
            groups[key]["_statuses"].append(r.status or "")
            if r.ts and r.ts > groups[key]["_latest_ts"]:
                groups[key]["_latest_ts"] = r.ts

        result = []
        for g in groups.values():
            g["status"] = aggregate_status(g["_statuses"])
            g.pop("_statuses", None)
            g["details"].sort(key=lambda d: d["timestamp"])
            result.append(g)
            
        result.sort(key=lambda g: g["_latest_ts"], reverse=True)
        for g in result:
            g.pop("_latest_ts", None)

        return result

    except Exception as e:
        return send_status_response(
            code="LOGS_ERROR",
            message="Failed to retrieve logs",
            status=500,
            detail=str(e)
        )