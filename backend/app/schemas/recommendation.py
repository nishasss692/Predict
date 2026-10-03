from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    cluster_id: str
    recommended_action: str

    class Config:
        from_attributes = True