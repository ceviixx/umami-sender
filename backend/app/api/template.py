from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.template import MailTemplate
from app.schemas.template import MailTemplateCreate, MailTemplateOut, MailTemplateUpdate, MailTemplateList
from app.models.template_styles import MailTemplateStyle
from sqlalchemy import and_
from app.utils.responses import send_status_response
from app.core.render_template import render_template
from app.core.generate_report_summary import embedded_logo
from app.utils.response_clean import process_api_response
from fastapi.responses import HTMLResponse
from jinja2 import UndefinedError
from pydantic import BaseModel
from typing import List, Optional, Any

from app.utils.security import Security
from app.services.import_templates import import_templates_from_repo

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=list[MailTemplateList])
def list_templates(request: Request, db: Session = Depends(get_db)):
    _ = Security(request).get_user()
    return (db.query(MailTemplate)
            .filter(MailTemplate.sender_type.contains('EMAIL'))
            .order_by(MailTemplate.sender_type.asc())
            .all())

@router.get("/{template_type}", response_model=MailTemplateOut)
def get_template(request: Request, template_type: str, db: Session = Depends(get_db)):
    _ = Security(request).get_user()
    template = db.query(MailTemplate).filter(MailTemplate.sender_type == template_type).first()
    if not template:
        return send_status_response(
            code="TEMPLATE_NOT_FOUND",
            message="Template not found",
            status=404,
            detail=f"No template found for type '{template_type}'"
        )
    return template

@router.get("/{template_type}/preview", response_class=HTMLResponse)
def get_preview(request: Request, template_type: str, db: Session = Depends(get_db)):
    _ = Security(request).get_user()
    template = db.query(MailTemplate).filter(MailTemplate.sender_type == template_type).first()
    if not template:
        return send_status_response(
            code="TEMPLATE_NOT_FOUND",
            message="Template not found",
            status=404,
            detail=f"No template found for type '{template_type}'"
        )
    
    if template.style_id:
        style = db.query(MailTemplateStyle).filter_by(id=template.style_id).first()
    else:
        style = db.query(MailTemplateStyle).filter_by(is_default=True).first()
    css = style.css if style else ""

    try:
        example_content = template.example_content
        if "summary" not in example_content or not isinstance(example_content["summary"], dict):
            example_content["summary"] = {}
        example_content["summary"]["embedded_logo"] = embedded_logo()
        example_content["inline_css"] = css

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

@router.put("/{template_type}", response_model=MailTemplateOut)
def update_template(request: Request, template_type: str, data: MailTemplateUpdate, db: Session = Depends(get_db)):
    _ = Security(request).get_user()
    template = db.query(MailTemplate).filter(
        and_(
            MailTemplate.type == 'custom',
            MailTemplate.sender_type == template_type
        )
    ).first()
    if not template:
        return send_status_response(
            code="TEMPLATE_NOT_FOUND",
            message="Template not found",
            status=404,
            detail=f"No template found for type '{template_type}'"
        )

    for key, value in data.dict(exclude_unset=True).items():
        setattr(template, key, value)

    db.commit()
    db.refresh(template)
    return template

@router.delete("/{template_type}")
def delete_template(request: Request, template_type: str, db: Session = Depends(get_db)):
    _ = Security(request).get_user()
    template = db.query(MailTemplate).filter(
        and_(
            MailTemplate.type == 'custom',
            MailTemplate.sender_type == template_type
        )
    ).first()
    if not template:
        return send_status_response(
            code="TEMPLATE_NOT_FOUND",
            message="Template not found",
            status=404,
            detail=f"No template found for type '{template_type}'"
        )
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
def refresh_templates(request: Request, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    
    if user.role != "admin":
        return send_status_response(
            code="FORBIDDEN",
            message="You do not have permission to view users.",
            status=403,
            detail="Only admin users can view the list of users."
        )
    

    stats = import_templates_from_repo()
    if stats.get("errors") and "already running" in " ".join(stats["errors"]).lower():
        return send_status_response(
            code="CONFLICT",
            message="There is an conflict on the request",
            status=409,
            detail=stats["errors"]
        )
    return stats
