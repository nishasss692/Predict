from app.database import SessionLocal
from app.services.evidence_service import get_cluster_evidence
from app.services.clustering_service import cluster_incidents
from app.services.cluster_output_service import build_cluster_output


db = SessionLocal()

try:
    # Get all clusters
    clustering_results = cluster_incidents(db)
    clusters = build_cluster_output(clustering_results)

    # Find our main demo cluster
    target_cluster = next(
        cluster
        for cluster in clusters
        if cluster["cluster_id"] == "3_8"
    )

    print("Cluster:", target_cluster["cluster_id"])
    print("Incidents:", len(target_cluster["incident_ids"]))
    print("Categories:", target_cluster["categories"])

    # Retrieve supporting evidence
    evidence = get_cluster_evidence(
        db,
        target_cluster["incident_ids"]
    )

    print("\nEvidence:")
    print("Incidents:", len(evidence["incidents"]))
    print("Weather:", len(evidence["weather"]))
    print("Sensors:", len(evidence["sensors"]))
    print("Traffic:", len(evidence["traffic"]))

finally:
    db.close()