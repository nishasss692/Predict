
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement

from app.database import get_db
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentResponse
import pandas as pd

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
def get_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).all()


@router.get("/analysis")
def analyze_incidents():

    incidents = pd.read_csv("data/generated/incidents.csv")
    weather = pd.read_csv("data/generated/weather.csv")
    sensors = pd.read_csv("data/generated/sensors.csv")
    traffic = pd.read_csv("data/generated/traffic.csv")
    
    incidents["timestamp"] = pd.to_datetime(incidents["timestamp"])
    weather["timestamp"] = pd.to_datetime(weather["timestamp"])
    sensors["timestamp"] = pd.to_datetime(sensors["timestamp"])
    traffic["timestamp"] = pd.to_datetime(traffic["timestamp"])
    # 1. Classify incidents
    incidents["predicted_type"] = incidents["description"].apply(
        classify_incident
    )

    # 2. Cluster incidents
    incident_results, cluster_results = run_clustering(
        incidents
    )

    # 3. Analyze each cluster
    analysis_results = []

    for cluster in cluster_results:

        cluster_id = cluster["cluster_id"]
        incident_ids = cluster["incident_ids"]

        cluster_incidents = incident_results[
            incident_results["incident_id"].isin(incident_ids)
        ]

        # Use the first incident's timestamp as the event time
        event_time = cluster_incidents["timestamp"].min()

        weather_match = weather[
            weather["timestamp"] == event_time
        ]

        sensor_match = sensors[
            sensors["timestamp"] == event_time
        ]

        traffic_match = traffic[
            traffic["timestamp"] == event_time
        ]

        if weather_match.empty:
            continue

        if sensor_match.empty:
            continue

        if traffic_match.empty:
            continue

        result = detect_root_cause(
            cluster_incidents,
            weather_match.iloc[0],
            sensor_match.iloc[0],
            traffic_match.iloc[0],
            cluster_id
        )

        result["recommended_action"] = generate_recommendation(
            result["root_cause"],
            result["priority"]
        )

        analysis_results.append(result)

    return {
        "clusters": analysis_results
    }