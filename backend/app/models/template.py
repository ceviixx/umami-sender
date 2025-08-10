import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, Text, JSON, Boolean
from app.database import Base

class MailTemplate(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    type = Column(Text, nullable=False, default='default')
    sender_type = Column(Text, nullable=False, default='email')
    style_id = Column(UUID(as_uuid=True), nullable=True, comment="template_styles.id")
    content = Column(Text, nullable=True)
    example_content = Column(JSON, nullable=True)
    is_customized = Column(Boolean, nullable=False, default=False, server_default="false")