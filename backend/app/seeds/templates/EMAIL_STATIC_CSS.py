from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template_styles import MailTemplateStyle

CSS_CONTENT = """body {margin: 0;padding: 0;background-color: #f5f7fa;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color: #333;}
.container {max-width: 640px;margin: 40px auto;background-color: #fff;padding: 30px;border-radius: 12px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);}
.header {display: flex;align-items: center;gap: 10px;margin-bottom: 30px;}
.header img {width: 30px;height: 30px;}
.header h1 {font-size: 22px;color: #2563eb;margin: 0;}
h2 {font-size: 18px;margin: 20px 0 10px;color: #111827;}
p {margin: 4px 0 10px;font-size: 14px;}
table {
width: 100%;
border-collapse: separate;
border-spacing: 0;
border: 1px solid #e5e7eb;
border-radius: 12px;
overflow: hidden;
margin-top: 10px;
margin-bottom: 24px;
font-size: 14px;
}

th {
background-color: #f9fafb;
color: #111827;
font-weight: 600;
padding: 12px;
text-align: left;
}

td {
padding: 12px;
color: #374151;
background-color: #fff;
border-top: 1px solid #e5e7eb;
}

/* Rundungen für alle Tabellen */
table tbody tr:first-child th:first-child {
border-top-left-radius: 12px;
}
table tbody tr:first-child th:last-child {
border-top-right-radius: 12px;
}
table tbody tr:last-child td:first-child {
border-bottom-left-radius: 12px;
}
table tbody tr:last-child td:last-child {
border-bottom-right-radius: 12px;
}
.footer {
text-align: center;
font-size: 12px;
color: #9ca3af;
margin: 40px 0 20px;
}
a {
color: #6b7280;
text-decoration: none;
}"""

def seed():
    db: Session = SessionLocal()

    template = db.query(MailTemplateStyle).filter_by(id=1, default=True).first()

    if template:
        if not template.is_customized:
            print(f"♻️ Updating default css (not customized)...")
            template.css = CSS_CONTENT or None
        else:
            print(f"⛔️ Default css has been customized – skipping content update.")

        db.commit()

    else:
        print(f"🌱 Seeding new default css for...")
        new_template = MailTemplateStyle(
            css=CSS_CONTENT,
            is_default=True
        )
        db.add(new_template)
        db.commit()

    db.close()