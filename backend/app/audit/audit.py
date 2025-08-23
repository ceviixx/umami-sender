from typing import Optional, Mapping, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditLog, ActorKind, AuditStatus

SENSITIVE_KEYS = {"password", "password_hash", "token", "api_key", "authorization", "bearer"}

def _mask(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, str):
        return "****" if value else value
    return "****"

def sanitize(data: Optional[Mapping[str, Any]]) -> Optional[dict]:
    if not data:
        return None
    out = {}
    for k, v in data.items():
        out[k] = _mask(v) if k and k.lower() in SENSITIVE_KEYS else v
    return out

def write_audit(
    db: Session,
    *,
    actor_kind: ActorKind,
    user_id: Optional[str],
    actor_label: Optional[str],
    action: str,
    status: AuditStatus,
    target_type: Optional[str],
    target_id: Optional[str],
    message: Optional[str],
    request_id: Optional[str],
    correlation_id: Optional[str] = None,
    ip: Optional[str] = None,
    user_agent: Optional[str] = None,
    context: Optional[Mapping[str, Any]] = None,
    changes: Optional[Mapping[str, Any]] = None,
) -> AuditLog:
    log = AuditLog(
        actor_kind=actor_kind,
        user_id=user_id,
        actor_label=actor_label,
        action=action,
        status=status,
        target_type=target_type,
        target_id=target_id,
        message=message,
        request_id=request_id,
        correlation_id=correlation_id,
        ip=ip,
        user_agent=user_agent,
        context=sanitize(context) if context else None,
        changes=changes if changes else None,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
