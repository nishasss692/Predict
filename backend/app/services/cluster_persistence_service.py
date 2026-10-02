from sqlalchemy.orm import Session

from app.models.cluster import Cluster


def save_cluster(db: Session, cluster_data):
    cluster = Cluster(
        cluster_id=cluster_data.cluster_id,
        incident_ids=cluster_data.incident_ids,
        centroid_lat=cluster_data.centroid_lat,
        centroid_lon=cluster_data.centroid_lon,
        start_time=cluster_data.start_time,
        end_time=cluster_data.end_time,
        categories=cluster_data.categories,
        cluster_score=cluster_data.cluster_score,
    )

    saved_cluster = db.merge(cluster)
    db.commit()
    db.refresh(saved_cluster)

    return saved_cluster