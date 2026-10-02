import pandas as pd
from sklearn.cluster import DBSCAN


def run_clustering(incidents):
    """
    Cluster civic incidents using location and time.

    Input:
        incidents - Pandas DataFrame containing:
            incident_id
            latitude
            longitude
            timestamp

    Output:
        Pandas DataFrame containing:
            incident_id
            cluster
            temporal_event
            civic_cluster
    """

    incidents = incidents.copy()

    # Make sure timestamp is in datetime format
    incidents["timestamp"] = pd.to_datetime(incidents["timestamp"])

    # -------------------------
    # 1. Spatial clustering
    # -------------------------

    locations = incidents[["latitude", "longitude"]]

    dbscan = DBSCAN(
        eps=0.01,
        min_samples=3
    )

    incidents["cluster"] = dbscan.fit_predict(locations)

    # -------------------------
    # 2. Temporal correlation
    # -------------------------

    incidents["temporal_event"] = 0

    for cluster_id in incidents["cluster"].unique():

        if cluster_id == -1:
            continue

        mask = incidents["cluster"] == cluster_id

        cluster_data = incidents.loc[mask].sort_values("timestamp").copy()

        cluster_data["time_diff"] = cluster_data["timestamp"].diff()

        cluster_data["temporally_close"] = (
            cluster_data["time_diff"]
            <= pd.Timedelta(minutes=30)
        )

        cluster_data["temporal_event"] = (
            ~cluster_data["temporally_close"]
        ).cumsum()

        incidents.loc[
            cluster_data.index,
            "temporal_event"
        ] = cluster_data["temporal_event"]

    # -------------------------
    # 3. Create civic cluster ID
    # -------------------------

    incidents["civic_cluster"] = (
        incidents["cluster"].astype(str)
        + "_"
        + incidents["temporal_event"].astype(str)
    )

    return incidents