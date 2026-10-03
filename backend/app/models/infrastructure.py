from sqlalchemy import Column, String, Float
from app.database import Base


class Infrastructure(Base):
    __tablename__ = "infrastructure"

    infrastructure_id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)
    area = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String, nullable=False)