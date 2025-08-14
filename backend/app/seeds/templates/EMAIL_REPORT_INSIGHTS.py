from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_REPORT_INSIGHTS"

TEMPLATE_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EMAIL_REPORT_INSIGHTS</title>
  <style>{{ inline_css | safe }}</style>
</head>
<body>
<div class="container">
  <div class="header">
    <img src="{{ summary.embedded_logo }}" alt="Logo" />
  </div>

  <h2>We’ve crunched the numbers – here’s your summary.</h2>
  <p><strong>Report:</strong> {{ summary.name }}</p>
  <p><strong>Period:</strong> {{ summary.period }}</p>

</div>

<div class="footer">
  Sent with <a href="https://github.com/ceviixx/umami-sender">UmamiSender</a>
</div>
</body>
</html>"""

TEMPLATE_EXAMPLE = {
    "summary": {
        "name": "Insights",
        "period": "Last 90 days",
        "type": "insights",
        "result": [
            {
                "views": 171558,
                "visitors": 103524,
                "visits": 138653,
                "bounces": 114612,
                "totaltime": 8727342,
                "url": "/"
            },
            {
                "views": 43772,
                "visitors": 23858,
                "visits": 29683,
                "bounces": 21365,
                "totaltime": 3572573,
                "url": "/docs"
            },
            {
                "views": 38271,
                "visitors": 28753,
                "visits": 31989,
                "bounces": 27263,
                "totaltime": 1545083,
                "url": "/pricing"
            },
            {
                "views": 20756,
                "visitors": 12943,
                "visits": 15932,
                "bounces": 12617,
                "totaltime": 1676259,
                "url": "/docs/install"
            },
            {
                "views": 18188,
                "visitors": 13215,
                "visits": 14632,
                "bounces": 12112,
                "totaltime": 750090,
                "url": "/features"
            },
            {
                "views": 16456,
                "visitors": 9629,
                "visits": 12147,
                "bounces": 9311,
                "totaltime": 1507622,
                "url": "/docs/track-events"
            },
            {
                "views": 14396,
                "visitors": 9011,
                "visits": 10714,
                "bounces": 8156,
                "totaltime": 1037753,
                "url": "/docs/collect-data"
            },
            {
                "views": 12224,
                "visitors": 6586,
                "visits": 8133,
                "bounces": 5859,
                "totaltime": 988292,
                "url": "/docs/api"
            }
        ],
        "embedded_logo": ""
    }
}

def seed():
    db: Session = SessionLocal()

    template = db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="default").first()

    if template:
        # Always update example_content
        template.example_content = TEMPLATE_EXAMPLE or None

        if not template.is_customized:
            print(f"♻️ Updating default template for {SENDER_TYPE} (not customized)...")
            template.content = TEMPLATE_CONTENT.strip() or None
        else:
            print(f"⛔️ Default template for {SENDER_TYPE} has been customized – skipping content update.")

        db.commit()

    else:
        print(f"🌱 Seeding new default template for {SENDER_TYPE}...")
        new_template = MailTemplate(
            type="default",
            sender_type=SENDER_TYPE,
            content=TEMPLATE_CONTENT.strip() or None,
            example_content=TEMPLATE_EXAMPLE or None
        )
        db.add(new_template)
        db.commit()

    db.close()

