import pandas as pd

from app.services.data_processing.normalization import (
    normalize_incidents,
    normalize_weather,
    normalize_sensors,
    normalize_traffic,
    normalize_infrastructure,
)


BASE_DIR = r"D:\Predict\data\generated"


def test_dataset(name, filename, normalizer):
    path = f"{BASE_DIR}\\{filename}"

    df = pd.read_csv(path)
    normalized = normalizer(df)

    print(f"\n{name}")
    print(f"Records: {len(normalized)}")
    print(normalized.dtypes)


if __name__ == "__main__":
    test_dataset(
        "Incidents",
        "incidents.csv",
        normalize_incidents,
    )

    test_dataset(
        "Weather",
        "weather.csv",
        normalize_weather,
    )

    test_dataset(
        "Sensors",
        "sensors.csv",
        normalize_sensors,
    )

    test_dataset(
        "Traffic",
        "traffic.csv",
        normalize_traffic,
    )

    test_dataset(
        "Infrastructure",
        "infrastructure.csv",
        normalize_infrastructure,
    )