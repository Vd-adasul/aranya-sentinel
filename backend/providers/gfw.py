import os
from typing import List, Dict, Any, Optional
from db.database import query_all

DATASETS_METADATA = {
    "GLAD-S2": {
        "name": "GLAD-S2 (10m Sentinel-2 Alerts)",
        "version": "v2.1",
        "update_cadence": "5-8 days",
        "resolution": "10m",
        "confidence_levels": ["nominal", "high", "highest"]
    },
    "RADD": {
        "name": "RADD (Radar Alerts for Detecting Deforestation)",
        "version": "v1.4",
        "update_cadence": "6-12 days (Sentinel-1 SAR)",
        "resolution": "10m",
        "confidence_levels": ["unconfirmed", "high"]
    },
    "Integrated": {
        "name": "GFW Integrated Deforestation Alerts",
        "version": "v3.0",
        "update_cadence": "Daily synthesized",
        "resolution": "10m",
        "confidence_levels": ["nominal", "high", "highest"]
    }
}

class GFWProvider:
    def __init__(self):
        self.metadata = DATASETS_METADATA
        self.api_key = os.environ.get("GFW_API_KEY")
        self.live_stream_connected = bool(self.api_key)

    def get_status(self) -> Dict[str, Any]:
        return {
            "provider": "Global Forest Watch Data API",
            "live_stream_connected": self.live_stream_connected,
            "status": "CONNECTED" if self.live_stream_connected else "UNAUTHENTICATED_OFFLINE",
            "supported_datasets": list(self.metadata.keys()),
            "notice": "Configure GFW_API_KEY to fetch live global alert subscriptions. Database records marked is_demo=true are reference fixtures."
        }

    def get_alerts(self, dataset: Optional[str] = None, include_demo: bool = True) -> List[Dict[str, Any]]:
        """
        Retrieves deforestation alerts with dataset version, geofencing context, and explicit demo attribution.
        """
        sql = "SELECT * FROM external_alerts WHERE 1=1"
        params = []
        if not include_demo:
            sql += " AND is_demo = 0"
        if dataset:
            sql += " AND dataset LIKE ?"
            params.append(f"%{dataset}%")

        sql += " ORDER BY date_detected DESC"
        rows = query_all(sql, tuple(params))

        return [
            {
                "id": r["id"],
                "provider": r["provider"],
                "dataset": r["dataset"],
                "version": r["version"],
                "latitude": r["latitude"],
                "longitude": r["longitude"],
                "confidence_level": r["confidence_level"],
                "date_detected": r["date_detected"],
                "geofence_status": r["geofence_status"],
                "ingested_at": r["ingested_at"],
                "is_demo": bool(r.get("is_demo", 0))
            }
            for r in rows
        ]

gfw_provider = GFWProvider()
