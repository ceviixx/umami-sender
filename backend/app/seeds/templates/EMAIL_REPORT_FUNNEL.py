from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_REPORT_FUNNEL"

TEMPLATE_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EMAIL_REPORT_FUNNEL</title>
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
      <th>Step</th>
      <th>Visitors</th>
      <th>Dropped</th>
      <th>Drop-off Rate</th>
      <th>Remaining</th>
  </tr>
  {% for step in summary.result %}
  <tr>
      <td>{{ step.value }}</td>
      <td>{{ step.visitors }}</td>
      <td>{{ step.dropped }}</td>
      <td>
      {% if step.dropoff is not none %}
          {{ step.dropoff | round(2) }}%
      {% else %}
          –
      {% endif %}
      </td>
      <td>
      {% if step.remaining is not none %}
          {{ step.remaining | round(2) }}
      {% else %}
          –
      {% endif %}
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
        "name": "Funnel",
        "period": "Last 90 days",
        "type": "funnel",
        "result": [
            {
                "type": "url",
                "value": "/",
                "visitors": 104370,
                "previous": 0,
                "dropped": 0,
                "dropoff": None,
                "remaining": 1
            },
            {
                "type": "url",
                "value": "/contact",
                "visitors": 1310,
                "previous": 104370,
                "dropped": 103060,
                "dropoff": 0.9874485005269713,
                "remaining": 0.012551499473028648
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

