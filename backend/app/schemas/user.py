from uuid import UUID
from pydantic import BaseModel
from enum import Enum
from typing import Optional

class UserRole(str, Enum):
    user = "user"
    admin = "admin"

class UserOut(BaseModel):
    id: UUID
    username: str
    role: str
    language: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    language: Optional[str] = None
    role: Optional[UserRole] = UserRole.user

class UserUpdate(BaseModel):
    username: str
    language: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None

class UserPasswordUpdate(BaseModel):
    currentPassword: str
    newPassword: str
    confirmPassword: str