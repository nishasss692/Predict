from datetime import datetime
from pydantic import BaseModel


class IncidentBase(BaseModel):
    incident_id: str
    timestamp: datetime
    latitude: float
    longitude: float
    category: str
    description: str
    severity: str
    source: str
    status: str


class IncidentCreate(IncidentBase):
    pass


class IncidentResponse(IncidentBase):
    class Config:
        from_attributes = True