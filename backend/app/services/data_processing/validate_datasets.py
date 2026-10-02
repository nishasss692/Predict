import csv
from pathlib import Path

from app.services.data_processing.validation import (
    validate_incident,
    validate_weather,
    validate_sensor,
    validate_traffic,
    validate_infrastructure,
)


BASE_DIR = Path(r"D:\Predict\data\generated")


DATASETS = {
    "incidents": ("incidents.csv", validate_incident),
    "weather": ("weather.csv", validate_weather),
    "sensors": ("sensors.csv", validate_sensor),
    "traffic": ("traffic.csv", validate_traffic),
    "infrastructure": ("infrastructure.csv", validate_infrastructure),
}


def validate_dataset(name, filename, validator):
    path = BASE_DIR / filename

    if not path.exists():
        print(f"\n{name}: FILE NOT FOUND")
        print(f"Expected: {path}")
        return

    total = 0
    invalid = 0

    with open(path, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        for row in reader:
            total += 1
            errors = validator(row)

            if errors:
                invalid += 1
                print(f"\n{name} - Row {total}:")
                for error in errors:
                    print(f"  - {error}")

    valid = total - invalid

    print(f"\n{name}")
    print(f"Total records : {total}")
    print(f"Valid records : {valid}")
    print(f"Invalid records: {invalid}")


if __name__ == "__main__":
    print("=== Bengaluru Civic Brain Dataset Validation ===")

    for name, (filename, validator) in DATASETS.items():
        validate_dataset(name, filename, validator)