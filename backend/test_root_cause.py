from app.database import SessionLocal

from app.services.clustering_service import cluster_incidents
from app.services.cluster_output_service import build_cluster_output
from app.services.evidence_service import get_cluster_evidence
from app.services.root_cause_service import analyze_root_cause


db = SessionLocal()

try:
    # Get all clusters
    clustering_results = cluster_incidents(db)
    clusters = build_cluster_output(clustering_results)

    # Find our main demo cluster
    cluster = next(
        cluster
        for cluster in clusters
        if cluster["cluster_id"] == "3_8"
    )

    # Get evidence for the cluster
    evidence = get_cluster_evidence(
        db,
        cluster["incident_ids"]
    )

    # Run root-cause analysis
    result = analyze_root_cause(
        cluster["cluster_id"],
        evidence
    )

    print("\nROOT CAUSE ANALYSIS")
    print("-------------------")
    print(f"Cluster: {result['cluster_id']}")
    print(f"Root cause: {result['root_cause']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Priority: {result['priority']}")

    print("\nEvidence:")
    for item in result["evidence"]:
        print(f"- {item}")

    print("\nRecommended action:")
    print(result["recommended_action"])

    print(
        f"\nAffected incidents: "
        f"{len(result['affected_incidents'])}"
    )

finally:
    db.close()