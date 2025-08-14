from uuid import UUID
from pydantic import BaseModel
from typing import Optional, Any

class MailTemplateBase(BaseModel):
    type: str
    sender_type: str
    content: Optional[str] = None

class MailTemplateCreate(MailTemplateBase):
    pass

class MailTemplateUpdate(MailTemplateBase):
    pass


class MailTemplateList(BaseModel):
    id: UUID
    sender_type: str

class MailTemplateOut(MailTemplateBase):
    id: UUID

    class Config:
        from_attributes = True
