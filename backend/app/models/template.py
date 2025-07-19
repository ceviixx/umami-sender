# app/models/template.py

from sqlalchemy import Column, Integer, String, Text, JSON
from app.database import Base
import enum

class MailTemplate(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Text, nullable=False, default='default')
    sender_type = Column(Text, nullable=False, default='email')
    description = Column(String, nullable=True)
    html = Column(Text, nullable=True)
    json = Column(JSON, nullable=True)
    
