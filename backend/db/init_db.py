import json
import os
import hashlib
from datetime import datetime
from db.database import get_db, query_one
from core.config import settings

DDL_STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS aois (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        state TEXT,
        center_lat REAL,
        center_lng REAL,
        zoom INTEGER,
        canopy_cover_pct REAL,
        risk_level TEXT,
        geometry_geojson TEXT,
        crs TEXT DEFAULT 'EPSG:4326',
        geometry_hash TEXT,
        created_at TEXT NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS analysis_runs (
        id TEXT PRIMARY KEY,
        aoi_id TEXT NOT NULL,
        baseline_start TEXT NOT NULL,
        baseline_end TEXT NOT NULL,
        recent_start TEXT NOT NULL,
        recent_end TEXT NOT NULL,
        status TEXT NOT NULL,
        progress REAL DEFAULT 0.0,
        config_hash TEXT,
        pipeline_version TEXT,
        quality_flags_json TEXT,
        canopy_loss_pct REAL,
        bare_ground_expansion_pct REAL,
        estimated_deforested_area_ha REAL,
        corroboration_score REAL,
        error_message TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (aoi_id) REFERENCES aois(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS observations (
        id TEXT PRIMARY KEY,
        run_id TEXT,
        window_type TEXT NOT NULL,
        provider TEXT NOT NULL,
        satellite TEXT,
        scene_id TEXT NOT NULL,
        acquisition_time TEXT NOT NULL,
        cloud_cover_pct REAL,
        valid_coverage_pct REAL,
        indices_json TEXT,
        dw_probabilities_json TEXT
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS disturbances (
        id TEXT PRIMARY KEY,
        run_id TEXT,
        region_id TEXT NOT NULL,
        coordinates_json TEXT NOT NULL,
        area_hectares REAL NOT NULL,
        tree_prob_before REAL,
        tree_prob_after REAL,
        ndvi_drop REAL,
        confidence REAL,
        primary_driver TEXT,
        detected_at TEXT NOT NULL,
        is_demo INTEGER NOT NULL DEFAULT 0
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS external_alerts (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        dataset TEXT NOT NULL,
        version TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        confidence_level TEXT NOT NULL,
        date_detected TEXT NOT NULL,
        geofence_status TEXT,
        ingested_at TEXT NOT NULL,
        is_demo INTEGER NOT NULL DEFAULT 0
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS drone_media (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        sha256_hash TEXT NOT NULL,
        gps_latitude REAL,
        gps_longitude REAL,
        altitude_m REAL,
        timestamp TEXT NOT NULL,
        detections_json TEXT NOT NULL,
        sam2_ready INTEGER DEFAULT 0,
        polygons_json TEXT NOT NULL,
        inference_time_ms REAL,
        model_used TEXT,
        device_used TEXT,
        storage_path TEXT,
        is_demo INTEGER NOT NULL DEFAULT 0
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        jurisdiction TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        detected_at TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        affected_area_ha REAL NOT NULL,
        tree_loss_pct REAL NOT NULL,
        detection_source TEXT NOT NULL,
        protected_area_violation INTEGER NOT NULL DEFAULT 0,
        protected_reserve_name TEXT,
        model_confidence REAL NOT NULL,
        evidence_score REAL NOT NULL,
        evidence_hash_sha256 TEXT NOT NULL,
        assigned_analyst TEXT,
        investigation_notes TEXT,
        drone_mission_ref TEXT,
        disturbances_polygon_id TEXT,
        authorization_status TEXT DEFAULT 'Unknown',
        version INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL,
        is_demo INTEGER NOT NULL DEFAULT 0
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        version INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        reason TEXT,
        diff_json TEXT
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        title TEXT NOT NULL,
        jurisdiction TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        generated_by TEXT NOT NULL,
        status TEXT NOT NULL,
        summary TEXT NOT NULL,
        area_hectares REAL NOT NULL,
        machinery_detected_json TEXT NOT NULL,
        sha256_evidence_seal TEXT NOT NULL,
        artifact_path TEXT NOT NULL,
        download_url TEXT NOT NULL,
        is_demo INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (incident_id) REFERENCES incidents(id)
    );
    """
]

def run_migrations(conn):
    """
    Applies incremental schema migrations to existing databases
    to prevent 'no such column' errors without dropping data.
    """
    cursor = conn.cursor()
    
    def get_columns(table_name: str) -> set:
        cursor.execute(f"PRAGMA table_info({table_name})")
        return {row[1] for row in cursor.fetchall()}

    tables = {
        "aois": [
            ("geometry_geojson", "TEXT"),
            ("crs", "TEXT DEFAULT 'EPSG:4326'"),
            ("geometry_hash", "TEXT")
        ],
        "disturbances": [
            ("is_demo", "INTEGER NOT NULL DEFAULT 0")
        ],
        "external_alerts": [
            ("is_demo", "INTEGER NOT NULL DEFAULT 0")
        ],
        "drone_media": [
            ("is_demo", "INTEGER NOT NULL DEFAULT 0")
        ],
        "incidents": [
            ("is_demo", "INTEGER NOT NULL DEFAULT 0"),
            ("authorization_status", "TEXT DEFAULT 'Unknown'")
        ],
        "reports": [
            ("is_demo", "INTEGER NOT NULL DEFAULT 0")
        ]
    }

    for table, col_defs in tables.items():
        try:
            existing = get_columns(table)
            if existing:
                for col_name, col_type in col_defs:
                    if col_name not in existing:
                        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}")
        except Exception:
            pass

def init_schema():
    with get_db() as conn:
        cursor = conn.cursor()
        for ddl in DDL_STATEMENTS:
            cursor.execute(ddl)
        run_migrations(conn)

def seed_initial_data():
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Seed base AOIs with valid GeoJSON Polygons
        aoi_count = cursor.execute("SELECT COUNT(*) FROM aois").fetchone()[0]
        base_aois = [
            (
                "western-ghats-zone-4",
                "Western Ghats - Agumbe Rainforest Corridor",
                "Karnataka",
                13.5133,
                75.0931,
                12,
                84.2,
                "High",
                json.dumps({
                    "type": "Polygon",
                    "coordinates": [[[75.070, 13.500], [75.120, 13.500], [75.120, 13.530], [75.070, 13.530], [75.070, 13.500]]]
                }),
                "2026-10-01T00:00:00Z"
            ),
            (
                "sundarbans-core-delta",
                "Sundarbans Biosphere Reserve - Mangrove Block",
                "West Bengal",
                21.9497,
                88.9004,
                11,
                78.5,
                "Critical",
                json.dumps({
                    "type": "Polygon",
                    "coordinates": [[[88.880, 21.930], [88.920, 21.930], [88.920, 21.970], [88.880, 21.970], [88.880, 21.930]]]
                }),
                "2026-10-01T00:00:00Z"
            ),
            (
                "corbett-buffer-north",
                "Jim Corbett Buffer Reserve - Northern Sector",
                "Uttarakhand",
                29.5300,
                78.7747,
                12,
                71.9,
                "Moderate",
                json.dumps({
                    "type": "Polygon",
                    "coordinates": [[[78.750, 29.510], [78.800, 29.510], [78.800, 29.550], [78.750, 29.550], [78.750, 29.510]]]
                }),
                "2026-10-01T00:00:00Z"
            ),
            (
                "similipal-sal-reserve",
                "Similipal National Park - Sal Forest Transect",
                "Odisha",
                21.8485,
                86.3402,
                11,
                89.1,
                "Moderate",
                json.dumps({
                    "type": "Polygon",
                    "coordinates": [[[86.320, 21.820], [86.360, 21.820], [86.360, 21.870], [86.320, 21.870], [86.320, 21.820]]]
                }),
                "2026-10-01T00:00:00Z"
            )
        ]

        if aoi_count == 0:
            cursor.executemany(
                """
                INSERT INTO aois (id, name, state, center_lat, center_lng, zoom, canopy_cover_pct, risk_level, geometry_geojson, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                base_aois
            )
        else:
            # Update missing geometry_geojson if base AOIs were created without it
            for aoi in base_aois:
                cursor.execute(
                    "UPDATE aois SET geometry_geojson = ? WHERE id = ? AND (geometry_geojson IS NULL OR geometry_geojson = '')",
                    (aoi[8], aoi[0])
                )

        # 2. Only seed demo fixtures if demo_mode is explicitly enabled
        if not settings.demo_mode:
            return

        # Seed Disturbances (is_demo = 1)
        dist_count = cursor.execute("SELECT COUNT(*) FROM disturbances WHERE is_demo = 1").fetchone()[0]
        if dist_count == 0:
            disturbances = [
                (
                    "DIST-WG-01", "western-ghats-zone-4",
                    json.dumps([[75.088, 13.518], [75.096, 13.522], [75.099, 13.515], [75.092, 13.510], [75.088, 13.518]]),
                    14.8, 0.91, 0.34, -0.38, 0.95, "Clearing / Logging", "2026-10-24T06:14:00Z", 1
                ),
                (
                    "DIST-WG-02", "western-ghats-zone-4",
                    json.dumps([[75.105, 13.505], [75.112, 13.509], [75.116, 13.502], [75.108, 13.498], [75.105, 13.505]]),
                    6.2, 0.86, 0.48, -0.29, 0.88, "Road Encroachment", "2026-10-22T08:30:00Z", 1
                ),
                (
                    "DIST-CORB-01", "corbett-buffer-north",
                    json.dumps([[78.770, 29.532], [78.778, 29.537], [78.782, 29.529], [78.773, 29.524], [78.770, 29.532]]),
                    8.5, 0.89, 0.41, -0.33, 0.92, "Illegal Mining / Sand Excavation", "2026-10-26T11:45:00Z", 1
                )
            ]
            cursor.executemany(
                "INSERT INTO disturbances (id, region_id, coordinates_json, area_hectares, tree_prob_before, tree_prob_after, ndvi_drop, confidence, primary_driver, detected_at, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                disturbances
            )

        # Seed Drone Media Fixtures (is_demo = 1)
        media_count = cursor.execute("SELECT COUNT(*) FROM drone_media WHERE is_demo = 1").fetchone()[0]
        if media_count == 0:
            drone_fixtures = [
                (
                    "DRN-MSSN-101", "excavation image.png", "image",
                    hashlib.sha256(b"DRN-MSSN-101-FIXTURE").hexdigest(),
                    13.5165, 75.0934, 120.0, "2026-10-25T14:15:00Z",
                    json.dumps([
                        {"label": "Dump truck", "confidence": 0.98, "box": [0.4126, 0.1959, 0.7108, 0.4437]},
                        {"label": "Excavator", "confidence": 0.90, "box": [0.2963, 0.5170, 0.5619, 0.7227]}
                    ]),
                    1, json.dumps([]), 142.5, "Grounding DINO Tiny + SAM 2", "cpu", None, 1
                ),
                (
                    "DRN-MSSN-102", "drone_sand_mining_1.jpg", "image",
                    hashlib.sha256(b"DRN-MSSN-102-FIXTURE").hexdigest(),
                    29.5312, 78.7750, 95.0, "2026-10-26T10:40:00Z",
                    json.dumps([
                        {"label": "Bulldozer", "confidence": 0.93, "box": [0.45, 0.35, 0.70, 0.55]},
                        {"label": "Dump Truck", "confidence": 0.88, "box": [0.25, 0.60, 0.50, 0.80]}
                    ]),
                    1, json.dumps([]), 138.0, "Grounding DINO Tiny + SAM 2", "cpu", None, 1
                )
            ]
            cursor.executemany(
                """
                INSERT INTO drone_media (
                    id, filename, file_type, sha256_hash, gps_latitude, gps_longitude,
                    altitude_m, timestamp, detections_json, sam2_ready, polygons_json,
                    inference_time_ms, model_used, device_used, storage_path, is_demo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                drone_fixtures
            )

        # Seed Incidents (is_demo = 1)
        inc_count = cursor.execute("SELECT COUNT(*) FROM incidents WHERE is_demo = 1").fetchone()[0]
        if inc_count == 0:
            now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
            incidents = [
                (
                    "AS-2026-088", "Commercial Clear-felling & Heavy Machinery Encroachment",
                    "Western Ghats (Agumbe Reserve)", 13.5165, 75.0934, "2026-10-25T14:30:00Z",
                    "CRITICAL", "Under Review", 14.8, 49.0, "Sentinel-2 + Dynamic World & Drone CV",
                    1, "Agumbe Rainforest Core Sanctuary", 0.96, 94.5,
                    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    "Ranger K. Sharma (Senior Forest Conservator)",
                    "Satellite Dynamic World indicates 49% tree cover reduction. Drone reconnaissance flight DRN-MSSN-101 confirmed 1 excavator and 1 log hauler actively operating.",
                    "DRN-MSSN-101", "DIST-WG-01", "Unknown", 1, now_str, 1
                ),
                (
                    "AS-2026-089", "Unauthorized Road Spur Excavation & Logging",
                    "Western Ghats (Shimoga Foothills)", 13.5070, 75.1070, "2026-10-24T09:15:00Z",
                    "HIGH", "New", 6.2, 36.0, "Sentinel-2 + Dynamic World",
                    0, "State Protected Buffer Forest", 0.88, 78.0,
                    "9f83c605d4c82b3e925b90f403241eb69160aaae5d99446478d3c93712cdb410",
                    "Unassigned", "Linear clearing pattern detected extending 1.2km from highway. Suspected illegal timber extraction road.",
                    None, "DIST-WG-02", "Unknown", 1, now_str, 1
                ),
                (
                    "AS-2026-090", "Illegal Riverbed Sand Mining & Sal Canopy Clearing",
                    "Jim Corbett National Park (Northern Buffer)", 29.5312, 78.7750, "2026-10-26T07:45:00Z",
                    "CRITICAL", "Escalated", 8.5, 42.5, "Drone CV + Global Forest Watch",
                    1, "Ramganga Riverine Corridor Buffer", 0.93, 91.0,
                    "bc54e954c2918d363f8bb61ff7d0ee0ef37d403698ba965a953e5e4368297d28",
                    "DFO Amit Rawat", "High priority river corridor encroachment. Drone identified 2 heavy earthmovers. Escalated to Forest Strike Force for field interdiction.",
                    "DRN-MSSN-102", "DIST-CORB-01", "Unknown", 1, now_str, 1
                ),
                (
                    "AS-2026-091", "Mangrove Edge Slash-and-Burn for Brackish Aqua Farm",
                    "Sundarbans Biosphere Reserve", 21.9480, 88.9020, "2026-10-20T16:20:00Z",
                    "HIGH", "Verified", 11.2, 55.0, "Sentinel-2 NBR Delta",
                    1, "Sundarbans Mangrove Ramsar Site", 0.97, 96.0,
                    "7d4a3b8e9102c914bf689e4933924f33b1e779a32c7c5982ef5a1532f84b6619",
                    "Inspector S. Das", "Encroachment confirmed via ground patrol team. 3 diesel pumping stations seized. Legal FIR filed under Wildlife Protection Act 1972.",
                    None, None, "Unpermitted", 1, now_str, 1
                ),
                (
                    "AS-2026-092", "Suspected Encroachment Clearing (Unconfirmed)",
                    "Similipal National Park", 21.8485, 86.3402, "2026-10-26T12:00:00Z",
                    "MEDIUM", "New", 3.1, 22.0, "GFW Integrated Alert",
                    1, "Similipal Tiger Reserve Peripheral Zone", 0.74, 62.0,
                    "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
                    "Unassigned", "Single pass observation; requires second satellite pass or drone dispatch to rule out seasonal shedding.",
                    None, None, "Unknown", 1, now_str, 1
                )
            ]
            cursor.executemany(
                """
                INSERT INTO incidents (
                    id, title, jurisdiction, latitude, longitude, detected_at,
                    severity, status, affected_area_ha, tree_loss_pct, detection_source,
                    protected_area_violation, protected_reserve_name, model_confidence, evidence_score,
                    evidence_hash_sha256, assigned_analyst, investigation_notes,
                    drone_mission_ref, disturbances_polygon_id, authorization_status, version, updated_at, is_demo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                incidents
            )

        # Seed GFW Alerts (is_demo = 1)
        alert_count = cursor.execute("SELECT COUNT(*) FROM external_alerts WHERE is_demo = 1").fetchone()[0]
        if alert_count == 0:
            alerts = [
                ("GFW-IN-9812", "Global Forest Watch", "GLAD-S2 (10m alerts)", "v2.1", 13.5170, 75.0930, "highest", "2026-10-24", "INSIDE_NATIONAL_PARK", "2026-10-24T18:00:00Z", 1),
                ("GFW-IN-9813", "Global Forest Watch", "RADD (Radar-based alert)", "v1.4", 21.9472, 88.9031, "high", "2026-10-21", "INSIDE_RAMSAR_WETLAND", "2026-10-21T18:00:00Z", 1),
                ("GFW-IN-9814", "Global Forest Watch", "GLAD-S2 (10m alerts)", "v2.1", 29.5320, 78.7745, "highest", "2026-10-26", "BUFFER_CORRIDOR", "2026-10-26T18:00:00Z", 1)
            ]
            cursor.executemany(
                "INSERT INTO external_alerts (id, provider, dataset, version, latitude, longitude, confidence_level, date_detected, geofence_status, ingested_at, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                alerts
            )

def init_database():
    init_schema()
    seed_initial_data()

if __name__ == "__main__":
    init_database()
    print("Database initialized successfully.")
