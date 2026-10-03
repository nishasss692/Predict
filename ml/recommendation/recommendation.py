def generate_recommendation(root_cause, priority):
    """
    Generate an action recommendation based on root cause and priority.
    """

    if "drainage" in root_cause.lower():
        if priority == "high":
            action = "Immediately inspect and clear the nearby drainage infrastructure."
        else:
            action = "Inspect the nearby drainage infrastructure."

    elif "traffic" in root_cause.lower():
        action = "Inspect the affected road and consider traffic management measures."

    elif "pothole" in root_cause.lower():
        action = "Inspect the road and schedule pothole repair."

    elif "sewage" in root_cause.lower():
        action = "Inspect the nearby sewage infrastructure for overflow or blockage."

    else:
        action = "Collect more information before taking action."

    return action