import base64
import os
from typing import Optional, Dict
from sqlalchemy.orm import Session

from app.models.jobs import Job
from app.models.umami import Umami
from app.models.system_settings import SystemSettings
from app.core.umami import fetch_website_summary, fetch_report_summary


# ----------------------------- Public API -----------------------------

def generate_report_summary(db: Session, job: Job) -> dict:
    instance = db.query(Umami).filter_by(id=job.umami_id).first()
    if not instance:
        raise Exception(f"No Umami instance found for ID {job.umami_id}")

    if job.report_type == "summary":
        summary = fetch_website_summary(instance, job)
    elif job.report_type == "report":
        summary = fetch_report_summary(instance, job)
    else:
        raise Exception(f"Unsupported report_type: {job.report_type}")

    if not summary:
        raise Exception("No summary data returned.")

    summary["name"] = job.name
    # Logo-Konfiguration holen
    logo_cfg = _get_logo_config(db)
    if logo_cfg and logo_cfg.get("path") and os.path.isfile(logo_cfg["path"]):
        summary["logo_path"] = logo_cfg["path"]
        summary["logo_mime"] = logo_cfg.get("mime", "image/png")
    else:
        # Fallback: Default-Logo als Datei
        default_logo_path = os.path.join(os.path.dirname(__file__), "default_logo.png")
        summary["logo_path"] = default_logo_path
        summary["logo_mime"] = "image/png"
    # Für das HTML-Template: Platzhalter für die CID
    summary["embed_logo_cid"] = "cid:logo_cid"

    return summary


# ----------------------------- Logo logic -----------------------------

def resolve_logo_data_url(db: Session) -> str:
    """
    Nimmt (falls vorhanden) das LOGO aus SystemSettings (JSONB) und gibt eine data:-URL zurück.
    Fällt andernfalls auf embedded_logo() zurück.
    """
    cfg = _get_logo_config(db)
    if cfg:
        data_url = _logo_config_to_data_url(cfg)
        if data_url:
            return data_url
    return embedded_logo()


def _get_logo_config(db: Session) -> Optional[Dict]:
    """
    Liest die LOGO-Config aus der DB und gibt das JSON-Objekt zurück.
    Erwartetes Schema (Beispiel):
      {
        "url": "/static/branding/logo-25e540b3.svg",
        "mime": "image/svg+xml",
        "path": "/var/app/uploads/branding/logo-25e540b3.svg",
        "width": 0,
        "height": 0,
        "sha256": "...",
        "storage": "file"
      }
    """
    row = db.query(SystemSettings).filter(SystemSettings.type == "LOGO").one_or_none()
    if not row:
        return None

    # Falls deine Spalte anders heißt, hier anpassen (z. B. row.config / row.value ...)
    value = getattr(row, "config", None) or getattr(row, "value", None)
    if not isinstance(value, dict):
        return None
    return value


def _logo_config_to_data_url(cfg: Dict) -> Optional[str]:
    """
    Baut aus der Logo-Config eine data:-URL.
    Bevorzugt das lokale 'path'-Feld (embedded Base64 ist in E-Mails zuverlässiger als externe URLs).
    """
    path = (cfg.get("path") or "").strip()
    mime = (cfg.get("mime") or "image/png").strip()

    if path and os.path.isfile(path):
        try:
            # Für SVG kann man theoretisch auch ohne Base64 mit URL-Encoding einbetten,
            # Base64 ist jedoch für E-Mail-HTML oft unkomplizierter.
            with open(path, "rb") as f:
                raw = f.read()
            b64 = base64.b64encode(raw).decode("ascii")
            return f"data:{mime};base64,{b64}"
        except Exception:
            return None

    # Wenn du notfalls die (relative) URL direkt verwenden willst (nicht empfohlen für Mails),
    # könntest du hier stattdessen cfg["url"] zurückgeben.
    # return cfg.get("url")
    return None


def embedded_logo():
    return "data:image/png;base64,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"