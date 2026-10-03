from datetime import datetime
from pydantic import BaseModel


class IncidentEvidence(BaseModel):
    incident_id: str
    area: str
    type: str
    description: str
    latitude: float
    longitude: float
    timestamp: datetime
    severity: str


class WeatherEvidence(BaseModel):
    timestamp: datetime
    rainfall_mm: float
    temperature_c: float


class SensorEvidence(BaseModel):
    sensor_id: str
    area: str
    latitude: float
    longitude: float
    timestamp: datetime
    water_level: float
    status: str


class TrafficEvidence(BaseModel):
    area: str
    latitude: float
    longitude: float
    timestamp: datetime
    average_speed_kmh: float
    congestion_level: str


class EvidenceData(BaseModel):
    incidents: list[IncidentEvidence]
    weather: list[WeatherEvidence]
    sensors: list[SensorEvidence]
    traffic: list[TrafficEvidence]


class EvidenceResponse(BaseModel):
    cluster_id: str
    evidence: EvidenceData