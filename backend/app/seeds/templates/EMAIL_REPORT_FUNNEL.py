from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_REPORT_FUNNEL"

TEMPLATE_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Umami Summary Report</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f7fa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #333;
    }
    .container {
      max-width: 640px;
      margin: 40px auto;
      background-color: #fff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 30px;
    }
    .header img {
      width: 30px;
      height: 30px;
    }
    .header h1 {
      font-size: 22px;
      color: #2563eb;
      margin: 0;
    }
    h2 {
      font-size: 18px;
      margin: 20px 0 10px;
      color: #111827;
    }
    p {
      margin: 4px 0 10px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
      font-size: 14px;
    }
    th {
      background-color: #f9fafb;
      color: #111827;
      font-weight: 600;
    }
    td {
      color: #374151;
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
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="header">
      <img src="{{ summary.embedded_logo }}" alt="Logo" />
      <h1>UmamiSender</h1>
    </div>

    <h2>Your summary for</h2>
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
            {{ step.dropoff }}%
        {% else %}
            –
        {% endif %}
        </td>
        <td>
        {% if step.remaining is not none %}
            {{ step.remaining }}
        {% else %}
            –
        {% endif %}
        </td>
    </tr>
    {% endfor %}
    </table>


  </div>

  <div class="footer">
    Sent with <a href="https://github.com/ceviixx/UmamiSender">UmamiSender</a>
  </div>

</body>
</html>"""

def seed():
    default()
    # custom()

def default():
    db: Session = SessionLocal()

    if not db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="default").first():
        print(f"🌱 Seede Standard-{SENDER_TYPE}-Template...")
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
        print(f"🌱 Seede Custom-{SENDER_TYPE}-Template...")
        template = MailTemplate(
            type="custom",
            sender_type=SENDER_TYPE,
            content=TEMPLATE_CONTENT.strip() or None
        )
        db.add(template)
        db.commit()

    db.close()
