from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_clusters():
    response = client.get("/clusters/")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert any(cluster["cluster_id"] == "3_8" for cluster in data)


def test_get_cluster_evidence():
    response = client.get("/clusters/3_8/evidence")

    assert response.status_code == 200

    data = response.json()

    assert data["cluster_id"] == "3_8"
    assert "incidents" in data["evidence"]
    assert "weather" in data["evidence"]
    assert "sensors" in data["evidence"]
    assert "traffic" in data["evidence"]


def test_get_root_cause():
    response = client.get("/root-cause/3_8")

    assert response.status_code == 200

    data = response.json()

    assert data["cluster_id"] == "3_8"
    assert data["root_cause"] == "Possible drainage blockage or overflow"
    assert data["confidence"] == 1
    assert data["priority"] == "high"


def test_get_recommendation():
    response = client.get("/root-cause/3_8/recommendation")

    assert response.status_code == 200

    data = response.json()

    assert data["cluster_id"] == "3_8"
    assert (
        data["recommended_action"]
        == "Inspect and clear drainage infrastructure"
    )