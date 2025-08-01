import os

report_types = ["INSIGHTS", "FUNNEL", "RETENTION", "UTM", "GOALS", "JOURNEY", "REVENUE", "ATTRIBUTION"]
webhook_channels = ["DISCORD", "SLACK", "CUSTOM"]

output_dir = "templates"
os.makedirs(output_dir, exist_ok=True)

keys = []

keys.append("EMAIL_SUMMARY")
for report in report_types:
    keys.append(f"EMAIL_REPORT_{report}")

for channel in webhook_channels:
    keys.append(f"WEBHOOK_SUMMARY_{channel}")
for report in report_types:
    for channel in webhook_channels:
        keys.append(f"WEBHOOK_REPORT_{report}_{channel}")

def generate_template(key: str) -> str:
    return f'''from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "{key}"

TEMPLATE_CONTENT = """
"""

def seed():
    default()
    # custom()

def default():
    db: Session = SessionLocal()

    if not db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="default").first():
        print(f"🌱 Seede Standard-{{SENDER_TYPE}}-Template...")
        template = MailTemplate(
            type="default",
            sender_type=SENDER_TYPE,
            content=TEMPLATE_CONTENT.strip() or None
        )
        db.add(template)
        db.commit()

    db.close()

def custom():
    db: Session = SessionLocal()

    if not db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="custom").first():
        print(f"🌱 Seede Custom-{{SENDER_TYPE}}-Template...")
        template = MailTemplate(
            type="custom",
            sender_type=SENDER_TYPE,
            content=TEMPLATE_CONTENT.strip() or None
        )
        db.add(template)
        db.commit()

    db.close()
'''


for key in keys:
    filename = os.path.join(output_dir, f"{key}.py")
    if not os.path.exists(filename):
        with open(filename, "w") as f:
            f.write(generate_template(key))
        print(f"✅ Datei erstellt: {filename}")
    else:
        print(f"⏩ Datei existiert bereits: {filename}")
