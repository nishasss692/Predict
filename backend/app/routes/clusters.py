from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cluster import Cluster
from app.schemas.cluster import ClusterResponse
from app.services.cluster_persistence_service import save_cluster


router = APIRouter(
    prefix="/clusters",
    tags=["Clusters"]
)


@router.post("/save", response_model=ClusterResponse)
def save_cluster_result(
    cluster: ClusterResponse,
    db: Session = Depends(get_db),
):
    return save_cluster(db, cluster)


@router.get("/", response_model=list[ClusterResponse])
def get_clusters(
    db: Session = Depends(get_db)
):
    return (
        db.query(Cluster)
        .order_by(Cluster.cluster_id)
        .all()
    )