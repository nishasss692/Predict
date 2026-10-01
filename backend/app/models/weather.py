from sqlalchemy import Column, Float, DateTime
from app.database import Base


class Weather(Base):
    __tablename__ = "weather"

    timestamp = Column(DateTime, primary_key=True)
    rainfall_mm = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=False)