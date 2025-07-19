import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.models.sender import Sender

def send_email(sender: Sender, to: list[str], subject: str, body: str, html: str = None):
    """Versendet separate E-Mails an jeden Empfänger."""

    smtp_args = {
        "host": sender.smtp_host,
        "port": sender.smtp_port,
    }

    # SMTP-Verbindung aufbauen (außerhalb der Schleife, wenn möglich)
    if sender.use_ssl:
        server = smtplib.SMTP_SSL(**smtp_args)
    else:
        server = smtplib.SMTP(**smtp_args)
        if sender.use_tls:
            server.starttls()

    server.login(sender.smtp_username, sender.smtp_password)

    # Für jeden Empfänger eine eigene Mail senden
    for recipient in to:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender.email
        msg["To"] = recipient

        # Text-Version
        text_part = MIMEText(body, "plain")
        msg.attach(text_part)

        # HTML-Version (optional)
        if html:
            html_part = MIMEText(html, "html")
            msg.attach(html_part)

        # Nachricht senden
        server.sendmail(sender.email, recipient, msg.as_string())

    server.quit()