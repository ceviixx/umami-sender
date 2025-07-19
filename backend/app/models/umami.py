# app/models/umami.py

from sqlalchemy import Column, Integer, String, Enum as SqlEnum
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from .base import TimestampMixin

class UmamiType(enum.Enum):
    cloud = "cloud"
    self_hosted = "self_hosted"

class Umami(Base, TimestampMixin):
    __tablename__ = "umami"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(SqlEnum(UmamiType), nullable=False)

    # Für Cloud-Instanzen
    api_key = Column(String, nullable=True)

    # Für Self-hosted
    hostname = Column(String, nullable=True)
    username = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)
    bearer_token = Column(String, nullable=True)

    # Beziehung zu MailerJobs
    mailer_jobs = relationship("MailerJob", back_populates="host", cascade="all, delete-orphan")


# Wichtig: Importieren, damit SQLAlchemy die Beziehung kennt
from app.models.mailer import MailerJob