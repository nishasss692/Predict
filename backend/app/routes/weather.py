from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.weather import Weather

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/")
def get_weather(db: Session = Depends(get_db)):
    return db.query(Weather).all()