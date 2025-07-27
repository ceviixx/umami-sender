from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "WEBHOOK_REPORT_UTM_MS_TEAMS"

TEMPLATE_MAIL = """
"""

TEMPLATE_WEBHOOK = """
"""

def seed():
    default()
    custom()

def default():
    db: Session = SessionLocal()

    if not db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="default").first():
        print(f"🌱 Seede Standard-{SENDER_TYPE}-Template...")
        template = MailTemplate(
            type="default",
            sender_type=SENDER_TYPE,
            description="",
            html=TEMPLATE_MAIL.strip() or None,
            json=TEMPLATE_WEBHOOK.strip() or None
        )
        db.add(template)
        db.commit()

    db.close()

def custom():
    db: Session = SessionLocal()

    if not db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="custom").first():
        print(f"🌱 Seede Custom-{SENDER_TYPE}-Template...")
        template = MailTemplate(
            type="custom",
            sender_type=SENDER_TYPE,
            description="",
            html=TEMPLATE_MAIL.strip() or None,
            json=TEMPLATE_WEBHOOK.strip() or None
        )
        db.add(template)
        db.commit()

    db.close()
