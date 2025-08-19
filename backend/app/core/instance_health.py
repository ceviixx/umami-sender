# app/core/instance_health.py
from datetime import datetime, timezone
import requests
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import SessionLocal
from app.models.umami import Umami, UmamiType
from typing import Optional, Tuple

CLOUD_BASE = "https://api.umami.is/v1"

def _cloud_me_ok(api_key: str) -> tuple[bool, Optional[str]]:
    if not api_key:
        return (False, 'NO_API_KEY')
    try:
        r = requests.get(
            f"{CLOUD_BASE}/me",
            headers={"x-umami-api-key": api_key},
            timeout=10,
        )
        return (r.status_code == 200, None)
    except requests.RequestException as e:
        return (False, str(e))

def _self_hosted_me_ok(hostname: str, bearer_token: str) -> tuple[bool, Optional[str]]:
    if not hostname or not bearer_token:
        return (False, 'NO_HOST_OR_BEARER')
    base = hostname.rstrip("/")
    # Falls deine Self‑Hosted‑API anders liegt, hier anpassen:
    url = f"{base}/api/me"
    try:
        r = requests.get(
            url,
            headers={"Authorization": f"Bearer {bearer_token}"},
            timeout=10,
        )
        return (r.status_code == 200, None)
    except requests.RequestException as e:
        return (False, str(e))

def check_all_instances_health() -> tuple[int, int]:
    """
    Prüft alle Instanzen und setzt `is_healthy` auf True/False.
    Rückgabe: (anzahl_true, anzahl_false)
    """
    ok_count = fail_count = 0
    db: Session = SessionLocal()
    try:
        instances = db.execute(select(Umami)).scalars().all()
        for inst in instances:
            if inst.type == UmamiType.cloud:
                is_ok, error = _cloud_me_ok(inst.api_key)
            elif inst.type == UmamiType.self_hosted:
                is_ok, error = _self_hosted_me_ok(inst.hostname, inst.bearer_token)
            else: 
                print(f"No valid type ({inst.type}) for {inst.name}")

            inst.is_healthy = bool(is_ok)
            inst.health_response = error
            inst.last_check_at = datetime.now(timezone.utc)

            if is_ok:
                ok_count += 1
            else:
                fail_count += 1

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    return ok_count, fail_count
