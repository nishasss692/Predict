import csv
from datetime import datetime

from app.database import SessionLocal
from app.models.traffic import Traffic


CSV_PATH = "../data/generated/traffic.csv"


def load_traffic():
    db = SessionLocal()

    try:
        with open(CSV_PATH, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)

            count = 0

            for row in reader:
                traffic = Traffic(
                    area=row["area"],
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    average_speed_kmh=float(row["average_speed_kmh"]),
                    congestion_level=row["congestion_level"]
                )

                db.add(traffic)
                count += 1

        db.commit()

        print(f"Successfully loaded {count} traffic records.")

    except Exception as e:
        db.rollback()
        print("Error loading traffic:", e)

    finally:
        db.close()


if __name__ == "__main__":
    load_traffic()