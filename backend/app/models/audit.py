import uuid, enum
from sqlalchemy import Column, String, Text, Enum as SqlEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP, INET, JSONB
from sqlalchemy.sql import text
from sqlalchemy.orm import relationship
from app.database import Base
from .base import TimestampMixin

class ActorKind(str, enum.Enum):
    user = "user"
    system = "system"

class AuditStatus(str, enum.Enum):
    success = "success"
    failed = "failed"
    warning = "warning"
    info = "info"

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    actor_kind = Column(SqlEnum(ActorKind), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_label = Column(String, nullable=True, comment="snapshot: username, 'system', worker-name, etc.")

    action = Column(String, nullable=False, comment="e.g. user.delete, job.run, sender.update")
    status = Column(SqlEnum(AuditStatus), nullable=False, server_default="info")

    target_type = Column(String, nullable=True,  comment="e.g. user, job, umami, sender, webhook")
    target_id = Column(String, nullable=True) 
    message = Column(Text, nullable=True)

    request_id  = Column(String, nullable=True, index=True)
    correlation_id = Column(String, nullable=True, index=True) 
    ip = Column(INET, nullable=True)
    user_agent  = Column(Text, nullable=True)

    changes = Column(JSONB(none_as_null=True), nullable=True, comment="diff/change-set: {field: {old, new}}")
    context = Column(JSONB(none_as_null=True), nullable=True, comment="additional metadata")

    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))

    user = relationship("User")
