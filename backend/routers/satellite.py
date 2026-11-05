import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from db.database import query_all, query_one, get_db
from providers.earth_engine import earth_engine_provider
from geospatial.geo_utils import polygon_centroid, polygon_area_hectares

router = APIRouter()

class DisturbancePolygon(BaseModel):
    id: str
    region: str
    coordinates: List[List[float]]
    area_hectares: float
    tree_prob_before: Optional[float] = None
    tree_prob_after: Optional[float] = None
    ndvi_drop: Optional[float] = None
    confidence: float
    primary_driver: str
    timestamp: str
    is_demo: bool = False

class AnalysisRequest(BaseModel):
    aoi_id: str
    baseline_date: str = "2026-08-01"
    recent_date: str = "2026-10-25"
    allow_benchmark: bool = False

class AoiCreateRequest(BaseModel):
    id: str
    name: str
    state: Optional[str] = "Unspecified"
    geometry_geojson: Dict[str, Any]
    risk_level: Optional[str] = "Moderate"
    canopy_cover_pct: Optional[float] = 80.0

@router.get("/regions")
async def get_monitoring_regions():
    rows = query_all("SELECT * FROM aois ORDER BY name ASC")
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "state": r["state"],
            "center": [r["center_lat"], r["center_lng"]],
            "zoom": r["zoom"] or 11,
            "canopy_cover_pct": r["canopy_cover_pct"],
            "risk_level": r["risk_level"],
            "active_disturbances": query_one("SELECT COUNT(*) as c FROM disturbances WHERE region_id = ?", (r["id"],))["c"]
        }
        for r in rows
    ]

@router.post("/aois")
async def register_aoi(req: AoiCreateRequest):
    """
    Registers a new Area of Interest (AOI) with validated GeoJSON geometry.
    Computes centroid and stores polygon coordinates for live Earth Engine satellite analysis.
    """
    existing = query_one("SELECT id FROM aois WHERE id = ?", (req.id,))
    if existing:
        raise HTTPException(status_code=409, detail=f"AOI with id '{req.id}' already exists.")

    geom = req.geometry_geojson
    coords = None
    if geom.get("type") == "Polygon" and "coordinates" in geom:
        coords = geom["coordinates"][0]
    elif geom.get("type") == "Feature" and "geometry" in geom:
        coords = geom["geometry"].get("coordinates", [[]])[0]

    if not coords or len(coords) < 3:
        raise HTTPException(
            status_code=400,
            detail="INVALID_GEOMETRY: geometry_geojson must contain a valid Polygon with at least 3 coordinates."
        )

    try:
        center_lat, center_lng = polygon_centroid(coords)
    except Exception:
        center_lat, center_lng = coords[0][1], coords[0][0]

    now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO aois (id, name, state, center_lat, center_lng, zoom, canopy_cover_pct, risk_level, geometry_geojson, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                req.id, req.name, req.state, center_lat, center_lng, 12,
                req.canopy_cover_pct, req.risk_level, json.dumps(geom), now_str
            )
        )

    return {
        "status": "CREATED",
        "aoi_id": req.id,
        "name": req.name,
        "center": [center_lat, center_lng],
        "created_at": now_str
    }

@router.get("/dynamic-world/analysis")
async def analyze_dynamic_world(
    region_id: str = "western-ghats-zone-4",
    t1_date: str = "2026-08-01",
    t2_date: str = "2026-10-25",
    allow_benchmark: bool = Query(True, description="Allow historical calibration benchmark fixture if Earth Engine is unauthenticated")
):
    """
    Executes Sentinel-2 Harmonized + Dynamic World land cover change detection.
    Retains real scene IDs, usable coverage denominators, and quality metadata.
    Rejects unauthenticated requests for unmonitored regions/dates with HTTP 503.
    """
    aoi = query_one("SELECT * FROM aois WHERE id = ?", (region_id,))
    if not aoi:
        raise HTTPException(status_code=404, detail=f"AOI '{region_id}' not found.")

    coords = None
    if aoi.get("geometry_geojson"):
        try:
            geom = json.loads(aoi["geometry_geojson"])
            if geom.get("type") == "Polygon":
                coords = geom.get("coordinates", [[]])[0]
            elif isinstance(geom, list):
                coords = geom
        except Exception:
            coords = None

    return earth_engine_provider.run_analysis(
        aoi_id=region_id,
        t1_date=t1_date,
        t2_date=t2_date,
        aoi_coords=coords,
        allow_benchmark=allow_benchmark
    )

@router.get("/disturbances", response_model=List[DisturbancePolygon])
async def get_disturbance_polygons(
    region_id: Optional[str] = None,
    include_demo: bool = Query(True, description="Whether to include demonstration fixture polygons")
):
    sql = "SELECT * FROM disturbances WHERE 1=1"
    params = []
    if not include_demo:
        sql += " AND is_demo = 0"
    if region_id:
        sql += " AND region_id = ?"
        params.append(region_id)

    rows = query_all(sql, tuple(params))

    return [
        DisturbancePolygon(
            id=r["id"],
            region=r["region_id"],
            coordinates=json.loads(r["coordinates_json"]),
            area_hectares=r["area_hectares"],
            tree_prob_before=r["tree_prob_before"],
            tree_prob_after=r["tree_prob_after"],
            ndvi_drop=r["ndvi_drop"],
            confidence=r["confidence"],
            primary_driver=r["primary_driver"],
            timestamp=r["detected_at"],
            is_demo=bool(r.get("is_demo", 0))
        )
        for r in rows
    ]

@router.post("/analyses")
async def create_satellite_analysis_run(req: AnalysisRequest):
    """
    Schedules an analysis run for an AOI using loaded database polygon geometry.
    """
    aoi = query_one("SELECT * FROM aois WHERE id = ?", (req.aoi_id,))
    if not aoi:
        raise HTTPException(status_code=404, detail=f"AOI '{req.aoi_id}' not found.")

    coords = None
    if aoi.get("geometry_geojson"):
        try:
            geom = json.loads(aoi["geometry_geojson"])
            if geom.get("type") == "Polygon":
                coords = geom.get("coordinates", [[]])[0]
            elif isinstance(geom, list):
                coords = geom
        except Exception:
            coords = None

    run_id = f"RUN-{uuid.uuid4().hex[:8]}"
    now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    result = earth_engine_provider.run_analysis(
        aoi_id=req.aoi_id,
        t1_date=req.baseline_date,
        t2_date=req.recent_date,
        aoi_coords=coords,
        allow_benchmark=req.allow_benchmark
    )

    cd = result.get("change_detection", {})

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO analysis_runs (
                id, aoi_id, baseline_start, baseline_end, recent_start, recent_end,
                status, progress, config_hash, pipeline_version, quality_flags_json,
                canopy_loss_pct, bare_ground_expansion_pct, estimated_deforested_area_ha,
                corroboration_score, created_at, completed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                run_id, req.aoi_id, req.baseline_date, req.baseline_date,
                req.recent_date, req.recent_date, "COMPLETED", 1.0,
                "cfg-hash-s2-dw", result.get("pipeline_version", "v2.4.0"),
                json.dumps(result.get("quality_flags", {})),
                cd.get("canopy_loss_pct", 0.0),
                cd.get("bare_ground_expansion_pct", 0.0),
                cd.get("estimated_deforested_area_ha", 0.0),
                cd.get("corroboration_score", 0.0),
                now_str, now_str
            )
        )

    return {
        "run_id": run_id,
        "status": "COMPLETED",
        "result": result
    }
