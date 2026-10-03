from app.database import SessionLocal
from app.services.clustering_service import cluster_incidents
from app.services.cluster_output_service import build_cluster_output


db = SessionLocal()

try:
    clustering_results = cluster_incidents(db)

    clusters = build_cluster_output(clustering_results)

    print(f"Total clusters: {len(clusters)}")

    for cluster in clusters[:5]:
        print(cluster)

finally:
    db.close()