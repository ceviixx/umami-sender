import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from .base import TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "user"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    is_initial_password = Column(Boolean, nullable=False, default=True, server_default="true")
    role = Column(String, nullable=False, default="user", server_default="user")
    language = Column(String, nullable=False, default="en", server_default="en")

    umamis   = relationship("Umami",  back_populates="user", passive_deletes=True)
    senders  = relationship("Sender", back_populates="user", passive_deletes=True)
    jobs     = relationship("Job",    back_populates="user", passive_deletes=True)
    webhooks = relationship("WebhookRecipient", back_populates="user", passive_deletes=True)