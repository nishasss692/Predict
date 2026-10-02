from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.clustering_service import cluster_incidents
from app.services.cluster_output_service import build_cluster_output
from app.schemas.cluster import ClusterResponse


router = APIRouter(
    prefix="/clusters",
    tags=["Clusters"]
)


@router.get("/", response_model=list[ClusterResponse])
def get_clusters(db: Session = Depends(get_db)):

    clustering_results = cluster_incidents(db)

    clusters = build_cluster_output(clustering_results)

    return clusters