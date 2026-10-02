from datetime import timedelta

from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.models.weather import Weather
from app.models.sensor import Sensor
from app.models.traffic import Traffic


def get_cluster_evidence(
    db: Session,
    incident_ids: list[str]
):
    # 1. Get incidents belonging to the cluster
    incidents = (
        db.query(Incident)
        .filter(Incident.incident_id.in_(incident_ids))
        .all()
    )

    if not incidents:
        return {
            "incidents": [],
            "weather": [],
            "sensors": [],
            "traffic": []
        }

    # Determine cluster time range
    timestamps = [incident.timestamp for incident in incidents]

    start_time = min(timestamps)
    end_time = max(timestamps)

    # Add a small time window around the cluster
    window_start = start_time - timedelta(hours=1)
    window_end = end_time + timedelta(hours=1)

    # Areas involved in the cluster
    areas = list({
        incident.area
        for incident in incidents
    })

    # 2. Weather around the cluster time
    weather = (
        db.query(Weather)
        .filter(
            Weather.timestamp >= window_start,
            Weather.timestamp <= window_end
        )
        .all()
    )

    # 3. Drain sensor readings from the relevant areas
    sensors = (
        db.query(Sensor)
        .filter(
            Sensor.area.in_(areas),
            Sensor.timestamp >= window_start,
            Sensor.timestamp <= window_end
        )
        .all()
    )

    # 4. Traffic readings from the relevant areas
    traffic = (
        db.query(Traffic)
        .filter(
            Traffic.area.in_(areas),
            Traffic.timestamp >= window_start,
            Traffic.timestamp <= window_end
        )
        .all()
    )

    return {
        "incidents": incidents,
        "weather": weather,
        "sensors": sensors,
        "traffic": traffic
    }