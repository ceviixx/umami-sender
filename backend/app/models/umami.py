import uuid, enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Boolean, TIMESTAMP, String, Enum as SqlEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from .base import TimestampMixin

class UmamiType(enum.Enum):
    cloud = "cloud"
    self_hosted = "self_hosted"

class Umami(Base, TimestampMixin):
    __tablename__ = "umami"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="SET NULL"), nullable=True, index=True, comment="user.id")
    
    name = Column(String, nullable=False)
    type = Column(SqlEnum(UmamiType), nullable=False)

    api_key = Column(String, nullable=True)
    hostname = Column(String, nullable=True)
    username = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)
    bearer_token = Column(String, nullable=True)

    is_healthy = Column(Boolean, nullable=False, server_default="true")
    last_healthy_check_at = Column(TIMESTAMP, nullable=False, server_default="now()")
    health_response = Column(String, nullable=True)

    user = relationship("User", back_populates="umamis")
    mailer_jobs = relationship("Job", back_populates="host", cascade="all, delete-orphan")
