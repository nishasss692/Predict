from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.root_cause import (
    RootCauseRequest,
    RootCauseResponse
)
from app.services.clustering_service import cluster_incidents
from app.services.cluster_output_service import build_cluster_output
from app.services.evidence_service import get_cluster_evidence
from app.services.root_cause_service import analyze_root_cause


router = APIRouter(
    prefix="/root-cause",
    tags=["Root Cause"]
)


@router.post(
    "/analyze",
    response_model=RootCauseResponse
)
def analyze(
    request: RootCauseRequest,
    db: Session = Depends(get_db)
):
    # Get current clusters
    clustering_results = cluster_incidents(db)
    clusters = build_cluster_output(clustering_results)

    # Find requested cluster
    cluster = next(
        (
            cluster
            for cluster in clusters
            if cluster["cluster_id"] == request.cluster_id
        ),
        None
    )

    if cluster is None:
        raise HTTPException(
            status_code=404,
            detail=f"Cluster {request.cluster_id} not found"
        )

    # Retrieve evidence
    evidence = get_cluster_evidence(
        db,
        cluster["incident_ids"]
    )

    # Run root-cause analysis
    result = analyze_root_cause(
        request.cluster_id,
        evidence
    )

    return result