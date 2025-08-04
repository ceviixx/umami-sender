# app/models/template.py

from sqlalchemy import Column, Integer, Text, JSON, Boolean
from app.database import Base

class MailTemplate(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Text, nullable=False, default='default')
    sender_type = Column(Text, nullable=False, default='email')
    style_id = Column(Integer, nullable=False, default=1, server_default='1')
    content = Column(Text, nullable=True)
    example_content = Column(JSON, nullable=True)
    is_customized = Column(Boolean, nullable=False, default=False, server_default="false")