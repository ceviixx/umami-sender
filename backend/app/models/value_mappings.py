from sqlalchemy import Column, Integer, Text
from app.database import Base

class ValueMappings(Base):
    __tablename__ = "value_mappings"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Text, nullable=False, comment="country | currency | device | ...")
    key = Column(Text, nullable=False, comment="DE | USD | desktop | ...")
    value = Column(Text, nullable=False)