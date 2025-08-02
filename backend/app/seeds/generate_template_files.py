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

TEMPLATE_EXAMPLE = """
"""

def seed():
    db: Session = SessionLocal()

    template = db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="default").first()

    if template:
        # Always update example_content
        template.example_content = TEMPLATE_EXAMPLE or None

        if not template.is_customized:
            print(f"♻️ Updating default template for {{SENDER_TYPE}} (not customized)...")
            template.content = TEMPLATE_CONTENT.strip() or None
        else:
            print(f"⛔️ Default template for {{SENDER_TYPE}} has been customized – skipping content update.")

        db.commit()

    else:
        print(f"🌱 Seeding new default template for {{SENDER_TYPE}}...")
        new_template = MailTemplate(
            type="default",
            sender_type=SENDER_TYPE,
            content=TEMPLATE_CONTENT.strip() or None,
            example_content=TEMPLATE_EXAMPLE or None
        )
        db.add(new_template)
        db.commit()

    db.close()

'''


for key in keys:
    filename = os.path.join(output_dir, f"{key}.py")
    if not os.path.exists(filename):
        with open(filename, "w") as f:
            f.write(generate_template(key))
        print(f"✅ File created: {filename}")
    else:
        print(f"⏩ File already exists: {filename}")
