from sqlalchemy import Column, Integer, String, ForeignKey, Enum, ARRAY, Boolean, Time, text
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from .base import TimestampMixin

class Frequency(str, enum.Enum):
    hourly = "hourly"
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"

class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, default= "")
    sender_id = Column(Integer, ForeignKey("senders.id"), nullable=True)
    template_type = Column(String, nullable=False, default='default')
    host_id = Column(Integer, ForeignKey("umami.id"))
    website_id = Column(String, nullable=False)
    report_type = Column(String, default="summary", comment="Could be summary or report")
    summary_items = Column(ARRAY(String), default=[], comment="Only needed when report_type = summary")
    report_id = Column(String, nullable=True, comment="Only needed when report_type = report")
    frequency = Column(Enum(Frequency), default="weekly", comment="hourly | daily | weekly | monthly | yearly")
    day = Column(Integer, nullable=True, comment="0 = Monday, 6 = Sunday")
    execution_time = Column(Time, nullable=False, server_default=text("'08:00:00'"), comment="Execution time in UTC (e.g. 08:00 UTC = 10:00 Berlin time)")
    email_recipients = Column(ARRAY(String), default=[])
    webhook_recipients = Column(ARRAY(Integer), default=[])
    timezone = Column(String, default='Europe/Berlin', comment="Timezone for all reque")
    is_active = Column(Boolean, default=True)

    host = relationship("Umami", back_populates="mailer_jobs")
    logs = relationship("JobLog", back_populates="job", cascade="all, delete-orphan")
    sender = relationship("Sender")