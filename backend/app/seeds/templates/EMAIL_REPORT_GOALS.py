from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_REPORT_GOALS"

TEMPLATE_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EMAIL_REPORT_GOALS</title>
  <style>{{ inline_css | safe }}</style>
</head>
<body>
<div class="container">
  <div class="header">
    <img src="{{ summary.embedded_logo }}" alt="Logo" />
    <h1>UmamiSender</h1>
  </div>

  <h2>We’ve crunched the numbers – here’s your summary.</h2>
  <p><strong>Report:</strong> {{ summary.name }}</p>
  <p><strong>Period:</strong> {{ summary.period }}</p>

  {% if summary.result %}
  <table>
      <tr>
      <th>Type</th>
      <th>Value</th>
      <th>Progress</th>
      <th>Current</th>
      <th>Goal</th>
      </tr>
      {% for goal in summary.result %}
      {% set label = (
          'VIEWED PAGE' if goal.type == 'url' else
          'TRIGGERED EVENT' if goal.type == 'event' else
          'COLLECTED DATA' if goal.type == 'event-data' else
          goal.type | upper
      ) %}
      {% set progress = 0 %}
      {% if goal.result > 0 and goal.goal > 0 %}
          {% set progress = (goal.result / goal.goal * 100) | round(1) %}
      {% endif %}
      <tr>
          <td>{{ label }}</td>
          <td>{{ goal.value }}</td>
          <td style="min-width: 150px; padding: 0; margin: 0; padding-left: 5px; padding-right: 5px;">
            {% set bar_color = (
              '#dc2626' if progress <= 25 else
              '#f97316' if progress <= 75 else
              '#16a34a'
            ) %}
            <div style="position: relative; height: 20px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div style="background-color: {{ bar_color }}; width: {{ progress }}%; height: 100%; opacity: 0.5; position: absolute; top: 0; left: 0;"></div>
              <div style="position: relative; z-index: 1; text-align: center; line-height: 20px; font-size: 12px; color: #111827;">
                {{ progress }} %
              </div>
            </div>
          </td>
          <td>{{ goal.result }}</td>
          <td>{{ goal.goal }}</td>
      </tr>
      {% endfor %}
  </table>
  {% else %}
  <p style="color: #6b7280; font-style: italic;">No goals defined.</p>
  {% endif %}



</div>

<div class="footer">
  Sent with <a href="https://github.com/ceviixx/umami-sender">UmamiSender</a>
</div>

</body>
</html>"""

TEMPLATE_EXAMPLE = {
    "summary": {
        "name": "Goals",
        "period": "Last 90 days",
        "type": "goals",
        "result": [
            {
                "type": "url",
                "value": "/",
                "goal": 10000,
                "result": 7202
            },
            {
                "type": "event",
                "value": "live-demo-button",
                "goal": 10000,
                "result": 11791
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

