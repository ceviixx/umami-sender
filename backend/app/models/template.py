import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, Text, JSON, Boolean
from app.database import Base
from .base import TimestampMixin

class MailTemplate(Base, TimestampMixin):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    type = Column(Text, nullable=False, default='default')
    sender_type = Column(Text, unique=True, index=True, nullable=False)
    style_id = Column(UUID(as_uuid=True), nullable=True, comment="template_styles.id")
    content = Column(Text, nullable=True)
    example_content = Column(JSON, nullable=True)
    source_commit = Column(Text)
    content_hash = Column(Text)