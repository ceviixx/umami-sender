from uuid import UUID
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import time

class Frequency(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"

class MailerJobCreate(BaseModel):
    name: str
    mailer_id: Optional[UUID] = None
    umami_id: UUID
    website_id: str
    report_type: str
    summary_items: List[str] = []
    report_id: Optional[str]
    frequency: Frequency
    day: Optional[int]
    execution_time: time
    email_recipients: List[str] = []
    webhook_recipients: List[UUID] = []
    is_active: bool

class MailerJobOut(MailerJobCreate):
    id: UUID

    class Config:
        from_attributes = True

class MailerJobUpdate(BaseModel):
    name: str
    umami_id: UUID
    website_id: str
    report_type: str = "summary"
    frequency: Frequency
    day: Optional[int]
    email_recipients: List[str] = []
    webhook_recipients: List[UUID] = []
    is_active: bool
    mailer_id: Optional[UUID] = None
    execution_time: Optional[str] = None

    class Config:
        from_attributes = True
        use_enum_values = True
    