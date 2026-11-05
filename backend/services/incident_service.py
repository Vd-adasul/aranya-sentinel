import json
import uuid
import hashlib
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from db.database import query_all, query_one, get_db

ALLOWED_TRANSITIONS = {
    "New": ["Under Review", "Rejected"],
    "Under Review": ["Verified", "Rejected", "Escalated", "New"],
    "Verified": ["Escalated", "Resolved", "Under Review"],
    "Escalated": ["Resolved", "Verified", "Under Review"],
    "Rejected": ["Under Review", "New"],
    "Resolved": ["Under Review"]
}

class IncidentService:
    def list_incidents(
        self,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        jurisdiction: Optional[str] = None,
        include_demo: bool = True
    ) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM incidents WHERE 1=1"
        params = []
        if not include_demo:
            sql += " AND is_demo = 0"
        if status and status.lower() != "all":
            sql += " AND LOWER(status) = LOWER(?)"
            params.append(status)
        if severity and severity.lower() != "all":
            sql += " AND LOWER(severity) = LOWER(?)"
            params.append(severity)
        if jurisdiction and jurisdiction.lower() != "all":
            sql += " AND LOWER(jurisdiction) LIKE LOWER(?)"
            params.append(f"%{jurisdiction}%")

        sql += " ORDER BY detected_at DESC"
        rows = query_all(sql, tuple(params))
        return [self._format_incident(r) for r in rows]

    def get_incident(self, incident_id: str) -> Dict[str, Any]:
        row = query_one("SELECT * FROM incidents WHERE id = ?", (incident_id,))
        if not row:
            raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found.")
        return self._format_incident(row)

    def create_incident(
        self,
        title: str,
        jurisdiction: str,
        latitude: float,
        longitude: float,
        affected_area_ha: float,
        tree_loss_pct: float,
        severity: str = "HIGH",
        status: str = "New",
        detection_source: str = "Sentinel-2 + Dynamic World",
        protected_area_violation: bool = False,
        protected_reserve_name: Optional[str] = None,
        model_confidence: float = 0.85,
        evidence_score: float = 75.0,
        assigned_analyst: Optional[str] = None,
        investigation_notes: Optional[str] = None,
        drone_mission_ref: Optional[str] = None,
        disturbances_polygon_id: Optional[str] = None,
        authorization_status: Optional[str] = "Unknown",
        is_demo: bool = False
    ) -> Dict[str, Any]:
        year = datetime.utcnow().year
        incident_id = f"AS-{year}-{uuid.uuid4().hex[:6].upper()}"
        now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

        evidence_payload = {
            "id": incident_id,
            "title": title,
            "coordinates": [latitude, longitude],
            "area_ha": affected_area_ha,
            "loss_pct": tree_loss_pct,
            "source": detection_source,
            "created_at": now_str
        }
        evidence_hash = hashlib.sha256(json.dumps(evidence_payload, sort_keys=True).encode("utf-8")).hexdigest()

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO incidents (
                    id, title, jurisdiction, latitude, longitude, detected_at,
                    severity, status, affected_area_ha, tree_loss_pct, detection_source,
                    protected_area_violation, protected_reserve_name, model_confidence, evidence_score,
                    evidence_hash_sha256, assigned_analyst, investigation_notes,
                    drone_mission_ref, disturbances_polygon_id, authorization_status, version, updated_at, is_demo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    incident_id, title, jurisdiction, latitude, longitude, now_str,
                    severity, status, affected_area_ha, tree_loss_pct, detection_source,
                    1 if protected_area_violation else 0, protected_reserve_name,
                    model_confidence, evidence_score, evidence_hash,
                    assigned_analyst, investigation_notes, drone_mission_ref,
                    disturbances_polygon_id, authorization_status, 1, now_str,
                    1 if is_demo else 0
                )
            )

            audit_id = f"AUD-{uuid.uuid4().hex[:8]}"
            cursor.execute(
                """
                INSERT INTO audit_events (id, entity_type, entity_id, actor, action, version, timestamp, reason, diff_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    audit_id, "incident", incident_id,
                    assigned_analyst or "System Operations", "CREATE", 1, now_str,
                    "Incident logged from surveillance ingestion", json.dumps(evidence_payload)
                )
            )

        return self.get_incident(incident_id)

    def attach_evidence(
        self,
        incident_id: str,
        evidence_type: str,
        evidence_id: str,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        incident = query_one("SELECT * FROM incidents WHERE id = ?", (incident_id,))
        if not incident:
            raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found.")

        now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        new_version = incident["version"] + 1

        drone_ref = incident["drone_mission_ref"]
        dist_ref = incident["disturbances_polygon_id"]
        ev_type_lower = evidence_type.lower()

        if ev_type_lower in ("drone", "drone_media"):
            drone_row = query_one("SELECT id FROM drone_media WHERE id = ?", (evidence_id,))
            if not drone_row:
                raise HTTPException(status_code=404, detail=f"Drone media '{evidence_id}' does not exist.")
            drone_ref = evidence_id
        elif ev_type_lower in ("disturbance", "satellite"):
            dist_row = query_one("SELECT id FROM disturbances WHERE id = ?", (evidence_id,))
            if not dist_row:
                raise HTTPException(status_code=404, detail=f"Disturbance '{evidence_id}' does not exist.")
            dist_ref = evidence_id
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported evidence_type '{evidence_type}'. Must be 'drone' or 'disturbance'.")

        merged_notes = incident["investigation_notes"] or ""
        if notes:
            merged_notes = f"{merged_notes}\n[Evidence Linked ({evidence_type} {evidence_id})]: {notes}".strip()

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE incidents
                SET drone_mission_ref = ?, disturbances_polygon_id = ?, investigation_notes = ?,
                    version = ?, updated_at = ?
                WHERE id = ? AND version = ?
                """,
                (drone_ref, dist_ref, merged_notes, new_version, now_str, incident_id, incident["version"])
            )

            if cursor.rowcount == 0:
                raise HTTPException(status_code=409, detail="Conflict during evidence attachment. Incident was concurrently modified.")

            audit_id = f"AUD-{uuid.uuid4().hex[:8]}"
            cursor.execute(
                """
                INSERT INTO audit_events (id, entity_type, entity_id, actor, action, version, timestamp, reason, diff_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    audit_id, "incident", incident_id, "Forensic Evidence Fusion",
                    "ATTACH_EVIDENCE", new_version, now_str,
                    f"Attached {evidence_type} evidence '{evidence_id}'",
                    json.dumps({"evidence_type": evidence_type, "evidence_id": evidence_id})
                )
            )

        return self.get_incident(incident_id)

    def update_incident(
        self,
        incident_id: str,
        status: Optional[str] = None,
        assigned_analyst: Optional[str] = None,
        investigation_notes: Optional[str] = None,
        expected_version: Optional[int] = None
    ) -> Dict[str, Any]:
        current = query_one("SELECT * FROM incidents WHERE id = ?", (incident_id,))
        if not current:
            raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found.")

        # Optimistic concurrency check
        if expected_version is not None and current["version"] != expected_version:
            raise HTTPException(
                status_code=409,
                detail=f"Conflict: Incident has been updated by another process (version {current['version']} != {expected_version})."
            )

        new_status = current["status"]
        if status:
            valid_targets = ALLOWED_TRANSITIONS.get(current["status"], [])
            if status != current["status"] and status not in valid_targets:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid state transition from '{current['status']}' to '{status}'. Allowed: {valid_targets}"
                )
            new_status = status

        new_analyst = assigned_analyst if assigned_analyst is not None else current["assigned_analyst"]
        new_notes = investigation_notes if investigation_notes is not None else current["investigation_notes"]
        new_version = current["version"] + 1
        now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

        diff = {}
        if new_status != current["status"]:
            diff["status"] = {"old": current["status"], "new": new_status}
        if new_analyst != current["assigned_analyst"]:
            diff["assigned_analyst"] = {"old": current["assigned_analyst"], "new": new_analyst}
        if new_notes != current["investigation_notes"]:
            diff["investigation_notes"] = {"old": current["investigation_notes"], "new": new_notes}

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE incidents
                SET status = ?, assigned_analyst = ?, investigation_notes = ?, version = ?, updated_at = ?
                WHERE id = ? AND version = ?
                """,
                (new_status, new_analyst, new_notes, new_version, now_str, incident_id, current["version"])
            )

            # Strict rowcount check to prevent silent update failure and false audit logging
            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=409,
                    detail=f"Conflict: Incident '{incident_id}' was concurrently modified by another transaction. Expected version {current['version']}."
                )

            audit_id = f"AUD-{uuid.uuid4().hex[:8]}"
            cursor.execute(
                """
                INSERT INTO audit_events (id, entity_type, entity_id, actor, action, version, timestamp, reason, diff_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    audit_id, "incident", incident_id,
                    new_analyst or "Forest Operations Command",
                    "UPDATE", new_version, now_str,
                    f"Status transition to {new_status}" if "status" in diff else "Analyst review update",
                    json.dumps(diff)
                )
            )

        return self.get_incident(incident_id)

    def _format_incident(self, r: dict) -> dict:
        return {
            "id": r["id"],
            "title": r["title"],
            "jurisdiction": r["jurisdiction"],
            "coordinates": [r["latitude"], r["longitude"]],
            "detected_at": r["detected_at"],
            "severity": r["severity"],
            "status": r["status"],
            "affected_area_ha": r["affected_area_ha"],
            "tree_loss_pct": r["tree_loss_pct"],
            "detection_source": r["detection_source"],
            "protected_area_violation": bool(r["protected_area_violation"]),
            "protected_reserve_name": r["protected_reserve_name"] or "None",
            "model_confidence": r["model_confidence"],
            "evidence_score": r["evidence_score"],
            "evidence_hash_sha256": r["evidence_hash_sha256"],
            "assigned_analyst": r["assigned_analyst"],
            "investigation_notes": r["investigation_notes"],
            "drone_mission_ref": r["drone_mission_ref"],
            "disturbances_polygon_id": r["disturbances_polygon_id"],
            "authorization_status": r["authorization_status"] or "Unknown",
            "version": r["version"],
            "updated_at": r["updated_at"],
            "is_demo": bool(r.get("is_demo", 0))
        }

incident_service = IncidentService()
