def classify_incident(description):

    text = description.lower()

    if "water" in text or "flood" in text:
        return "waterlogging"

    if "sewage" in text or "sewer" in text:
        return "sewage"

    if "traffic" in text or "congestion" in text:
        return "traffic_disruption"

    if "pothole" in text or "road damage" in text:
        return "pothole"

    if "garbage" in text or "waste" in text:
        return "garbage"

    return "unknown"