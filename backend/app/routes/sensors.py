from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sensor import Sensor

router = APIRouter(prefix="/sensors", tags=["Sensors"])


@router.get("/")
def get_sensors(db: Session = Depends(get_db)):
    return db.query(Sensor).all()