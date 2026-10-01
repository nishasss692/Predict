import pandas as pd
import random
from datetime import datetime, timedelta

random.seed(42)

print("Civic Brain data generator started!")

# --------------------------------------------------
# 1. LOCATIONS
# --------------------------------------------------

locations = {
    "Koramangala": (12.9352, 77.6245),
    "HSR Layout": (12.9116, 77.6741),
    "BTM Layout": (12.9166, 77.6101),
    "Indiranagar": (12.9784, 77.6408),
    "Whitefield": (12.9698, 77.7500),
    "Marathahalli": (12.9591, 77.6974),
    "Bellandur": (12.9304, 77.6784),
    "Jayanagar": (12.9250, 77.5938),
    "JP Nagar": (12.9063, 77.5857),
    "Rajajinagar": (12.9910, 77.5530)
}

print("Locations loaded:", len(locations))


# --------------------------------------------------
# 2. INCIDENT TYPES
# --------------------------------------------------

incident_types = [
    "waterlogging",
    "pothole",
    "sewage",
    "garbage",
    "traffic_disruption"
]

severities = [
    "low",
    "medium",
    "high"
]


# --------------------------------------------------
# 3. INCIDENT DATA
# --------------------------------------------------

incidents = []

start_time = datetime(2026, 9, 20, 6, 0)

# First create 70 normal/random incidents
for i in range(70):

    area = random.choice(list(locations.keys()))
    latitude, longitude = locations[area]

    incident_type = random.choice(incident_types)
    severity = random.choice(severities)

    timestamp = start_time + timedelta(
        minutes=random.randint(0, 12 * 60)
    )

    incident = {
        "incident_id": f"INC{i+1:03d}",
        "area": area,
        "type": incident_type,
        "description": (
            f"{incident_type.replace('_', ' ').title()} "
            f"reported in {area}"
        ),
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": timestamp,
        "severity": severity
    }

    incidents.append(incident)


# Create 30 connected incidents in Koramangala
# during the heavy-rain period

scenario_incidents = [
    ("waterlogging", "high"),
    ("waterlogging", "high"),
    ("waterlogging", "medium"),
    ("waterlogging", "high"),
    ("waterlogging", "medium"),
    ("sewage", "high"),
    ("sewage", "medium"),
    ("sewage", "high"),
    ("traffic_disruption", "high"),
    ("traffic_disruption", "high"),
    ("traffic_disruption", "medium"),
    ("pothole", "medium"),
    ("waterlogging", "high"),
    ("waterlogging", "high"),
    ("sewage", "high"),
    ("traffic_disruption", "high"),
    ("waterlogging", "medium"),
    ("waterlogging", "high"),
    ("sewage", "medium"),
    ("traffic_disruption", "high"),
    ("waterlogging", "high"),
    ("waterlogging", "medium"),
    ("sewage", "high"),
    ("traffic_disruption", "high"),
    ("waterlogging", "high"),
    ("waterlogging", "medium"),
    ("sewage", "medium"),
    ("traffic_disruption", "high"),
    ("waterlogging", "high"),
    ("waterlogging", "medium")
]

kor_lat, kor_lon = locations["Koramangala"]

for index, (incident_type, severity) in enumerate(scenario_incidents):

    # Incidents occur between 6 PM and 8 PM
    timestamp = datetime(2026, 9, 20, 18, 0) + timedelta(
        minutes=index * 4
    )

    incident = {
        "incident_id": f"INC{71 + index:03d}",
        "area": "Koramangala",
        "type": incident_type,
        "description": (
            f"{incident_type.replace('_', ' ').title()} "
            f"reported in Koramangala"
        ),
        "latitude": kor_lat,
        "longitude": kor_lon,
        "timestamp": timestamp,
        "severity": severity
    }

    incidents.append(incident)


df = pd.DataFrame(incidents)

incident_output = "data/generated/incidents.csv"
df.to_csv(incident_output, index=False)

print(f"Generated {len(df)} incidents.")
print(f"Saved to: {incident_output}")


# --------------------------------------------------
# 4. WEATHER DATA
# --------------------------------------------------

weather_data = []

weather_start = datetime(2026, 9, 20, 6, 0)

for i in range(24):

    timestamp = weather_start + timedelta(hours=i)

    if 18 <= timestamp.hour <= 20:
        rainfall = random.uniform(60, 100)
    else:
        rainfall = random.uniform(0, 10)

    temperature = random.uniform(22, 30)

    weather = {
        "timestamp": timestamp,
        "rainfall_mm": round(rainfall, 2),
        "temperature_c": round(temperature, 2)
    }

    weather_data.append(weather)

weather_df = pd.DataFrame(weather_data)

weather_output = "data/generated/weather.csv"
weather_df.to_csv(weather_output, index=False)

print(f"Generated {len(weather_df)} weather records.")
print(f"Saved to: {weather_output}")


# --------------------------------------------------
# 5. DRAIN SENSOR DATA
# --------------------------------------------------

sensor_data = []

sensor_locations = {
    "Koramangala": (12.9352, 77.6245),
    "HSR Layout": (12.9116, 77.6741),
    "Bellandur": (12.9304, 77.6784),
    "Marathahalli": (12.9591, 77.6974),
    "Indiranagar": (12.9784, 77.6408)
}

sensor_start = datetime(2026, 9, 20, 6, 0)

for i in range(24):

    timestamp = sensor_start + timedelta(hours=i)

    for area, (latitude, longitude) in sensor_locations.items():

        # Only Koramangala has the abnormal drain condition
        if area == "Koramangala" and 18 <= timestamp.hour <= 20:
            water_level = random.uniform(75, 100)

        else:
            water_level = random.uniform(20, 50)

        if water_level >= 90:
            status = "critical"

        elif water_level >= 70:
            status = "high"

        else:
            status = "normal"

        sensor = {
            "sensor_id": f"S-{area.replace(' ', '-').upper()}",
            "area": area,
            "latitude": latitude,
            "longitude": longitude,
            "timestamp": timestamp,
            "water_level": round(water_level, 2),
            "status": status
        }

        sensor_data.append(sensor)

sensor_df = pd.DataFrame(sensor_data)

sensor_output = "data/generated/sensors.csv"
sensor_df.to_csv(sensor_output, index=False)

print(f"Generated {len(sensor_df)} sensor records.")
print(f"Saved to: {sensor_output}")


# --------------------------------------------------
# 6. TRAFFIC DATA
# --------------------------------------------------

traffic_data = []

traffic_start = datetime(2026, 9, 20, 6, 0)

for i in range(24):

    timestamp = traffic_start + timedelta(hours=i)

    for area, (latitude, longitude) in sensor_locations.items():

        # Only Koramangala experiences severe traffic
        # during the heavy-rain period

        if area == "Koramangala" and 18 <= timestamp.hour <= 20:
            average_speed = random.uniform(5, 15)

        else:
            average_speed = random.uniform(25, 45)

        if average_speed < 15:
            congestion = "severe"

        elif average_speed < 25:
            congestion = "moderate"

        else:
            congestion = "low"

        traffic = {
            "area": area,
            "latitude": latitude,
            "longitude": longitude,
            "timestamp": timestamp,
            "average_speed_kmh": round(average_speed, 2),
            "congestion_level": congestion
        }

        traffic_data.append(traffic)

traffic_df = pd.DataFrame(traffic_data)

traffic_output = "data/generated/traffic.csv"
traffic_df.to_csv(traffic_output, index=False)

print(f"Generated {len(traffic_df)} traffic records.")
print(f"Saved to: {traffic_output}")


print("\nAll Civic Brain datasets generated successfully!")