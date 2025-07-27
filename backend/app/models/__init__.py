# app/models/__init__.py

from .template import MailTemplate
from .sender import Sender
from .umami import Umami, UmamiType
from .jobs import Job, Frequency
from .jobs_log import JobLog
from .webhooks import WebhookRecipient
