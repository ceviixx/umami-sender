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
    sender_id: Optional[int] = None
    host_id: int
    website_id: str
    report_type: str
    summary_items: List[str] = []
    report_id: Optional[str]
    frequency: Frequency
    day: Optional[int]
    execution_time: time
    email_recipients: List[str] = []
    webhook_recipients: List[int] = []
    is_active: bool

class MailerJobOut(MailerJobCreate):
    id: int

    class Config:
        from_attributes = True

class MailerJobUpdate(BaseModel):
    name: str
    host_id: int
    website_id: str
    report_type: str = "summary"
    frequency: Frequency
    day: Optional[int]
    email_recipients: List[str] = []
    webhook_recipients: List[int] = []
    is_active: bool
    sender_id: Optional[int] = None
    
    class Config:
        from_attributes = True
        orm_mode = True
        use_enum_values = True