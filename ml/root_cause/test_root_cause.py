import pandas as pd

from ml.root_cause.root_cause import detect_root_cause


# Load the actual project data
incidents = pd.read_csv("data/generated/incidents.csv")
weather = pd.read_csv("data/generated/weather.csv")
sensors = pd.read_csv("data/generated/sensors.csv")
traffic = pd.read_csv("data/generated/traffic.csv")


# Get the Koramangala incidents
cluster_incidents = incidents[
    incidents["incident_id"].isin(
        [f"INC{i:03d}" for i in range(71, 101)]
    )
]


# Use the weather during the Koramangala event
weather_data = weather[
    weather["timestamp"].str.startswith("2026-09-20 18")
].iloc[0].to_dict()


# Use the Koramangala drain sensor during the event
sensor_data = sensors[
    (sensors["area"] == "Koramangala") &
    (sensors["timestamp"].str.startswith("2026-09-20 18"))
].iloc[0].to_dict()


# Use the Koramangala traffic data during the event
traffic_data = traffic[
    (traffic["area"] == "Koramangala") &
    (traffic["timestamp"].str.startswith("2026-09-20 18"))
].iloc[0].to_dict()


# Run root-cause detection
result = detect_root_cause(
    cluster_incidents,
    weather_data,
    sensor_data,
    traffic_data,
    "CL029"
)


print("\nROOT CAUSE RESULT")
print("-----------------")
print(result)