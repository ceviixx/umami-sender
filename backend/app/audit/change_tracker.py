from __future__ import annotations
from contextvars import ContextVar
from datetime import datetime, date
from typing import Any, Dict, Optional

from sqlalchemy import event
from sqlalchemy.orm import Session as SASession
from sqlalchemy.inspection import inspect as sa_inspect

audit_changes_buffer: ContextVar[Optional[list[dict]]] = ContextVar("audit_changes_buffer", default=None)

SENSITIVE = {"password", "password_hash", "api_key", "bearer_token", "token", "authorization"}
IGNORE    = {"created_at", "updated_at"}
SKIP_TABLES = {"audit_logs"}

def _serialize(v: Any) -> Any:
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    try:
        return str(v) if not isinstance(v, (int, float, bool, type(None))) else v
    except Exception:
        return None

def _pk(obj) -> Optional[str]:
    insp = sa_inspect(obj)
    parts = []
    for col in insp.mapper.primary_key:
        v = getattr(obj, col.key, None)
        if v is None:
            return None 
        parts.append(str(v)) 
    return ":".join(parts)

def snapshot(obj) -> Dict[str, Any]:
    insp = sa_inspect(obj)
    out: Dict[str, Any] = {}
    for col in insp.mapper.column_attrs:
        k = col.key
        if k in IGNORE or k in SENSITIVE:
            continue
        out[k] = _serialize(getattr(obj, k))
    return out

def diff_obj(obj) -> Dict[str, Dict[str, Any]]:
    insp = sa_inspect(obj)
    changes: Dict[str, Dict[str, Any]] = {}
    for col in insp.mapper.column_attrs:
        k = col.key
        if k in IGNORE or k in SENSITIVE:
            continue
        hist = getattr(insp.attrs, k).history
        if not hist.has_changes():
            continue
        old = hist.deleted[0] if hist.deleted else None
        new = hist.added[0] if hist.added else getattr(obj, k)
        if old != new:
            changes[k] = {"old": _serialize(old), "new": _serialize(new)}
    return changes

def record_change(op: str, obj, changes: dict):
    buf = audit_changes_buffer.get()
    if buf is None:
        return
    buf.append({
        "op": op,
        "type": obj.__tablename__,
        "id": _pk(obj),
        "__obj": obj,
        "changes": changes,
    })


@event.listens_for(SASession, "before_flush")
def collect_changes(session: SASession, flush_context, instances):
    for obj in session.new:
        if getattr(obj, "__tablename__", None) in SKIP_TABLES:
            continue
        snap = snapshot(obj)
        if snap:
            record_change("create", obj, {k: {"old": None, "new": v} for k, v in snap.items()})

    for obj in session.dirty:
        if getattr(obj, "__tablename__", None) in SKIP_TABLES:
            continue
        if session.is_modified(obj, include_collections=True):
            changes = diff_obj(obj)
            if changes:
                record_change("update", obj, changes)

    for obj in session.deleted:
        if getattr(obj, "__tablename__", None) in SKIP_TABLES:
            continue
        snap = snapshot(obj)
        if snap:
            record_change("delete", obj, {k: {"old": v, "new": None} for k, v in snap.items()})