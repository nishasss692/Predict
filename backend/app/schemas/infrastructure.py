from pydantic import BaseModel


class InfrastructureResponse(BaseModel):
    infrastructure_id: str
    type: str
    area: str
    latitude: float
    longitude: float
    status: str

    class Config:
        from_attributes = True