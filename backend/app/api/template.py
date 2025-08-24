from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.template import MailTemplate
from app.schemas.template import MailTemplateCreate, MailTemplateOut, MailTemplateUpdate, MailTemplateList
from sqlalchemy import and_
from app.utils.responses import send_status_response
from app.core.render_template import render_template
from app.core.generate_report_summary import resolve_logo_data_url
from app.utils.response_clean import process_api_response
from app.services.import_templates import import_templates_from_repo
from fastapi.responses import HTMLResponse
from jinja2 import UndefinedError
from pydantic import BaseModel
from typing import List, Optional, Any

from app.utils.security import authenticated_admin, authenticated_user, not_found_response
from app.models.user import User



router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("/{id}", response_model=MailTemplateOut)
def get_template(
    id: str, 
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_user)
):
    template = db.query(MailTemplate).filter(MailTemplate.id == id).first()

    if not template: return not_found_response(MailTemplate, id)

    return template

@router.get("/{id}/preview", response_class=HTMLResponse)
def get_preview(
    id: str, 
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_user)
):
    template = db.query(MailTemplate).filter(MailTemplate.id == id).first()

    if not template: return not_found_response(MailTemplate, id)
    
    try:
        example_content = template.example_content
        if "summary" not in example_content or not isinstance(example_content["summary"], dict):
            example_content["summary"] = {}
        example_content["summary"]["embedded_logo"] = resolve_logo_data_url(db)

        example_content = process_api_response(response=example_content, db=db)

        html = render_template(template.content, example_content or {})
        return HTMLResponse(content=html)
    except (KeyError, TypeError) as e:
        return send_status_response(
            code="TEMPLATE_STRUCTURE_ERROR",
            message="Invalid structure in example_content.",
            status=400,
            detail=str(e)
        )
    except UndefinedError as e:
        return send_status_response(
            code="TEMPLATE_RENDER_ERROR",
            message="Missing data in example_content for rendering.",
            status=400,
            detail=str(e)
        )

@router.put("/{id}", response_model=MailTemplateOut)
def update_template(
    id: str, 
    data: MailTemplateUpdate, 
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_admin)
):
    template = db.query(MailTemplate).filter(
        and_(
            MailTemplate.type == 'custom',
            MailTemplate.sender_type == id
        )
    ).first()
    if not template: return not_found_response(MailTemplate, id)

    for key, value in data.dict(exclude_unset=True).items():
        setattr(template, key, value)

    db.commit()
    db.refresh(template)
    return template

@router.delete("/{id}")
def delete_template(
    id: str, 
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_admin)
):
    template = db.query(MailTemplate).filter(
        and_(
            MailTemplate.type == 'custom',
            MailTemplate.sender_type == id
        )
    ).first()
    if not template: return not_found_response(MailTemplate, id)
    template.content = None

    db.commit()
    return {"success": True}



class RefreshStats(BaseModel):
    inserted: int
    updated: int
    skipped: int
    invalid: int
    commit: Optional[str]
    started_at: str
    finished_at: Optional[str]
    errors: List[str]

@router.patch("/refresh", response_model=RefreshStats)
def refresh_templates(
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_admin)
):
    stats = import_templates_from_repo()
    if stats.get("errors") and "already running" in " ".join(stats["errors"]).lower():
        return send_status_response(
            code="CONFLICT",
            message="There is an conflict on the request",
            status=409,
            detail=stats["errors"]
        )
    return stats












from typing import List, Optional
from datetime import datetime
import re

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import select, func
from sqlalchemy.orm import Session

class TemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str 
    name: str
    type: str = Field(validation_alias="sender_type")
    description: Optional[str] = None
    updatedAt: Optional[datetime] = None

    sender_type: str
    example_content: Optional[dict] = None
    source_commit: Optional[str] = None
    content_hash: Optional[str] = None

@router.get("", response_model=List[TemplateOut])
def list_templates(
    db: Session = Depends(get_db),
    type: Optional[List[str]] = Query(default=None, description="Filter: ?type=EMAIL&type=WEBHOOK_DISCORD"),
    _user: User = Depends(authenticated_user)
):
    stmt = select(MailTemplate)
    if type:
        stmt = stmt.where(MailTemplate.sender_type.in_(type))

    rows: List[MailTemplate] = db.execute(stmt).scalars().all()

    out: List[TemplateOut] = []
    for r in rows:
        out.append(TemplateOut.model_validate({
            "id": str(r.id),
            "name": r.sender_type,
            "type": r.sender_type,
            "description": None,
            "updatedAt": r.updated_at,
            "sender_type": r.sender_type,
            "source_commit": r.source_commit,
            "content_hash": r.content_hash,
        }))
    return out
