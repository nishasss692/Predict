from sqlalchemy import Column, String, Float, DateTime, ARRAY
from app.database import Base


class Cluster(Base):
    __tablename__ = "clusters"

    cluster_id = Column(String, primary_key=True, index=True)
    incident_ids = Column(ARRAY(String), nullable=False)
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    categories = Column(ARRAY(String), nullable=False)
    cluster_score = Column(Float, nullable=False)