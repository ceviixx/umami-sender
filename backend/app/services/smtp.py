import smtplib
from app.schemas.sender import SenderBase

def test_smtp_connection(data: SenderBase):
    try:
        if data.use_ssl:
            server = smtplib.SMTP_SSL(data.smtp_host, data.smtp_port)
        else:
            server = smtplib.SMTP(data.smtp_host, data.smtp_port)
            if data.use_tls:
                server.starttls()

        server.login(data.smtp_username, data.smtp_password)
        server.quit()
        return True
    except Exception as e:
        raise RuntimeError(f"SMTP connection failed: {str(e)}")
