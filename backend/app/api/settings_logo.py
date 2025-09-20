from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.system_settings import SystemSettings
from app.services.files import save_logo_image, delete_file_if_exists

from app.utils.security import authenticated_admin, authenticated_user
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["settings"])

LOGO_TYPE = "LOGO"

def get_or_create_logo(db: Session) -> SystemSettings:
    s = db.query(SystemSettings).filter(SystemSettings.type == LOGO_TYPE).one_or_none()
    if not s:
        s = SystemSettings(type=LOGO_TYPE, config={})
        db.add(s)
        db.commit()
        db.refresh(s)
    return s

class LogoResponse(BaseModel):
    storage: str = "file"
    url: str | None = None
    path: str | None = None
    mime: str | None = None
    width: int | None = None
    height: int | None = None
    sha256: str | None = None
    size: int | None = None

@router.get("/logo", response_model=LogoResponse)
def get_logo(
   db: Session = Depends(get_db),
   _user: User = Depends(authenticated_admin)
):
    s = get_or_create_logo(db)
    return LogoResponse(**(s.config or {}))

@router.post("/logo", response_model=LogoResponse)
def upload_logo(
   file: UploadFile = File(...), 
   db: Session = Depends(get_db),
   _user: User = Depends(authenticated_admin)
):
    s = get_or_create_logo(db)
    old_path = (s.config or {}).get("path")

    try:
        meta = save_logo_image(file)
    except ValueError as e:
        raise HTTPException(400, str(e))

    s.config = {
        "storage": "file",
        "url": meta["url"],
        "path": meta["path"],
        "mime": meta["mime"],
        "width": meta["width"],
        "height": meta["height"],
        "sha256": meta["sha256"],
        "size": meta["size"],
    }
    db.commit()
    db.refresh(s)

    if old_path and old_path != meta["path"]:
        delete_file_if_exists(old_path)

    return LogoResponse(**s.config)

@router.delete("/logo", status_code=204)
def delete_logo(
   db: Session = Depends(get_db),
   _user: User = Depends(authenticated_admin)
):
    s = get_or_create_logo(db)
    old_path = (s.config or {}).get("path")
    s.config = {}
    db.commit()
    delete_file_if_exists(old_path)
    return


from sqlalchemy.orm import Session
from pathlib import Path
from datetime import datetime, timezone
import email.utils as eut
import os

from app.database import get_db
from app.models.system_settings import SystemSettings

SVG_PLACEHOLDER = b'''<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
  <rect width="0px" height="0px" fill="#f3f4f6"/>
</svg>'''

def _get_logo_row(db: Session):
  return db.query(SystemSettings).filter(SystemSettings.type == LOGO_TYPE).one_or_none()

def _http_date(ts: float) -> str:
  return eut.formatdate(ts, usegmt=True)

@router.get("/logo/branding")
def get_public_logo(
   request: Request,
   db: Session = Depends(get_db),
   user: User = Depends(authenticated_user)
):
  s = _get_logo_row(db)
  cfg = (s.config or {}) if s else {}

  path = cfg.get("path")
  mime = cfg.get("mime") or "image/svg+xml"
  sha256 = cfg.get("sha256")

  if not path or not os.path.isfile(path):
    # Default-Logo als Fallback
    default_logo_path = os.path.join(os.path.dirname(__file__), "../core/default_logo.png")
    if os.path.isfile(default_logo_path):
      with open(default_logo_path, "rb") as f:
        data = f.read()
      etag = 'W/"default-logo"'
      if request.headers.get("If-None-Match") == etag:
        return Response(status_code=304)
      headers = {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
        "ETag": etag,
        "Last-Modified": _http_date(0),
      }
      return Response(content=data, headers=headers, media_type="image/png")
    # Fallback auf SVG, falls Default-Logo fehlt
    etag = 'W/"placeholder"'
    if request.headers.get("If-None-Match") == etag:
      return Response(status_code=304)
    headers = {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60",
      "ETag": etag,
      "Last-Modified": _http_date(0),
    }
    return Response(content=SVG_PLACEHOLDER, headers=headers, media_type="image/svg+xml")

  p = Path(path)
  try:
    data = p.read_bytes()
  except Exception:
    raise HTTPException(404, "Logo not accessible")

  etag = f'W/"{sha256}"' if sha256 else f'W/"{p.stat().st_mtime_ns}"'
  if_none_match = request.headers.get("If-None-Match")
  if if_none_match and if_none_match == etag:
    return Response(status_code=304)

  mtime = p.stat().st_mtime
  last_modified = _http_date(mtime)
  if_modified_since = request.headers.get("If-Modified-Since")
  if if_modified_since:
    try:
      ims = datetime(*eut.parsedate(if_modified_since)[:6], tzinfo=timezone.utc).timestamp()
      if int(ims) >= int(mtime):
        return Response(status_code=304)
    except Exception:
      pass

  headers = {
    "Content-Type": mime,
    "Cache-Control": "public, max-age=86400, immutable" if sha256 else "public, max-age=300",
    "ETag": etag,
    "Last-Modified": last_modified,
  }
  return Response(content=data, headers=headers, media_type=mime)
