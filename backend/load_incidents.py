import csv
from datetime import datetime

from app.database import SessionLocal
from app.models.incident import Incident


CSV_PATH = "../data/generated/incidents.csv"


def load_incidents():
    db = SessionLocal()

    try:
        with open(CSV_PATH, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)

            count = 0

            for row in reader:
                incident = Incident(
                    incident_id=row["incident_id"],
                    area=row["area"],
                    type=row["type"],
                    description=row["description"],
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    severity=row["severity"]
                )

                db.add(incident)
                count += 1

        db.commit()

        print(f"Successfully loaded {count} incidents.")

    except Exception as e:
        db.rollback()
        print("Error loading incidents:", e)

    finally:
        db.close()


if __name__ == "__main__":
    load_incidents()