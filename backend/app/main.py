from fastapi import FastAPI

from app.routes.incidents import router as incident_router

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