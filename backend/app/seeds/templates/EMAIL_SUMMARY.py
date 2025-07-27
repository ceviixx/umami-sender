from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.template import MailTemplate

SENDER_TYPE = "EMAIL_SUMMARY"

TEMPLATE_MAIL = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Summary Report</title>
<style>
body {
margin: 0;
padding: 0;
background-color: #f1f1f1;
font-family: Arial, sans-serif;
}
.container {
max-width: 600px;
margin: 40px auto;
background-color: #ffffff;
padding: 30px;
border-radius: 10px;
}
.logo {
display: flex;
text-align: center;
margin-top: 30px;
margin-bottom: 10px;
align-items: center;
justify-content: center;
gap: 0.5rem;
}
.logo img {
max-width: 150px;
height: auto;
}
.logo h1 {
font-size: 24px;
color: rgb(37 99 235);
margin: 0;
}
h1 {
font-size: 22px;
color: #333333;
margin-bottom: 20px;
}
table {
width: 100%;
border-collapse: collapse;
margin-bottom: 30px;
}
th, td {
border: 1px solid #ddd;
padding: 10px;
text-align: left;
font-size: 14px;
}
th {
background-color: #f9f9f9;
font-weight: bold;
}
.section-title {
font-size: 18px;
margin: 20px 0 10px;
color: #333;
}
table.stats, 
table.stats th, 
table.stats td {
border: 0px solid black;
border-collapse: collapse;
background: none;
}
table th.value {
width: 150px;
}
</style>
</head>
<body>

<div class="logo">
<img src="data:image/png;base64,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" 
width="40" height="40" alt="UmamiSender Logo" />
<h1>UmamiSender</h1>
</div>

<div class="container">
<h1>Your summary for</h1>
<p>Report: {{ summary.name }}</p>
<p>Timerange: {{ summary.period }}</p>
<table class="stats">
	<tr>
		<th>Views</th>
		<th>Visits</th>
		<th>Visitors</th>
		<th>Bounce rate</th>
		<th>Visit duration</th>
	</tr>
	<tr>
		<td>{{ summary.stats.pageviews }}</td>
		<td>{{ summary.stats.visits }}</td>
		<td>{{ summary.stats.visitors }}</td>
		<td>{{ summary.stats.bounces }}</td>
		<td>{{ summary.stats.totaltime }}</td>
	</tr>
</table>

	<div class="section-title">Top Pageviews</div>
		<table>
			<tr>
				<th>Pages</th>
				<th class="value">Views</th>
			</tr>
			{% for entry in summary.pageviews %}
				<tr>
					<td>{{ entry.x }}</td>
					<td>{{ entry.y }}</td>
				</tr>
			{% endfor %}
		</tr>
	</table>
	
	<div class="section-title">Top Referrer</div>
	<table>
		<tr>
			<th>Referrer</th>
			<th class="value">Views</th>
		</tr>
		{% for entry in summary.referrers %}
			<tr>
				<td>{{ entry.x }}</td>
				<td>{{ entry.y }}</td>
			</tr>
		{% endfor %}
	</table>
	
</div>


<p style="text-align: center; font-size: 13px; color: #888888; margin-top: 40px;">
  Made with ❤️ by <a href="https://github.com/ceviixx/UmamiSender" style="color: #555555; text-decoration: none;">UmamiSender</a>
</p>
	


</body>
</html>"""

TEMPLATE_WEBHOOK = """
"""

def seed():
    default()
    custom()

def default():
    db: Session = SessionLocal()

    if not db.query(MailTemplate).filter_by(sender_type=SENDER_TYPE, type="default").first():
        print(f"🌱 Seede Standard-{SENDER_TYPE}-Template...")
        template = MailTemplate(
            type="default",
            sender_type=SENDER_TYPE,
            description="",
            html=TEMPLATE_MAIL.strip() or None,
            json=TEMPLATE_WEBHOOK.strip() or None
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
            description="",
            html=TEMPLATE_MAIL.strip() or None,
            json=TEMPLATE_WEBHOOK.strip() or None
        )
        db.add(template)
        db.commit()

    db.close()
