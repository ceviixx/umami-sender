from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.template import MailTemplate
from app.schemas.template import MailTemplateCreate, MailTemplateOut, MailTemplateUpdate
from sqlalchemy import and_
from app.utils.responses import send_status_response

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/", response_model=list[MailTemplateOut])
def list_templates(db: Session = Depends(get_db)):
    return db.query(MailTemplate).filter(MailTemplate.type == "custom").order_by(MailTemplate.id.desc()).all()


def reconstruct_sender_type(type_param: str):
    if type_param.lower() == 'email':
        return 'EMAIL'
    return f'WEBHOOK_{type_param.upper()}'

@router.get("/{template_type}", response_model=MailTemplateOut)
def get_template(template_type: str, db: Session = Depends(get_db)):
    template = db.query(MailTemplate).filter(
        and_(
            MailTemplate.type == 'custom',
            MailTemplate.sender_type == reconstruct_sender_type(template_type)
        )
    ).first()
    if not template:
        return send_status_response(
            code="TEMPLATE_NOT_FOUND",
            message="Template not found",
            status=404,
            detail=f"No template found for type '{template_type}'"
        )
    return template


@router.put("/{template_type}", response_model=MailTemplateOut)
def update_template(template_type: str, data: MailTemplateUpdate, db: Session = Depends(get_db)):
    template = db.query(MailTemplate).filter(
        and_(
            MailTemplate.type == 'custom',
            MailTemplate.sender_type == reconstruct_sender_type(template_type)
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
            MailTemplate.sender_type == reconstruct_sender_type(template_type)
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
