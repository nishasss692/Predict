import sys
from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.append(str(PROJECT_ROOT))

from app.models.incident import Incident
from ml.classification.classifier import classify_incident
from ml.clustering.clustering import run_clustering


def cluster_incidents(db: Session):

    incidents = db.query(Incident).all()

    if not incidents:
        return []

    data = [
        {
            "incident_id": incident.incident_id,
            "type": incident.type,
            "description": incident.description,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "timestamp": incident.timestamp,
        }
        for incident in incidents
    ]

    df = pd.DataFrame(data)

    # Classify incidents before clustering
    df["predicted_type"] = df["description"].apply(
        classify_incident
    )

    incident_results, cluster_results = run_clustering(df)

    return incident_results.to_dict(orient="records")