from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_REPORT_JOURNEY"

TEMPLATE_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EMAIL_REPORT_JOURNEY</title>
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

  <table>
  <tr>
      <th>Path</th>
      <th style="width: 100px;">Count</th>
  </tr>
  {% for journey in summary.result %}
  <tr>
      <td>
      {% for item in journey["items"] if item %}
          {{ item }}{% if not loop.last %} → {% endif %}
      {% endfor %}
      </td>
      <td>{{ journey.count }}</td>
  </tr>
  {% endfor %}
  </table>

</div>

<div class="footer">
  Sent with <a href="https://github.com/ceviixx/umami-sender">UmamiSender</a>
</div>

</body>
</html>"""

TEMPLATE_EXAMPLE = {
    "summary": {
        "name": "Journey",
        "period": "Last 90 days",
        "type": "journey",
        "result": [
            {
                "items": [
                    "/",
                    None,
                    None
                ],
                "count": 41350
            },
            {
                "items": [
                    "/",
                    "login-button-header",
                    None,
                    None
                ],
                "count": 28053
            },
            {
                "items": [
                    "/",
                    "get-started-button",
                    None,
                    None
                ],
                "count": 8118
            },
            {
                "items": [
                    "/",
                    "/pricing",
                    None,
                    None
                ],
                "count": 6781
            },
            {
                "items": [
                    "/blog",
                    None,
                    None
                ],
                "count": 4280
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

