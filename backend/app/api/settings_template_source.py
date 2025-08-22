from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.system_settings import SystemSettings
from pydantic import BaseModel, HttpUrl
from typing import Optional, Annotated
from pydantic import BaseModel, AnyUrl, UrlConstraints, field_validator

from app.utils.security import authenticated_admin
from app.models.user import User

RepoURL = Annotated[AnyUrl, UrlConstraints(allowed_schemes=["https"])]

class TemplateSourceOut(BaseModel):
    repo: Optional[RepoURL] = None
    branch: str = "main"
    subdir: str = "."

class TemplateSourceIn(BaseModel):
    repo: RepoURL
    branch: str = "main"
    subdir: str = "."

    @field_validator("subdir")
    @classmethod
    def normalize_subdir(cls, v: str) -> str:
        if v in (None, "", "/"):
            return ""
        return v.strip().lstrip("/")



router = APIRouter(prefix="/settings", tags=["settings"])
TEMPLATE_TYPE = "TEMPLATE_SOURCE"

def get_or_create_template(db: Session) -> SystemSettings:
    s = db.query(SystemSettings).filter(SystemSettings.type == TEMPLATE_TYPE).one_or_none()
    if not s:
        s = SystemSettings(type=TEMPLATE_TYPE, config={})
        db.add(s)
        db.commit()
        db.refresh(s)
    return s

@router.get("/template-source", response_model=TemplateSourceOut)
def get_template_source(
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_admin)
):
    s = get_or_create_template(db)
    cfg = s.config or {}

    repo = cfg.get("repo") or None
    branch = cfg.get("branch") or "main"
    subdir = cfg.get("subdir") or ""

    return TemplateSourceOut(repo=repo, branch=branch, subdir=subdir)

@router.put("/template-source", response_model=TemplateSourceOut)
def put_template_source(
    cfg: TemplateSourceIn, 
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_admin)
):
    s = get_or_create_template(db)
    s.config = cfg.model_dump(mode="json")
    db.commit()
    db.refresh(s)
    return TemplateSourceOut(**s.config)

@router.delete("/template-source", status_code=204)
def delete_logo(
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_admin)
):
    s = get_or_create_template(db)
    s.config = {}
    db.commit()
    return