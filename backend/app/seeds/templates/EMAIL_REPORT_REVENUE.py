from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_REPORT_REVENUE"

TEMPLATE_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EMAIL_REPORT_REVENUE</title>
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


  <h2>Value Overview</h2>
  <table>
  <tr>
      <th>Total</th>
      <th>Average</th>
      <th>Transactions</th>
      <th>Unique Customers</th>
  </tr>
  <tr>
      {% if summary.result %}
        <td>€{{ (summary.result.total.sum / 1000) | round(2) }}k</td>
        <td>€{{ (summary.result.total.sum / summary.result.total.count) | round(2) }}</td>
        <td>{{ summary.result.total.count }}</td>
        <td>{{ summary.result.total.unique_count }}</td>
      {% else %}
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      {% endif %}
  </tr>
  </table>

  <h2>Top Countries</h2>
  <table>
  <tr><th>Country</th><th style="width: 100px;">Total</th></tr>
  {% if summary.result %}
    {% for entry in summary.result.country %}
    <tr>
        <td>{{ entry.name }}</td>
        <td>{{ entry.value }}</td>
    </tr>
    {% endfor %}
  {% endif %}
  </table>


  <h2>Revenue by Currency</h2>
  <table>
  <tr><th>Currency</th><th>Total</th><th>Transactions</th><th>Unique Customers</th></tr>
  {% if summary.result %}
    {% for row in summary.result.table %}
    <tr>
        <td>{{ row.currency }}</td>
        <td>{{ row.sum }}</td>
        <td>{{ row.count }}</td>
        <td>{{ row.unique_count }}</td>
    </tr>
    {% endfor %}
  {% endif %}
  </table>




</div>
<div class="footer">
  Sent with <a href="https://github.com/ceviixx/umami-sender">UmamiSender</a>
</div>
</body>
</html>"""

TEMPLATE_EXAMPLE = {
    "summary": {
        "name": "Revenue",
        "period": "Last 90 days",
        "type": "revenue",
        "result": {
            "chart": [
                {
                    "x": "revenue-demo",
                    "t": "2025-07-07T22:00:00Z",
                    "y": 310
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-08T22:00:00Z",
                    "y": 640
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-09T22:00:00Z",
                    "y": 420
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-10T22:00:00Z",
                    "y": 370
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-11T22:00:00Z",
                    "y": 640
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-12T22:00:00Z",
                    "y": 550
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-13T22:00:00Z",
                    "y": 600
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-14T22:00:00Z",
                    "y": 500
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-15T22:00:00Z",
                    "y": 470
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-16T22:00:00Z",
                    "y": 410
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-17T22:00:00Z",
                    "y": 440
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-18T22:00:00Z",
                    "y": 450
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-19T22:00:00Z",
                    "y": 380
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-20T22:00:00Z",
                    "y": 410
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-21T22:00:00Z",
                    "y": 420
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-22T22:00:00Z",
                    "y": 260
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-23T22:00:00Z",
                    "y": 480
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-24T22:00:00Z",
                    "y": 400
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-25T22:00:00Z",
                    "y": 480
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-26T22:00:00Z",
                    "y": 370
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-27T22:00:00Z",
                    "y": 380
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-28T22:00:00Z",
                    "y": 380
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-29T22:00:00Z",
                    "y": 560
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-30T22:00:00Z",
                    "y": 490
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-07-31T22:00:00Z",
                    "y": 340
                },
                {
                    "x": "revenue-demo",
                    "t": "2025-08-01T22:00:00Z",
                    "y": 700
                }
            ],
            "country": [
                {
                    "name": "FR",
                    "value": 2990
                },
                {
                    "name": "US",
                    "value": 2860
                },
                {
                    "name": "GB",
                    "value": 2830
                },
                {
                    "name": "DE",
                    "value": 2410
                },
                {
                    "name": "CN",
                    "value": 760
                }
            ],
            "total": {
                "sum": 11850,
                "count": 391,
                "unique_count": 391
            },
            "table": [
                {
                    "currency": "EUR",
                    "sum": 86220,
                    "count": 2207,
                    "unique_count": 1601
                },
                {
                    "currency": "USD",
                    "sum": 11850,
                    "count": 391,
                    "unique_count": 391
                }
            ]
        },
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

