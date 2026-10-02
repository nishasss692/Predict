from fastapi import FastAPI
from app.routes.evidence import router as evidence_router
from app.models import Incident, Weather, Sensor, Traffic
from app.database import Base, engine
from app.routes.clusters import router as cluster_router
from app.routes.incidents import router as incident_router
from app.routes.weather import router as weather_router
from app.routes.sensors import router as sensor_router
from app.routes.traffic import router as traffic_router
from app.routes.root_cause import router as root_cause_router
from app.models.infrastructure import Infrastructure
from app.routes.infrastructure import router as infrastructure_router
from app.models.cluster import Cluster
from app.models.root_cause import RootCause
from app.models.recommendation import Recommendation

Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Bengaluru Civic Brain API",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Bengaluru Civic Brain API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


app.include_router(incident_router)
app.include_router(weather_router)
app.include_router(sensor_router)
app.include_router(traffic_router)
app.include_router(cluster_router)
app.include_router(evidence_router)
app.include_router(root_cause_router)
app.include_router(infrastructure_router)
