import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base
from .base import TimestampMixin

class Sender(Base, TimestampMixin):
    __tablename__ = "senders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, comment="user.id")
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    smtp_host = Column(String, nullable=False)
    smtp_port = Column(Integer, nullable=False)
    smtp_username = Column(String, nullable=False)
    smtp_password = Column(String, nullable=False)
    use_tls = Column(Boolean, default=True)
    use_ssl = Column(Boolean, default=False)