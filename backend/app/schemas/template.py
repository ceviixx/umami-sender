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
    id: int
    sender_type: str

class MailTemplateOut(MailTemplateBase):
    id: int

    class Config:
        orm_mode = True
