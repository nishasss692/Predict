from pydantic import BaseModel


class RootCauseRequest(BaseModel):
    cluster_id: str


class RootCauseResponse(BaseModel):
    cluster_id: str
    root_cause: str
    confidence: float
    evidence: list[str]
    priority: str
    affected_incidents: list[str]
    recommended_action: str