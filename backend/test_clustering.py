import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

from app.models import Incident, Weather, Sensor, Traffic
from app.database import SessionLocal
from app.services.clustering_service import cluster_incidents


db = SessionLocal()

try:
    results = cluster_incidents(db)

    print(f"Total results: {len(results)}")

    for result in results[:10]:
        print(result)

finally:
    db.close()