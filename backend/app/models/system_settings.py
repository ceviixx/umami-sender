import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Column, Text, UniqueConstraint
from app.database import Base
from .base import TimestampMixin

class SystemSettings(Base, TimestampMixin):
    __tablename__ = "settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    type = Column(Text, nullable=False, index=True)
    config = Column(JSONB, nullable=True)

    __table_args__ = (UniqueConstraint("type", name="uq_settings_type"),)