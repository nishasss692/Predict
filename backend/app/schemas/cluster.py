from datetime import datetime
from pydantic import BaseModel


class ClusterResponse(BaseModel):
    cluster_id: str
    incident_ids: list[str]
    centroid_lat: float
    centroid_lon: float
    start_time: datetime
    end_time: datetime
    categories: list[str]
    cluster_score: float