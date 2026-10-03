from sqlalchemy.orm import Session

from app.models.root_cause import RootCause


def save_root_cause(db: Session, root_cause_data):
    root_cause = RootCause(
        cluster_id=root_cause_data.cluster_id,
        root_cause=root_cause_data.root_cause,
        confidence=root_cause_data.confidence,
        evidence=root_cause_data.evidence,
        priority=root_cause_data.priority,
        affected_incidents=root_cause_data.affected_incidents,
        recommended_action=root_cause_data.recommended_action,
    )

    saved_root_cause = db.merge(root_cause)
    db.commit()
    db.refresh(saved_root_cause)

    return saved_root_cause