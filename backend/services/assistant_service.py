import re
from typing import List, Dict, Any, Optional
from db.database import query_all, query_one

class AssistantService:
    def answer_query(self, message: str, context_incident_id: Optional[str] = None) -> Dict[str, Any]:
        msg = message.lower()

        # 1. Identify any requested incident dynamically via context or regex
        target_id = context_incident_id
        if not target_id:
            matches = re.findall(r"AS-\d{4}-[A-Z0-9]+", message, re.IGNORECASE)
            if matches:
                target_id = matches[0].upper()

        if target_id:
            inc = query_one("SELECT * FROM incidents WHERE UPPER(id) = ?", (target_id,))
            if inc:
                violation_str = f"in violation of {inc['protected_reserve_name']}" if inc["protected_area_violation"] else "in buffer zone"
                reply = (
                    f"Incident **{inc['id']}** ({inc['title']}):\n"
                    f"- **Jurisdiction**: {inc['jurisdiction']} ({violation_str})\n"
                    f"- **Status / Severity**: {inc['status']} | {inc['severity']}\n"
                    f"- **Canopy Impact**: {inc['affected_area_ha']} hectares disturbed ({inc['tree_loss_pct']}% canopy loss)\n"
                    f"- **Detection Source**: {inc['detection_source']}\n"
                    f"- **Investigation Notes**: {inc['investigation_notes'] or 'No analyst notes recorded.'}\n"
                    f"- **Assigned Analyst**: {inc['assigned_analyst'] or 'Unassigned'}"
                )
                return {
                    "reply": reply,
                    "suggested_actions": [
                        f"View Incident {inc['id']} in Verification Workspace",
                        f"Generate Forensic Evidence Dossier for {inc['id']}",
                        "Update Incident Status / Assign Analyst"
                    ],
                    "referenced_incidents": [inc["id"]],
                    "confidence": 0.98
                }

        # 2. Machinery / Drone queries
        if any(w in msg for w in ["machinery", "drone", "truck", "excavator", "equipment"]):
            missions = query_all("SELECT * FROM incidents WHERE drone_mission_ref IS NOT NULL")
            m_lines = []
            ref_ids = []
            for m in missions:
                ref_ids.append(m["id"])
                m_lines.append(f"• **{m['id']}** ({m['jurisdiction']}): Mission {m['drone_mission_ref']} linked to {m['affected_area_ha']} ha disturbance. Notes: {m['investigation_notes']}")

            if m_lines:
                reply = (
                    "Verified drone aerial surveillance operations linked to active ground disturbances:\n"
                    + "\n".join(m_lines) + "\n\n"
                    "Grounding DINO Tiny + SAM 2 pipeline extracts bounding coordinates and polygon masks for tracked heavy equipment."
                )
            else:
                reply = "No incidents currently have linked drone aerial surveillance missions."

            return {
                "reply": reply,
                "suggested_actions": [
                    f"View Incident {ref_ids[0]} in Verification Workspace" if ref_ids else "Upload Drone Flight Imagery",
                    "Export Drone CV Evidence Dossier",
                    "Dispatch Quick Response Forest Patrol"
                ],
                "referenced_incidents": ref_ids,
                "confidence": 0.97
            }

        # 3. Critical / Severity queries
        if any(w in msg for w in ["critical", "high", "priority", "breach", "urgent"]):
            criticals = query_all("SELECT * FROM incidents WHERE severity = 'CRITICAL'")
            crit_lines = [
                f"{i+1}. **{c['id']}** in {c['jurisdiction']} ({c['affected_area_ha']} ha, Status: {c['status']})"
                for i, c in enumerate(criticals)
            ]
            if criticals:
                reply = (
                    f"Currently, there are **{len(criticals)} CRITICAL** active incidents requiring intervention:\n"
                    + "\n".join(crit_lines) + "\n\n"
                    f"{len(criticals)} critical incident(s) currently flagged for immediate field interdiction."
                )
            else:
                reply = "There are currently no CRITICAL severity incidents recorded in the ledger."

            return {
                "reply": reply,
                "suggested_actions": [
                    "Filter Command Center to Critical Incidents",
                    "Generate Emergency Interdiction Briefing",
                    "Review Protected Area Geofence Violations"
                ],
                "referenced_incidents": [c["id"] for c in criticals],
                "confidence": 0.96
            }

        # 4. Carbon / Biomass queries
        if any(w in msg for w in ["carbon", "biomass", "emission", "loss"]):
            total_ha_row = query_one("SELECT SUM(affected_area_ha) as total_ha FROM incidents WHERE status != 'Rejected'")
            total_ha = round(total_ha_row["total_ha"] or 0.0, 1)
            # IPCC Tier-1 regional biomass baseline (~180 Mg C / ha in tropical wet evergreen / moist deciduous)
            estimated_c = round(total_ha * 180.0)

            active_incidents = [r["id"] for r in query_all("SELECT id FROM incidents WHERE status != 'Rejected' LIMIT 5")]

            reply = (
                f"Across all active and verified disturbance polygons, cumulative forest disturbance stands at **{total_ha} hectares**.\n"
                f"Applying IPCC Tier-1 regional biomass baseline guidelines (~180 Mg C / ha for moist deciduous/evergreen forest), "
                f"this equates to approximately **{estimated_c:,} metric tons of sequestered Carbon** at risk.\n"
                "*(Note: Carbon figures are indicative estimates subject to site-specific LIDAR and soil carbon validation).* "
            )
            return {
                "reply": reply,
                "suggested_actions": [
                    "Open Carbon Stock Analytics",
                    "Inspect Dynamic World Tree Cover Probability Timeline",
                    "Download Biomass Loss Assessment Report"
                ],
                "referenced_incidents": active_incidents,
                "confidence": 0.92
            }

        # 5. Default fallback: summarize current platform telemetry dynamically
        all_incidents = query_all("SELECT id, jurisdiction, status FROM incidents")
        aoi_count = query_one("SELECT COUNT(*) as c FROM aois")["c"]
        reply = (
            f"Aranya Sentinel Intelligence Engine is currently monitoring **{aoi_count} biosphere corridor(s)** across India. "
            f"There are **{len(all_incidents)} incident records** in the ledger across Sentinel-2, Dynamic World, and Drone CV pipelines. "
            "You can query specific incidents, ask for heavy machinery correlations, examine carbon stock at risk, or check protected boundary violations."
        )
        return {
            "reply": reply,
            "suggested_actions": [
                "Show suspected disturbances detected in the last 30 days",
                "Which protected regions have the most pending investigations?",
                "Show incidents with drone evidence",
                f"Summarize incident {all_incidents[0]['id']}" if all_incidents else "Register New Area of Interest"
            ],
            "referenced_incidents": [all_incidents[0]["id"]] if all_incidents else [],
            "confidence": 0.95
        }

assistant_service = AssistantService()
