import csv
from datetime import datetime

from app.database import SessionLocal
from app.models.sensor import Sensor


CSV_PATH = "../data/generated/sensors.csv"


def load_sensors():
    db = SessionLocal()

    try:
        with open(CSV_PATH, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)

            count = 0

            for row in reader:
                sensor = Sensor(
                    sensor_id=row["sensor_id"],
                    area=row["area"],
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    water_level=float(row["water_level"]),
                    status=row["status"]
                )

                db.add(sensor)
                count += 1

        db.commit()

        print(f"Successfully loaded {count} sensor records.")

    except Exception as e:
        db.rollback()
        print("Error loading sensors:", e)

    finally:
        db.close()


if __name__ == "__main__":
    load_sensors()