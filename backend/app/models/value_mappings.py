import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, Text
from app.database import Base

class ValueMappings(Base):
    __tablename__ = "value_mappings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    type = Column(Text, nullable=False, comment="country | currency | device | ...")
    key = Column(Text, nullable=False, comment="DE | USD | desktop | ...")
    value = Column(Text, nullable=False)