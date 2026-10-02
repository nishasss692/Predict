from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.infrastructure import Infrastructure
from app.schemas.infrastructure import InfrastructureResponse


router = APIRouter(
    prefix="/infrastructure",
    tags=["Infrastructure"]
)


@router.get("/", response_model=list[InfrastructureResponse])
def get_infrastructure(db: Session = Depends(get_db)):
    return db.query(Infrastructure).all()