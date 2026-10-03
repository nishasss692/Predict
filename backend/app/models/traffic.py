from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base


class Traffic(Base):
    __tablename__ = "traffic"

    id = Column(Integer, primary_key=True, autoincrement=True)
    area = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    average_speed_kmh = Column(Float, nullable=False)
    congestion_level = Column(String, nullable=False)