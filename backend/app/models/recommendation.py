from sqlalchemy import Column, String
from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    cluster_id = Column(String, primary_key=True, index=True)
    recommended_action = Column(String, nullable=False)