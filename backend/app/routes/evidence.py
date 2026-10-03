from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.evidence import EvidenceResponse
from app.database import get_db
from app.services.clustering_service import cluster_incidents
from app.services.cluster_output_service import build_cluster_output
from app.services.evidence_service import get_cluster_evidence


router = APIRouter(
    prefix="/clusters",
    tags=["Cluster Evidence"]
)


@router.get(
    "/{cluster_id}/evidence",
    response_model=EvidenceResponse
)
def get_evidence(
    cluster_id: str,
    db: Session = Depends(get_db)
):
    # Generate current clusters
    clustering_results = cluster_incidents(db)
    clusters = build_cluster_output(clustering_results)

    # Find requested cluster
    cluster = next(
        (
            cluster
            for cluster in clusters
            if cluster["cluster_id"] == cluster_id
        ),
        None
    )

    if cluster is None:
        raise HTTPException(
            status_code=404,
            detail=f"Cluster {cluster_id} not found"
        )

    evidence = get_cluster_evidence(
        db,
        cluster["incident_ids"]
    )

    return {
        "cluster_id": cluster_id,
        "evidence": evidence
    }