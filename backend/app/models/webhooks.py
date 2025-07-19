from sqlalchemy import Column, Integer, String, Enum as SqlEnum
from app.database import Base
import enum
from .base import TimestampMixin

class WebhookRecipient(Base, TimestampMixin):
    __tablename__ = "webhooks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    type = Column(String, nullable=False)