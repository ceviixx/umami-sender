# app/models/template.py

from sqlalchemy import Column, Integer, Text, Boolean
from app.database import Base

class MailTemplateStyle(Base):
    __tablename__ = "template_styles"

    id = Column(Integer, primary_key=True, index=True)
    css = Column(Text, nullable=True)
    is_default = Column(Boolean, nullable=False, default=False, server_default='false')
    is_customized = Column(Boolean, nullable=False, default=False, server_default='false')