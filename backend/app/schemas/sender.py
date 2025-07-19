from pydantic import BaseModel, EmailStr
from typing import Optional

class SenderCreate(BaseModel):
    name: str
    email: EmailStr
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    use_tls: bool
    use_ssl: bool

class SenderResponse(SenderCreate):
    id: int

    class Config:
        orm_mode = True

class SenderOut(BaseModel):
    id: int
    name: str
    email: str
    smtp_host: str
    smtp_port: int
    smtp_username: str
    use_tls: bool
    use_ssl: bool

    class Config:
        from_attributes = True  # für SQLAlchemy in Pydantic v2

class SenderBase(BaseModel):
    name: str
    email: EmailStr

class SenderUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    use_tls: Optional[bool] = None
    use_ssl: Optional[bool] = None