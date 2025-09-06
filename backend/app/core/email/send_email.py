import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.models.sender import Sender

from email.mime.image import MIMEImage

def send_email(sender: Sender, to: list[str], subject: str, body: str, html: str = None, logo_path: str = None, logo_mime: str = None):
    """Versendet separate E-Mails an jeden Empfänger, Logo als Anhang mit CID."""

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

    if getattr(sender, "use_auth", False) and sender.smtp_username and sender.smtp_password:
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
        msg = MIMEMultipart("related")
        alt = MIMEMultipart("alternative")
        alt.attach(MIMEText(body, "plain"))
        if html:
            alt.attach(MIMEText(html, "html"))
        msg.attach(alt)

        msg["Subject"] = subject
        msg["From"] = sender.email
        msg["To"] = recipient

        # Logo als Anhang mit CID
        if logo_path and os.path.isfile(logo_path):
            with open(logo_path, "rb") as f:
                img = MIMEImage(f.read(), _subtype=(logo_mime.split("/")[-1] if logo_mime else None))
                img.add_header('Content-ID', '<logo_cid>')
                img.add_header('Content-Disposition', 'inline', filename=os.path.basename(logo_path))
                msg.attach(img)

        server.sendmail(sender.email, recipient, msg.as_string())

    server.quit()