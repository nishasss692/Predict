from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation


def save_recommendation(db: Session, recommendation_data):
    recommendation = Recommendation(
        cluster_id=recommendation_data.cluster_id,
        recommended_action=recommendation_data.recommended_action,
    )

    saved_recommendation = db.merge(recommendation)
    db.commit()
    db.refresh(saved_recommendation)

    return saved_recommendation