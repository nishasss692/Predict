from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.root_cause import RootCause
from app.models.recommendation import Recommendation
from app.database import get_db

from app.schemas.root_cause import (
    RootCauseRequest,
    RootCauseResponse
)
from app.schemas.recommendation import RecommendationResponse

from app.services.clustering_service import cluster_incidents
from app.services.cluster_output_service import build_cluster_output
from app.services.evidence_service import get_cluster_evidence
from app.services.root_cause_service import analyze_root_cause
from app.services.root_cause_persistence_service import save_root_cause
from app.services.recommendation_persistence_service import save_recommendation


router = APIRouter(
    prefix="/root-cause",
    tags=["Root Cause"]
)


@router.post(
    "/save",
    response_model=RootCauseResponse
)
def save_root_cause_result(
    root_cause: RootCauseResponse,
    db: Session = Depends(get_db),
):
    return save_root_cause(db, root_cause)


@router.post(
    "/recommendation/save",
    response_model=RecommendationResponse
)
def save_recommendation_result(
    recommendation: RecommendationResponse,
    db: Session = Depends(get_db),
):
    return save_recommendation(db, recommendation)
@router.get(
    "/{cluster_id}",
    response_model=RootCauseResponse
)
def get_root_cause(
    cluster_id: str,
    db: Session = Depends(get_db)
):
    root_cause = (
        db.query(RootCause)
        .filter(RootCause.cluster_id == cluster_id)
        .first()
    )

    if root_cause is None:
        raise HTTPException(
            status_code=404,
            detail=f"Root cause for cluster {cluster_id} not found"
        )

    return root_cause
@router.get(
    "/{cluster_id}/recommendation",
    response_model=RecommendationResponse
)
def get_recommendation(
    cluster_id: str,
    db: Session = Depends(get_db)
):
    recommendation = (
        db.query(Recommendation)
        .filter(Recommendation.cluster_id == cluster_id)
        .first()
    )

    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail=f"Recommendation for cluster {cluster_id} not found"
        )

    return recommendation
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