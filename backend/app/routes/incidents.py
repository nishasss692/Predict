from types import SimpleNamespace

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement

import pandas as pd

from app.database import get_db
from app.models.incident import Incident
from app.models.weather import Weather
from app.models.sensor import Sensor
from app.models.traffic import Traffic
from app.schemas.incident import IncidentCreate, IncidentResponse

from app.services.evidence_service import get_cluster_evidence
from app.services.cluster_persistence_service import save_cluster
from app.services.root_cause_persistence_service import save_root_cause
from app.services.recommendation_persistence_service import save_recommendation

from ml.classification.classifier import classify_incident
from ml.clustering.clustering import run_clustering
from ml.root_cause.root_cause import detect_root_cause
from ml.recommendation.recommendation import generate_recommendation


router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


@router.post("/", response_model=IncidentResponse)
def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db)
):
    new_incident = Incident(
        **incident.model_dump(),
        location=WKTElement(
            f"POINT({incident.longitude} {incident.latitude})",
            srid=4326
        )
    )

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return new_incident


@router.get("/", response_model=list[IncidentResponse])
def get_incidents(
    db: Session = Depends(get_db)
):
    return db.query(Incident).all()


@router.get("/analysis")
def analyze_incidents(
    db: Session = Depends(get_db)
):

    # ---------------------------------------------------------
    # 1. Load incidents from PostgreSQL
    # ---------------------------------------------------------

    incident_rows = db.query(
        Incident.incident_id,
        Incident.area,
        Incident.type,
        Incident.description,
        Incident.latitude,
        Incident.longitude,
        Incident.timestamp,
        Incident.severity
    ).all()

    incidents = pd.DataFrame(
        incident_rows,
        columns=[
            "incident_id",
            "area",
            "type",
            "description",
            "latitude",
            "longitude",
            "timestamp",
            "severity"
        ]
    )

    if incidents.empty:
        return {
            "clusters": []
        }

    # ---------------------------------------------------------
    # 2. Convert timestamps
    # ---------------------------------------------------------

    incidents["timestamp"] = pd.to_datetime(
        incidents["timestamp"]
    )

    # ---------------------------------------------------------
    # 3. Classify incidents
    # ---------------------------------------------------------

    incidents["predicted_type"] = incidents["description"].apply(
        classify_incident
    )

    # ---------------------------------------------------------
    # 4. Cluster incidents
    # ---------------------------------------------------------

    incident_results, cluster_results = run_clustering(
        incidents
    )

    # ---------------------------------------------------------
    # 5. Analyze clusters
    # ---------------------------------------------------------

    analysis_results = []

    for cluster in cluster_results:

        cluster_id = cluster["cluster_id"]
        incident_ids = cluster["incident_ids"]

        # -----------------------------------------------------
        # 5A. Save cluster to PostgreSQL
        # -----------------------------------------------------

        cluster_data = SimpleNamespace(
            cluster_id=cluster["cluster_id"],
            incident_ids=cluster["incident_ids"],
            centroid_lat=cluster["centroid_lat"],
            centroid_lon=cluster["centroid_lon"],
            start_time=cluster["start_time"],
            end_time=cluster["end_time"],
            categories=cluster["categories"],
            cluster_score=cluster["cluster_score"]
        )

        save_cluster(
            db,
            cluster_data
        )

        # -----------------------------------------------------
        # 5B. Get incidents belonging to this cluster
        # -----------------------------------------------------

        cluster_incidents = incident_results[
            incident_results["incident_id"].isin(incident_ids)
        ].copy()

        if cluster_incidents.empty:
            continue

        # -----------------------------------------------------
        # 5C. Get contextual evidence from PostgreSQL
        # -----------------------------------------------------

        evidence = get_cluster_evidence(
            db,
            incident_ids
        )

        if not evidence["incidents"]:
            continue

        weather = pd.DataFrame(
            evidence["weather"]
        )

        sensors = pd.DataFrame(
            evidence["sensors"]
        )

        traffic = pd.DataFrame(
            evidence["traffic"]
        )

        if weather.empty:
            continue

        if sensors.empty:
            continue

        if traffic.empty:
            continue

        # -----------------------------------------------------
        # 6. Select strongest contextual evidence
        # -----------------------------------------------------

        weather["timestamp"] = pd.to_datetime(
            weather["timestamp"]
        )

        sensors["timestamp"] = pd.to_datetime(
            sensors["timestamp"]
        )

        traffic["timestamp"] = pd.to_datetime(
            traffic["timestamp"]
        )

        # Highest rainfall
        weather_record = weather.loc[
            weather["rainfall_mm"].idxmax()
        ]

        # Highest drain water level
        sensor_record = sensors.loc[
            sensors["water_level"].idxmax()
        ]

        # Most severe traffic
        congestion_priority = {
            "severe": 3,
            "high": 2,
            "medium": 1,
            "low": 0
        }

        traffic["congestion_score"] = (
            traffic["congestion_level"]
            .str.lower()
            .map(congestion_priority)
            .fillna(-1)
        )

        traffic_record = traffic.loc[
            traffic["congestion_score"].idxmax()
        ]

        # -----------------------------------------------------
        # 7. Root-cause analysis
        # -----------------------------------------------------

        result = detect_root_cause(
            cluster_incidents,
            weather_record,
            sensor_record,
            traffic_record,
            cluster_id
        )

        # -----------------------------------------------------
        # 8. Generate recommendation
        # -----------------------------------------------------

        result["recommended_action"] = generate_recommendation(
            result["root_cause"],
            result["priority"]
        )

        # -----------------------------------------------------
        # 9. Save root cause to PostgreSQL
        # -----------------------------------------------------

        root_cause_data = SimpleNamespace(
            cluster_id=result["cluster_id"],
            root_cause=result["root_cause"],
            confidence=result["confidence"],
            evidence=result["evidence"],
            priority=result["priority"],
            affected_incidents=result["affected_incidents"],
            recommended_action=result["recommended_action"]
        )

        save_root_cause(
            db,
            root_cause_data
        )

        # -----------------------------------------------------
        # 10. Save recommendation to PostgreSQL
        # -----------------------------------------------------

        recommendation_data = SimpleNamespace(
            cluster_id=result["cluster_id"],
            recommended_action=result["recommended_action"]
        )

        save_recommendation(
            db,
            recommendation_data
        )

        # -----------------------------------------------------
        # 11. Add result to API response
        # -----------------------------------------------------

        analysis_results.append(result)

    # ---------------------------------------------------------
    # 12. Return analysis
    # ---------------------------------------------------------

    return {
        "clusters": analysis_results
    }