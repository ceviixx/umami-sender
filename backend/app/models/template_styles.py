import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, Text, Boolean
from app.database import Base

class MailTemplateStyle(Base):
    __tablename__ = "template_styles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    css = Column(Text, nullable=True)
    is_default = Column(Boolean, nullable=False, default=False, server_default='false')
    is_customized = Column(Boolean, nullable=False, default=False, server_default='false')