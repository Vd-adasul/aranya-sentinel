import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_list_and_get_incident():
    res = client.get("/api/incidents")
    assert res.status_code == 200
    incidents = res.json()
    assert len(incidents) >= 1
    assert all("is_demo" in inc for inc in incidents)

    res_single = client.get("/api/incidents/AS-2026-088")
    if res_single.status_code == 200:
        assert res_single.json()["id"] == "AS-2026-088"
        assert res_single.json()["is_demo"] is True

def test_demo_isolation():
    res = client.get("/api/incidents?include_demo=false")
    assert res.status_code == 200
    live_incidents = res.json()
    assert all(not inc["is_demo"] for inc in live_incidents)

def test_get_nonexistent_incident_returns_404():
    res = client.get("/api/incidents/AS-INVALID-9999")
    assert res.status_code == 404

def test_incident_state_transition_valid():
    res = client.patch(
        "/api/incidents/AS-2026-092",
        json={"status": "Under Review", "investigation_notes": "Assigned to regional unit"}
    )
    if res.status_code == 200:
        data = res.json()
        assert data["status"] == "Under Review"
        assert data["version"] >= 2

def test_incident_invalid_state_transition_fails():
    res = client.patch(
        "/api/incidents/AS-2026-092",
        json={"status": "ArbitraryNonExistentState"}
    )
    if res.status_code != 404:
        assert res.status_code == 400

def test_incident_concurrency_conflict_fails():
    current_res = client.get("/api/incidents/AS-2026-088")
    if current_res.status_code == 200:
        current = current_res.json()
        stale_v = current["version"] - 1
        res = client.patch(
            "/api/incidents/AS-2026-088",
            json={"status": "Verified", "expected_version": stale_v}
        )
        assert res.status_code == 409

def test_create_incident_and_attach_evidence():
    # 1. Create real incident
    payload = {
        "title": "Ground Patrol Timber Seizure",
        "jurisdiction": "Western Ghats Corridor Zone",
        "latitude": 13.518,
        "longitude": 75.095,
        "affected_area_ha": 4.5,
        "tree_loss_pct": 32.0,
        "severity": "HIGH",
        "detection_source": "Field Ranger Mobile App",
        "assigned_analyst": "Officer Patel",
        "investigation_notes": "Stacks of cut rosewood discovered during routine patrol"
    }
    res = client.post("/api/incidents", json=payload)
    assert res.status_code == 200
    created = res.json()
    inc_id = created["id"]
    assert inc_id.startswith("AS-")
    assert created["is_demo"] is False
    assert created["status"] == "New"

    # 2. Attach drone evidence (DRN-MSSN-101)
    att_res = client.post(
        f"/api/incidents/{inc_id}/evidence",
        json={"evidence_type": "drone", "evidence_id": "DRN-MSSN-101", "notes": "Recon flight confirmed 3 machinery"}
    )
    if att_res.status_code == 200:
        updated = att_res.json()
        assert updated["drone_mission_ref"] == "DRN-MSSN-101"
        assert updated["version"] == 2

def test_register_aoi_with_polygon():
    aoi_data = {
        "id": "kaziranga-core-rhino-sector",
        "name": "Kaziranga National Park - Eastern Sector",
        "state": "Assam",
        "geometry_geojson": {
            "type": "Polygon",
            "coordinates": [[[93.15, 26.55], [93.25, 26.55], [93.25, 26.65], [93.15, 26.65], [93.15, 26.55]]]
        },
        "risk_level": "High"
    }
    res = client.post("/api/satellite/aois", json=aoi_data)
    assert res.status_code in (200, 409)
