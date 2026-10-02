from fastapi import FastAPI

from app.routes.incidents import router as incident_router
from app.routes.weather import router as weather_router
from app.routes.sensors import router as sensor_router
from app.routes.traffic import router as traffic_router

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