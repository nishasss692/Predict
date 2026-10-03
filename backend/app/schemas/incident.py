from datetime import datetime
from pydantic import BaseModel


class IncidentBase(BaseModel):
    incident_id: str
    area: str
    type: str
    description: str
    latitude: float
    longitude: float
    timestamp: datetime
    severity: str


class IncidentCreate(IncidentBase):
    pass


class IncidentResponse(IncidentBase):
    class Config:
        from_attributes = True