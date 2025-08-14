from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_REPORT_RETENTION"

TEMPLATE_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EMAIL_REPORT_RETENTION</title>
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
      <th>Date</th>
      <th>Visitors</th>
      <th>Returning</th>
      <th>Retention</th>
  </tr>
  {% for entry in summary.result %}
  <tr>
      <td>{{ entry.date[:10] }}</td>
      <td>{{ entry.visitors }}</td>
      <td>{{ entry.returnVisitors }}</td>
      <td style="min-width: 150px; padding: 0; margin: 0; padding-left: 5px; padding-right: 5px;">
        <div style="position: relative; height: 20px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; height: 100%; width: {{ entry.percentage }}%; background-color: #2563eb; opacity: 0.5;"></div>
          <div style="position: relative; z-index: 1; text-align: center; line-height: 20px; font-size: 12px; color: #111827;">
            {{ entry.percentage | round(2) }} %
          </div>
        </div>
      </td>
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
        "name": "Retention",
        "period": "Last 90 days",
        "type": "retention",
        "result": [
            {
                "date": "2025-05-04T22:00:00Z",
                "day": 0,
                "visitors": 1886,
                "returnVisitors": 1886,
                "percentage": 100
            },
            {
                "date": "2025-05-04T22:00:00Z",
                "day": 1,
                "visitors": 1886,
                "returnVisitors": 171,
                "percentage": 9.066808059384941
            },
            {
                "date": "2025-05-04T22:00:00Z",
                "day": 2,
                "visitors": 1886,
                "returnVisitors": 104,
                "percentage": 5.514316012725344
            },
            {
                "date": "2025-05-04T22:00:00Z",
                "day": 3,
                "visitors": 1886,
                "returnVisitors": 79,
                "percentage": 4.188759278897137
            },
            {
                "date": "2025-05-04T22:00:00Z",
                "day": 4,
                "visitors": 1886,
                "returnVisitors": 67,
                "percentage": 3.552492046659597
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

