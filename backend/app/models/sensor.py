from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sensor_id = Column(String, nullable=False, index=True)
    area = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    water_level = Column(Float, nullable=False)
    status = Column(String, nullable=False)