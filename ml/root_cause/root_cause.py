def detect_root_cause(cluster_incidents, weather, sensor, traffic, cluster_id):

    score = 0
    evidence = []

    # Check rainfall
    if weather["rainfall_mm"] >= 50:
        score += 20
        evidence.append("Heavy rainfall")

    # Check drain water level
    if sensor["water_level"] >= 80:
        score += 30
        evidence.append("High drain water level")

    # Check incident types
    incident_types = cluster_incidents["type"].tolist()

    if "waterlogging" in incident_types:
        score += 20
        evidence.append("Multiple waterlogging reports")

    if "sewage" in incident_types:
        score += 15
        evidence.append("Sewage overflow reports")

    # Check traffic
    if traffic["congestion_level"] == "severe":
        score += 10
        evidence.append("Severe traffic congestion")

   # Root cause
    if score >= 60:
       root_cause = "Possible drainage blockage/overflow"
    else:
     root_cause = "Insufficient evidence"

# Convert evidence score into a 0–1 confidence value
    confidence = score / 100

# Determine priority
    if confidence >= 0.8:
        priority = "high"
    elif confidence >= 0.5:
        priority = "medium"
    else:
        priority = "low"

        # Recommended action
    if root_cause == "Possible drainage blockage/overflow":
     recommended_action = (
          "Inspect and clear the nearby drainage infrastructure"
        )
    else:
     recommended_action = "Collect more information before taking action"

    return {
    "cluster_id": cluster_id,
    "root_cause": root_cause,
    "confidence": round(confidence, 2),
    "evidence": evidence,
    "priority": priority,
    "affected_incidents": cluster_incidents["incident_id"].tolist(),
    "recommended_action": recommended_action
}