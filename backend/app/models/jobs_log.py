import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class JobLog(Base):
    __tablename__ = "jobs_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    run = Column(UUID(as_uuid=True), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, nullable=False)
    error = Column(Text, nullable=True)
    channel = Column(String, nullable=False, default="email")
    
    job = relationship("Job", back_populates="logs")
