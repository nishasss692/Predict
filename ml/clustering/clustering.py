import pandas as pd
from sklearn.cluster import DBSCAN


def run_clustering(incidents):
    """
    Cluster civic incidents using spatial and temporal correlation.

    Required input columns:
        incident_id
        latitude
        longitude
        timestamp
        type

    Returns:
        incident_results: DataFrame with clustering information
        cluster_results: list of cluster dictionaries
    """

    incidents = incidents.copy()

    # Make sure timestamps are datetime
    incidents["timestamp"] = pd.to_datetime(incidents["timestamp"])

    # --------------------------------------------------
    # 1. Spatial clustering using DBSCAN
    # --------------------------------------------------

    locations = incidents[["latitude", "longitude"]]

    dbscan = DBSCAN(
        eps=0.01,
        min_samples=3
    )

    incidents["cluster"] = dbscan.fit_predict(locations)

    # --------------------------------------------------
    # 2. Temporal correlation
    # --------------------------------------------------

    incidents["temporal_event"] = -1

    for cluster_id in incidents["cluster"].unique():

        # Ignore DBSCAN noise
        if cluster_id == -1:
            continue

        mask = incidents["cluster"] == cluster_id

        cluster_data = (
            incidents.loc[mask]
            .sort_values("timestamp")
            .copy()
        )

        cluster_data["time_diff"] = (
            cluster_data["timestamp"].diff()
        )

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

    # --------------------------------------------------
    # 3. Create internal civic cluster ID
    # --------------------------------------------------

    incidents["civic_cluster"] = (
        incidents["cluster"].astype(str)
        + "_"
        + incidents["temporal_event"].astype(str)
    )

    # --------------------------------------------------
    # 4. Create backend-ready cluster output
    # --------------------------------------------------

    cluster_results = []

    valid_incidents = incidents[
        incidents["cluster"] != -1
    ]

    for civic_cluster_id, group in valid_incidents.groupby(
        "civic_cluster"
    ):

        incident_ids = group["incident_id"].tolist()

        categories = (
            group["type"]
            .dropna()
            .unique()
            .tolist()
        )

        centroid_lat = group["latitude"].mean()
        centroid_lon = group["longitude"].mean()

        start_time = group["timestamp"].min()
        end_time = group["timestamp"].max()

        # Simple MVP cluster score.
        # More evidence will be added later.
        cluster_score = min(
            len(group) / 30,
            1.0
        )

        cluster_results.append({
            "cluster_id": f"CL{len(cluster_results) + 1:03d}",
            "incident_ids": incident_ids,
            "centroid_lat": float(centroid_lat),
            "centroid_lon": float(centroid_lon),
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "categories": categories,
            "cluster_score": round(cluster_score, 2)
        })

    return incidents, cluster_results