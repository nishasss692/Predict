import csv
from datetime import datetime

from app.database import SessionLocal
from app.models.weather import Weather


CSV_PATH = "../data/generated/weather.csv"


def load_weather():
    db = SessionLocal()

    try:
        with open(CSV_PATH, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)

            count = 0

            for row in reader:
                weather = Weather(
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    rainfall_mm=float(row["rainfall_mm"]),
                    temperature_c=float(row["temperature_c"])
                )

                db.add(weather)
                count += 1

        db.commit()

        print(f"Successfully loaded {count} weather records.")

    except Exception as e:
        db.rollback()
        print("Error loading weather:", e)

    finally:
        db.close()


if __name__ == "__main__":
    load_weather()