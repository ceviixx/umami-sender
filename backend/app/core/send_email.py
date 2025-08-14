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

    if sender.use_ssl:
        server = smtplib.SMTP_SSL(**smtp_args)
    else:
        server = smtplib.SMTP(**smtp_args)
        if sender.use_tls:
            server.starttls()

    try:
        server.login(sender.smtp_username, sender.smtp_password)
    except smtplib.SMTPAuthenticationError as e:
        raise Exception(f"SMTP Authentication Error: {e}")
    except smtplib.SMTPConnectError as e:
        raise Exception(f"SMTP Connection Error: {e}")
    except smtplib.SMTPException as e:
        raise Exception(f"SMTP Error: {e}")
    except Exception as e:
        raise Exception(f"An unexpected error occurred: {e}")

    for recipient in to:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender.email
        msg["To"] = recipient

        text_part = MIMEText(body, "plain")
        msg.attach(text_part)

        if html:
            html_part = MIMEText(html, "html")
            msg.attach(html_part)

        # Nachricht senden
        server.sendmail(sender.email, recipient, msg.as_string())

    server.quit()