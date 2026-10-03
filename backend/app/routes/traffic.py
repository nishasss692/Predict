from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.traffic import Traffic

router = APIRouter(prefix="/traffic", tags=["Traffic"])


@router.get("/")
def get_traffic(db: Session = Depends(get_db)):
    return db.query(Traffic).all()