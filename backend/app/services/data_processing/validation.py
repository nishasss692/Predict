def validate_incident(record: dict) -> list[str]:
    errors = []

    required_fields = [
        "incident_id",
        "area",
        "type",
        "description",
        "latitude",
        "longitude",
        "timestamp",
        "severity",
    ]

    for field in required_fields:
        if field not in record or record[field] in ("", None):
            errors.append(f"Missing field: {field}")

    if "latitude" in record:
        try:
            latitude = float(record["latitude"])
            if not -90 <= latitude <= 90:
                errors.append("Invalid latitude")
        except (ValueError, TypeError):
            errors.append("Invalid latitude")

    if "longitude" in record:
        try:
            longitude = float(record["longitude"])
            if not -180 <= longitude <= 180:
                errors.append("Invalid longitude")
        except (ValueError, TypeError):
            errors.append("Invalid longitude")

    return errors


def validate_weather(record: dict) -> list[str]:
    errors = []

    required_fields = [
        "timestamp",
        "rainfall_mm",
        "temperature_c",
    ]

    for field in required_fields:
        if field not in record or record[field] in ("", None):
            errors.append(f"Missing field: {field}")

    return errors


def validate_sensor(record: dict) -> list[str]:
    errors = []

    required_fields = [
        "sensor_id",
        "area",
        "latitude",
        "longitude",
        "timestamp",
        "water_level",
        "status",
    ]

    for field in required_fields:
        if field not in record or record[field] in ("", None):
            errors.append(f"Missing field: {field}")

    if "latitude" in record:
        try:
            latitude = float(record["latitude"])
            if not -90 <= latitude <= 90:
                errors.append("Invalid latitude")
        except (ValueError, TypeError):
            errors.append("Invalid latitude")

    if "longitude" in record:
        try:
            longitude = float(record["longitude"])
            if not -180 <= longitude <= 180:
                errors.append("Invalid longitude")
        except (ValueError, TypeError):
            errors.append("Invalid longitude")

    return errors


def validate_traffic(record: dict) -> list[str]:
    errors = []

    required_fields = [
        "area",
        "latitude",
        "longitude",
        "timestamp",
        "average_speed_kmh",
        "congestion_level",
    ]

    for field in required_fields:
        if field not in record or record[field] in ("", None):
            errors.append(f"Missing field: {field}")

    if "latitude" in record:
        try:
            latitude = float(record["latitude"])
            if not -90 <= latitude <= 90:
                errors.append("Invalid latitude")
        except (ValueError, TypeError):
            errors.append("Invalid latitude")

    if "longitude" in record:
        try:
            longitude = float(record["longitude"])
            if not -180 <= longitude <= 180:
                errors.append("Invalid longitude")
        except (ValueError, TypeError):
            errors.append("Invalid longitude")

    return errors


def validate_infrastructure(record: dict) -> list[str]:
    errors = []

    required_fields = [
        "infrastructure_id",
        "type",
        "area",
        "latitude",
        "longitude",
        "status",
    ]

    for field in required_fields:
        if field not in record or record[field] in ("", None):
            errors.append(f"Missing field: {field}")

    if "latitude" in record:
        try:
            latitude = float(record["latitude"])
            if not -90 <= latitude <= 90:
                errors.append("Invalid latitude")
        except (ValueError, TypeError):
            errors.append("Invalid latitude")

    if "longitude" in record:
        try:
            longitude = float(record["longitude"])
            if not -180 <= longitude <= 180:
                errors.append("Invalid longitude")
        except (ValueError, TypeError):
            errors.append("Invalid longitude")

    return errors