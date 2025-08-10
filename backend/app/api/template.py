from fastapi import APIRouter, Depends, HTTPException
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

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=list[MailTemplateList])
def list_templates(db: Session = Depends(get_db)):
    return db.query(MailTemplate).filter(MailTemplate.sender_type.contains('EMAIL')).order_by(MailTemplate.id.asc()).all()

@router.get("/{template_type}", response_model=MailTemplateOut)
def get_template(template_type: str, db: Session = Depends(get_db)):
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
def get_preview(template_type: str, db: Session = Depends(get_db)):
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
def update_template(template_type: str, data: MailTemplateUpdate, db: Session = Depends(get_db)):
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
def delete_template(template_type: str, db: Session = Depends(get_db)):
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
