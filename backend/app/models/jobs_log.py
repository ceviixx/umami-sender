from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class JobLog(Base):
    __tablename__ = "jobs_log"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, nullable=False)
    error = Column(Text, nullable=True)
    channel = Column(String, nullable=False, default="email")
    
    job = relationship("Job", back_populates="logs")