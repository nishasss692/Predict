from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cluster import Cluster
from app.services.evidence_service import get_cluster_evidence


router = APIRouter(
    prefix="/clusters",
    tags=["Evidence"]
)


@router.get("/{cluster_id}/evidence")
def get_evidence(
    cluster_id: str,
    db: Session = Depends(get_db)
):
    # Find the saved cluster
    cluster = (
        db.query(Cluster)
        .filter(Cluster.cluster_id == cluster_id)
        .first()
    )

    if cluster is None:
        raise HTTPException(
            status_code=404,
            detail=f"Cluster {cluster_id} not found"
        )

    # Get the incident IDs stored for this cluster
    incident_ids = cluster.incident_ids

    if not incident_ids:
        return {
            "cluster_id": cluster_id,
            "data": {
                "incidents": [],
                "weather": [],
                "sensors": [],
                "traffic": []
            }
        }

    # Retrieve evidence using the saved incident IDs
    evidence = get_cluster_evidence(
        db,
        incident_ids
    )

    return {
        "cluster_id": cluster_id,
        "data": evidence
    }