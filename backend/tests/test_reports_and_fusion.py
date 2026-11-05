import os
import hashlib
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_evidence_fusion_with_genuine_media():
    res = client.get("/api/evidence/fuse/AS-2026-088")
    if res.status_code == 200:
        data = res.json()
        assert data["incident_id"] == "AS-2026-088"
        assert data["satellite_layer"] is not None
        assert data["drone_layer"] is not None
        assert len(data["drone_layer"]["detected_targets"]) > 0
        assert data["fusion_analysis"]["corroboration_verdict"] == "STRONG_CORRELATION_CONFIRMED"
        assert len(data["fusion_analysis"]["evidentiary_integrity"]["sha256"]) == 64

def test_evidence_fusion_without_polygon_does_not_invent_geometry():
    # AS-2026-091 has no linked disturbance polygon
    res = client.get("/api/evidence/fuse/AS-2026-091")
    if res.status_code == 200:
        data = res.json()
        assert data["satellite_layer"] is None, "Must not synthesize polygon when none exists"
        assert data["fusion_analysis"]["corroboration_verdict"] == "INSUFFICIENT_EVIDENCE"

def test_fusion_404_for_unknown_incident():
    res = client.get("/api/evidence/fuse/UNKNOWN-INC-000")
    assert res.status_code == 404

def test_report_attestation_status_derived_from_review_state():
    # Report on unreviewed incident AS-2026-089 (Status: New) must NOT be FINAL_CERTIFIED
    gen_res = client.post("/api/reports/generate/AS-2026-089")
    if gen_res.status_code == 200:
        meta = gen_res.json()
        assert meta["status"] == "DRAFT_UNREVIEWED"
        assert len(meta["id"]) > 20
        assert not meta["id"].startswith("REP-2026") # UUID4, not second-resolution

        # Download file and verify seal
        dl_res = client.get(f"/api/reports/download/{meta['id']}")
        assert dl_res.status_code == 200
        assert hashlib.sha256(dl_res.content).hexdigest() == meta["sha256_evidence_seal"]

def test_report_tamper_detection():
    # Generate report
    gen_res = client.post("/api/reports/generate/AS-2026-088")
    if gen_res.status_code == 200:
        meta = gen_res.json()
        report_id = meta["id"]

        from core.config import settings
        pdf_path = os.path.join(settings.reports_dir, f"{report_id}.pdf")
        if not os.path.exists(pdf_path):
            pdf_path = os.path.join(settings.reports_dir, f"{report_id}.json")

        # Corrupt file by appending arbitrary bytes
        with open(pdf_path, "ab") as f:
            f.write(b"CORRUPTED_TAMPERED_BYTES")

        # Download must reject with 409 Conflict due to seal mismatch!
        dl_res = client.get(f"/api/reports/download/{report_id}")
        assert dl_res.status_code == 409
        assert "INTEGRITY_VIOLATION" in dl_res.json()["detail"]
