# app/models/template.py

from sqlalchemy import Column, Integer, Text
from app.database import Base

class MailTemplate(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Text, nullable=False, default='default')
    sender_type = Column(Text, nullable=False, default='email')
    content = Column(Text, nullable=True)