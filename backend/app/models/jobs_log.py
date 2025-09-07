import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class JobLog(Base):
    __tablename__ = "jobs_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    job = relationship("Job", back_populates="logs")

    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    status = Column(String, nullable=False, default="running")

    details = Column(JSONB, nullable=False, default=list)

    count_success = Column(Integer, nullable=False, default=0)
    count_failed = Column(Integer, nullable=False, default=0)
    count_skipped = Column(Integer, nullable=False, default=0)
    triggered_by = Column(String, nullable=True)