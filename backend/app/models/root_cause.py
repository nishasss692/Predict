from sqlalchemy import Column, String, Float, ARRAY
from app.database import Base


class RootCause(Base):
    __tablename__ = "root_causes"

    cluster_id = Column(String, primary_key=True, index=True)
    root_cause = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    evidence = Column(ARRAY(String), nullable=False)
    priority = Column(String, nullable=False)
    affected_incidents = Column(ARRAY(String), nullable=False)
    recommended_action = Column(String, nullable=False)