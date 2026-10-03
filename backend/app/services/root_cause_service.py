def analyze_root_cause(
    cluster_id: str,
    evidence: dict
):
    """
    Rule-based root-cause analysis for the MVP.

    Confidence is calculated from multiple independent
    evidence signals rather than being hard-coded.
    """

    incidents = evidence["incidents"]
    weather = evidence["weather"]
    sensors = evidence["sensors"]
    traffic = evidence["traffic"]

    incident_ids = [
        incident["incident_id"]
        for incident in incidents
    ]

    # -----------------------------------
    # 1. Analyze incident evidence
    # -----------------------------------

    waterlogging_count = sum(
        1
        for incident in incidents
        if incident["type"] == "waterlogging"
    )

    sewage_count = sum(
        1
        for incident in incidents
        if incident["type"] == "sewage"
    )

    traffic_count = sum(
        1
        for incident in incidents
        if incident["type"] == "traffic_disruption"
    )

    # -----------------------------------
    # 2. Analyze environmental evidence
    # -----------------------------------

    heavy_rainfall = any(
        record["rainfall_mm"] >= 50
        for record in weather
    )

    critical_water_level = any(
        record["water_level"] >= 90
        or record["status"] == "critical"
        for record in sensors
    )

    severe_traffic = any(
        record["congestion_level"] == "severe"
        for record in traffic
    )

    # -----------------------------------
    # 3. Calculate evidence score
    # -----------------------------------

    score = 0
    max_score = 6

    if waterlogging_count > 0:
        score += 1

    if sewage_count > 0:
        score += 1

    if heavy_rainfall:
        score += 1

    if critical_water_level:
        score += 2

    if severe_traffic:
        score += 1

    # Convert score to confidence
    confidence = min(round(score / max_score, 2), 0.95)

    # -----------------------------------
    # 4. Build evidence explanation
    # -----------------------------------

    supporting_evidence = []

    if waterlogging_count > 0:
        supporting_evidence.append(
            f"{waterlogging_count} waterlogging incidents detected"
        )

    if sewage_count > 0:
        supporting_evidence.append(
            f"{sewage_count} sewage incidents detected"
        )

    if traffic_count > 0:
        supporting_evidence.append(
            f"{traffic_count} traffic disruption incidents detected"
        )

    if heavy_rainfall:
        supporting_evidence.append(
            "Heavy rainfall detected"
        )

    if critical_water_level:
        supporting_evidence.append(
            "Critical drain water level detected"
        )

    if severe_traffic:
        supporting_evidence.append(
            "Severe traffic disruption detected"
        )

    # -----------------------------------
    # 5. Determine root cause
    # -----------------------------------

    if (
        waterlogging_count > 0
        and heavy_rainfall
        and critical_water_level
    ):
        root_cause = "Possible drainage blockage or overflow"

    elif waterlogging_count > 0 and heavy_rainfall:
        root_cause = "Possible rainfall-related drainage issue"

    elif sewage_count > 0:
        root_cause = "Possible sewage system issue"

    else:
        root_cause = "Insufficient evidence to determine root cause"

    # -----------------------------------
    # 6. Determine priority
    # -----------------------------------

    if confidence >= 0.80:
        priority = "high"

    elif confidence >= 0.50:
        priority = "medium"

    else:
        priority = "low"

    # -----------------------------------
    # 7. Recommended action
    # -----------------------------------

    if root_cause == "Possible drainage blockage or overflow":
        recommended_action = (
            "Inspect and clear drainage infrastructure"
        )

    elif root_cause == "Possible rainfall-related drainage issue":
        recommended_action = (
            "Inspect drainage infrastructure in the affected area"
        )

    elif root_cause == "Possible sewage system issue":
        recommended_action = (
            "Inspect sewage infrastructure in the affected area"
        )

    else:
        recommended_action = (
            "Collect additional civic and environmental data"
        )

    return {
        "cluster_id": cluster_id,
        "root_cause": root_cause,
        "confidence": confidence,
        "evidence": supporting_evidence,
        "priority": priority,
        "affected_incidents": incident_ids,
        "recommended_action": recommended_action
    }