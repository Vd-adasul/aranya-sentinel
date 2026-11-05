import os
import json
import uuid
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from db.database import query_all, query_one, get_db
from core.config import settings

STATUS_MAP = {
    "Verified": "VERIFIED_DOSSIER",
    "Escalated": "ESCALATED_ENFORCEMENT",
    "Under Review": "PRELIMINARY_REVIEW",
    "New": "DRAFT_UNREVIEWED",
    "Rejected": "REJECTED_DISMISSED",
    "Resolved": "RESOLVED_ARCHIVE"
}

class ReportService:
    def list_reports(self, include_demo: bool = True) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM reports"
        if not include_demo:
            sql += " WHERE is_demo = 0"
        sql += " ORDER BY generated_at DESC"
        rows = query_all(sql)
        return [
            {
                "id": r["id"],
                "incident_id": r["incident_id"],
                "title": r["title"],
                "jurisdiction": r["jurisdiction"],
                "generated_at": r["generated_at"],
                "generated_by": r["generated_by"],
                "status": r["status"],
                "summary": r["summary"],
                "area_hectares": r["area_hectares"],
                "machinery_detected": json.loads(r["machinery_detected_json"]),
                "sha256_evidence_seal": r["sha256_evidence_seal"],
                "download_url": r["download_url"],
                "is_demo": bool(r.get("is_demo", 0))
            }
            for r in rows
        ]

    def generate_report(self, incident_id: str, generated_by: str = "Aranya Autonomous Pipeline") -> Dict[str, Any]:
        incident = query_one("SELECT * FROM incidents WHERE id = ?", (incident_id,))
        if not incident:
            raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found.")

        # Determine machinery from genuine drone media record in database (never hardcoded)
        machinery = []
        if incident["drone_mission_ref"]:
            drone_row = query_one(
                "SELECT * FROM drone_media WHERE id = ? OR filename = ? OR id LIKE ? ORDER BY timestamp DESC LIMIT 1",
                (incident["drone_mission_ref"], incident["drone_mission_ref"], f"%{incident['drone_mission_ref']}%")
            )
            if drone_row and drone_row.get("detections_json"):
                try:
                    dets = json.loads(drone_row["detections_json"])
                    machinery = sorted(list({d["label"] for d in dets}))
                except Exception:
                    machinery = []

        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        
        # UUID4-based report ID prevents collisions and file overwrites
        report_id = f"REP-{uuid.uuid4().hex}"

        # Status derived strictly from incident review state (never falsely marks drafts as certified)
        report_status = STATUS_MAP.get(incident["status"], "DRAFT_UNREVIEWED")

        title = f"Investigation Dossier [{report_status}]: {incident['title']}"
        summary = (
            f"Spatiotemporal evidence aggregation for incident {incident_id} in {incident['jurisdiction']}. "
            f"Review Status: {incident['status']} ({report_status}). Affected Area: {incident['affected_area_ha']} ha. "
            f"Protected Area Violation: {'Yes (' + incident['protected_reserve_name'] + ')' if incident['protected_area_violation'] else 'No'}."
        )

        # Generate real PDF artifact using PyMuPDF
        pdf_filename = f"{report_id}.pdf"
        pdf_path = os.path.join(settings.reports_dir, pdf_filename)

        try:
            import pymupdf
            doc = pymupdf.open()
            page = doc.new_page()

            page.insert_text((50, 60), "ARANYA SENTINEL - FORENSIC INVESTIGATION REPORT", fontsize=15)
            page.insert_text((50, 85), f"Report Reference: {report_id}  |  Incident: {incident_id}", fontsize=10)
            page.insert_text((50, 105), f"Generated: {now_str} by {generated_by}", fontsize=9)
            page.insert_text((50, 120), f"Attestation Status: {report_status} (Derived from Analyst Review)", fontsize=10)

            page.insert_text((50, 155), "1. INCIDENT OVERVIEW", fontsize=12)
            page.insert_text((60, 175), f"Title: {incident['title']}", fontsize=10)
            page.insert_text((60, 190), f"Jurisdiction: {incident['jurisdiction']}", fontsize=10)
            page.insert_text((60, 205), f"Coordinates: {incident['latitude']:.4f}° N, {incident['longitude']:.4f}° E", fontsize=10)
            page.insert_text((60, 220), f"Disturbance Area: {incident['affected_area_ha']} hectares (Canopy loss: {incident['tree_loss_pct']}%)", fontsize=10)
            page.insert_text((60, 235), f"Severity: {incident['severity']}  |  Model Confidence: {incident['model_confidence']:.2f}", fontsize=10)

            page.insert_text((50, 270), "2. CORROBORATING EVIDENCE & DETECTIONS", fontsize=12)
            page.insert_text((60, 290), f"Detection Source: {incident['detection_source']}", fontsize=10)
            page.insert_text((60, 305), f"Drone Mission Reference: {incident['drone_mission_ref'] or 'None Linked'}", fontsize=10)
            page.insert_text((60, 320), f"Machinery Identified: {', '.join(machinery) if machinery else 'None detected / No drone telemetry'}", fontsize=10)

            page.insert_text((50, 355), "3. ANALYST REVIEW & CUSTODY", fontsize=12)
            page.insert_text((60, 375), f"Analyst Review Status: {incident['status']}", fontsize=10)
            page.insert_text((60, 390), f"Assigned Analyst: {incident['assigned_analyst'] or 'Unassigned'}", fontsize=10)
            page.insert_text((60, 405), f"Investigation Notes: {incident['investigation_notes'] or 'No analyst notes recorded.'}", fontsize=9)

            pdf_bytes = doc.tobytes()
            doc.close()
            with open(pdf_path, "wb") as f:
                f.write(pdf_bytes)

            file_hash = hashlib.sha256(pdf_bytes).hexdigest()
        except Exception:
            pdf_path = os.path.join(settings.reports_dir, f"{report_id}.json")
            report_data = {
                "id": report_id,
                "incident_id": incident_id,
                "title": title,
                "jurisdiction": incident["jurisdiction"],
                "generated_at": now_str,
                "generated_by": generated_by,
                "status": report_status,
                "summary": summary,
                "area_hectares": incident["affected_area_ha"],
                "machinery_detected": machinery
            }
            raw_bytes = json.dumps(report_data, indent=2).encode("utf-8")
            with open(pdf_path, "wb") as f:
                f.write(raw_bytes)
            file_hash = hashlib.sha256(raw_bytes).hexdigest()

        download_url = f"/api/reports/download/{report_id}"

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO reports (
                    id, incident_id, title, jurisdiction, generated_at, generated_by,
                    status, summary, area_hectares, machinery_detected_json,
                    sha256_evidence_seal, artifact_path, download_url, is_demo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    report_id, incident_id, title, incident["jurisdiction"], now_str,
                    generated_by, report_status, summary, incident["affected_area_ha"],
                    json.dumps(machinery), file_hash, pdf_path, download_url,
                    bool(incident.get("is_demo", 0))
                )
            )

        return {
            "id": report_id,
            "incident_id": incident_id,
            "title": title,
            "jurisdiction": incident["jurisdiction"],
            "generated_at": now_str,
            "generated_by": generated_by,
            "status": report_status,
            "summary": summary,
            "area_hectares": incident["affected_area_ha"],
            "machinery_detected": machinery,
            "sha256_evidence_seal": file_hash,
            "download_url": download_url,
            "is_demo": bool(incident.get("is_demo", 0))
        }

    def get_report_artifact(self, report_id: str) -> tuple:
        row = query_one("SELECT * FROM reports WHERE id = ?", (report_id,))
        if not row:
            raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")

        path = row["artifact_path"]
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="Report artifact file missing on disk.")

        # Cryptographic verification of on-disk file against stored evidence seal
        with open(path, "rb") as f:
            content = f.read()
        current_hash = hashlib.sha256(content).hexdigest()
        if current_hash != row["sha256_evidence_seal"]:
            raise HTTPException(
                status_code=409,
                detail=f"INTEGRITY_VIOLATION: Report artifact on disk failed cryptographic seal verification (stored: {row['sha256_evidence_seal'][:12]}..., calculated: {current_hash[:12]}...)"
            )

        media_type = "application/pdf" if path.endswith(".pdf") else "application/json"
        return path, media_type, os.path.basename(path)

report_service = ReportService()
