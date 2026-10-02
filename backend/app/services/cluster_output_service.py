import pandas as pd


def build_cluster_output(clustering_results):
    if not clustering_results:
        return []

    df = pd.DataFrame(clustering_results)

    # Ignore DBSCAN noise points
    df = df[df["cluster"] != -1].copy()

    if df.empty:
        return []

    clusters = []

    for cluster_id, group in df.groupby("civic_cluster"):

        cluster = {
            "cluster_id": str(cluster_id),

            "incident_ids": (
                group["incident_id"]
                .astype(str)
                .tolist()
            ),

            "centroid_lat": float(
                group["latitude"].mean()
            ),

            "centroid_lon": float(
                group["longitude"].mean()
            ),

            "start_time": group["timestamp"].min(),

            "end_time": group["timestamp"].max(),

            "categories": (
                group["type"]
                .dropna()
                .unique()
                .tolist()
            ),

            "cluster_score": float(len(group))
        }

        clusters.append(cluster)

    return clusters