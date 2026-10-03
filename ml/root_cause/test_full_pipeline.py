import pandas as pd

from ml.clustering.clustering import run_clustering
from ml.classification.classifier import classify_incident
from ml.root_cause.root_cause import detect_root_cause
from ml.recommendation.recommendation import generate_recommendation


# Load all project data
incidents = pd.read_csv("data/generated/incidents.csv")
incidents["predicted_type"] = incidents["description"].apply(
    classify_incident
)
weather = pd.read_csv("data/generated/weather.csv")
sensors = pd.read_csv("data/generated/sensors.csv")
traffic = pd.read_csv("data/generated/traffic.csv")


# -----------------------------------------
# 1. Run clustering
# -----------------------------------------

incident_results, cluster_results = run_clustering(incidents)


# Find the cluster containing INC071
target_cluster = next(
    cluster for cluster in cluster_results
    if "INC071" in cluster["incident_ids"]
)


print("\nCLUSTER FOUND")
print("-------------")
print(target_cluster)


# -----------------------------------------
# 2. Get incidents belonging to that cluster
# -----------------------------------------

cluster_incidents = incidents[
    incidents["incident_id"].isin(
        target_cluster["incident_ids"]
    )
]


# -----------------------------------------
# 3. Get weather during the cluster
# -----------------------------------------

weather_data = weather[
    weather["timestamp"].str.startswith("2026-09-20 18")
].iloc[0].to_dict()


# -----------------------------------------
# 4. Get drain sensor during the cluster
# -----------------------------------------

sensor_data = sensors[
    (sensors["area"] == "Koramangala") &
    (sensors["timestamp"].str.startswith("2026-09-20 18"))
].iloc[0].to_dict()


# -----------------------------------------
# 5. Get traffic during the cluster
# -----------------------------------------

traffic_data = traffic[
    (traffic["area"] == "Koramangala") &
    (traffic["timestamp"].str.startswith("2026-09-20 18"))
].iloc[0].to_dict()


# -----------------------------------------
# 6. Run root-cause detection
# -----------------------------------------

root_cause_result = detect_root_cause(
    cluster_incidents,
    weather_data,
    sensor_data,
    traffic_data,
    target_cluster["cluster_id"]
)


# -----------------------------------------
# 7. Generate recommendation
# -----------------------------------------

recommendation = generate_recommendation(
    root_cause_result["root_cause"],
    root_cause_result["priority"]
)


# -----------------------------------------
# 8. Final AI output
# -----------------------------------------

print("\nROOT CAUSE RESULT")
print("-----------------")
print(root_cause_result)

print("\nRECOMMENDATION")
print("--------------")
print(recommendation)