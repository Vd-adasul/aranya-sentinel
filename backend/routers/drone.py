import os
import io
import time
import uuid
import hashlib
import json
from typing import List, Optional, Tuple
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from PIL import Image

from providers.inference_client import inference_client
from db.database import get_db, query_all, query_one
from core.config import settings

router = APIRouter()

MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024

class BoundingBox(BaseModel):
    label: str
    confidence: float
    box: List[float] # [ymin, xmin, ymax, xmax] normalized (0 to 1)

class DroneDetectionResult(BaseModel):
    media_id: str
    filename: str
    file_type: str # "image" or "video"
    gps_latitude: Optional[float] = None
    gps_longitude: Optional[float] = None
    altitude_m: Optional[float] = None
    timestamp: str
    detections: List[BoundingBox]
    sam2_segmentation_ready: bool
    segmentation_polygons: List[List[List[float]]]
    inference_time_ms: float
    model_used: str
    device_used: str
    image_url: Optional[str] = None

def extract_exif_metadata(image: Image.Image) -> Tuple[Optional[float], Optional[float], Optional[float]]:
    """
    Extracts GPS latitude, longitude and altitude from image EXIF tags if present.
    """
    try:
        exif = image._getexif()
        if not exif:
            return None, None, None

        from PIL.ExifTags import TAGS, GPSTAGS
        gps_info = {}
        for key, value in exif.items():
            decoded = TAGS.get(key, key)
            if decoded == "GPSInfo":
                for t in value:
                    sub_decoded = GPSTAGS.get(t, t)
                    gps_info[sub_decoded] = value[t]

        def _dms_to_deg(val):
            if isinstance(val, (int, float)):
                return float(val)
            d = float(val[0][0]) / float(val[0][1]) if isinstance(val[0], tuple) else float(val[0])
            m = float(val[1][0]) / float(val[1][1]) if isinstance(val[1], tuple) else float(val[1])
            s = float(val[2][0]) / float(val[2][1]) if isinstance(val[2], tuple) else float(val[2])
            return d + (m / 60.0) + (s / 3600.0)

        lat, lon, alt = None, None, None
        if "GPSLatitude" in gps_info and "GPSLatitudeRef" in gps_info:
            lat = _dms_to_deg(gps_info["GPSLatitude"])
            if str(gps_info["GPSLatitudeRef"]).upper() != "N":
                lat = -lat

        if "GPSLongitude" in gps_info and "GPSLongitudeRef" in gps_info:
            lon = _dms_to_deg(gps_info["GPSLongitude"])
            if str(gps_info["GPSLongitudeRef"]).upper() != "E":
                lon = -lon

        if "GPSAltitude" in gps_info:
            alt_val = gps_info["GPSAltitude"]
            alt = float(alt_val[0]) / float(alt_val[1]) if isinstance(alt_val, tuple) else float(alt_val)

        return lat, lon, alt
    except Exception:
        return None, None, None

@router.post("/detect", response_model=DroneDetectionResult)
async def analyze_drone_media(
    file: UploadFile = File(...),
    prompt_queries: Optional[str] = Form(None),
    text_prompt: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    altitude: Optional[float] = Form(None),
    incident_id: Optional[str] = Form(None)
):
    """
    Zero-shot detection using Grounding DINO Tiny + SAM 2 Small.
    Returns real model detections and segmentation contours.
    Corrupt media or unsupported video is strictly rejected.
    Negative detections truthfully return an empty list; never invents positive evidence.
    """
    raw_filename = file.filename or "unknown.jpg"
    if raw_filename.lower().endswith((".mp4", ".mov", ".avi", ".mkv", ".webm")):
        raise HTTPException(
            status_code=400,
            detail="INVALID_MEDIA: Video files are unsupported on this endpoint. Submit still imagery or video keyframes."
        )

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="INVALID_MEDIA: Uploaded file is empty.")

    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="PAYLOAD_TOO_LARGE: Image exceeds 25 MB limit.")

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"INVALID_MEDIA: Corrupted image file could not be decoded ({str(e)})"
        )

    # If coordinates were not explicitly passed, attempt to extract from EXIF
    if latitude is None or longitude is None:
        exif_lat, exif_lon, exif_alt = extract_exif_metadata(image)
        if latitude is None:
            latitude = exif_lat
        if longitude is None:
            longitude = exif_lon
        if altitude is None:
            altitude = exif_alt

    # Compute SHA-256 digest of incoming media and generate collision-safe media ID
    media_hash = hashlib.sha256(contents).hexdigest()
    media_id = f"DRONE-{uuid.uuid4().hex[:12]}"

    # Path-safe storage: use unique media_id and validated extension
    safe_ext = os.path.splitext(raw_filename)[1].lower()
    if safe_ext not in [".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp"]:
        safe_ext = ".jpg"
    storage_filename = f"{media_id}{safe_ext}"
    storage_path = os.path.join(settings.drone_dir, storage_filename)

    with open(storage_path, "wb") as f:
        f.write(contents)

    # Determine prompt from either prompt_queries or text_prompt (backward compatibility)
    effective_prompt = prompt_queries or text_prompt or "truck. excavator. bulldozer. logging machinery. timber piles. vehicle. construction equipment."

    # Execute genuine inference via inference_client
    try:
        inf_result = await inference_client.predict(
            image_bytes=contents,
            filename=raw_filename,
            text_prompt=effective_prompt
        )
    except Exception as e:
        # Clean up stored artifact on failure to prevent orphaned disk files
        if os.path.exists(storage_path):
            os.remove(storage_path)
        raise HTTPException(status_code=503, detail=f"Inference pipeline error: {str(e)}")

    detections = [
        BoundingBox(
            label=d["label"].strip(),
            confidence=d["confidence"],
            box=d["box"]
        )
        for d in inf_result.get("detections", [])
    ]
    polygons = inf_result.get("segmentation_polygons", [])
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    # Persist media and detection log to SQLite
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO drone_media (
                id, filename, file_type, sha256_hash, gps_latitude, gps_longitude,
                altitude_m, timestamp, detections_json, sam2_ready, polygons_json,
                inference_time_ms, model_used, device_used, storage_path, is_demo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
            """,
            (
                media_id, raw_filename, "image", media_hash, latitude, longitude,
                altitude, now_iso, json.dumps([d.dict() for d in detections]),
                1 if inf_result.get("sam2_segmentation_ready") else 0,
                json.dumps(polygons), inf_result.get("inference_time_ms", 0.0),
                inf_result.get("model_used", ""), inf_result.get("device_used", ""),
                storage_path
            )
        )
        if incident_id:
            cursor.execute(
                "UPDATE incidents SET drone_mission_ref = ?, status = 'Under Review' WHERE id = ?",
                (media_id, incident_id)
            )

    # Generate and cache permanent annotated resultant image with model bounding boxes
    try:
        from services.annotation_service import generate_annotated_image
        generate_annotated_image(media_id, storage_path, [d.dict() for d in detections])
    except Exception as ann_err:
        print(f"[Drone] Annotation generation note: {ann_err}")

    # Immediately compile or refresh the legal investigation dossier for this incident
    if incident_id:
        try:
            from services.report_service import report_service
            report_service.generate_report(incident_id, generated_by="Autonomous Vision Drone Pipeline")
        except Exception as rep_err:
            print(f"[Drone] Auto-report generation note: {rep_err}")

    return DroneDetectionResult(
        media_id=media_id,
        filename=raw_filename,
        file_type="image",
        gps_latitude=latitude,
        gps_longitude=longitude,
        altitude_m=altitude,
        timestamp=now_iso,
        detections=detections,
        sam2_segmentation_ready=inf_result.get("sam2_segmentation_ready", False),
        segmentation_polygons=polygons,
        inference_time_ms=inf_result.get("inference_time_ms", 0.0),
        model_used=inf_result.get("model_used", "Grounding DINO Tiny + SAM 2"),
        device_used=inf_result.get("device_used", "cpu"),
        image_url=f"/api/drone/media/{media_id}"
    )

@router.get("/media/{media_id}")
async def get_drone_media_file(media_id: str, raw: bool = False):
    """
    Retrieves stored drone image by media_id.
    Serves the annotated resultant image with model bounding boxes by default,
    or the raw capture if raw=true.
    """
    clean_id = media_id.replace(".png", "").replace(".jpg", "").replace(".jpeg", "").replace("_annotated", "")
    row = query_one(
        "SELECT id, storage_path, filename, detections_json FROM drone_media WHERE id = ? OR id = ? OR filename = ?",
        (media_id, clean_id, media_id)
    )
    if not row or not row.get("storage_path"):
        raise HTTPException(status_code=404, detail=f"Drone media '{media_id}' not found.")

    path = row["storage_path"]
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Media file missing on disk.")

    canonical_id = row["id"]
    if not raw:
        ann_path = os.path.join(settings.drone_dir, f"{canonical_id}_annotated.jpg")
        if not os.path.exists(ann_path):
            try:
                from services.annotation_service import generate_annotated_image
                dets = json.loads(row["detections_json"]) if row.get("detections_json") else []
                generate_annotated_image(canonical_id, path, dets)
            except Exception as e:
                print(f"[Drone] On-demand annotation failed: {e}")
        if os.path.exists(ann_path):
            return FileResponse(
                ann_path,
                media_type="image/jpeg",
                headers={
                    "Content-Disposition": "inline",
                    "Cache-Control": "public, max-age=120"
                }
            )

    media_type = "image/jpeg" if path.lower().endswith((".jpg", ".jpeg")) else "image/png"
    return FileResponse(
        path,
        media_type=media_type,
        headers={
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=120"
        }
    )

@router.get("/record/{media_id}")
async def get_drone_media_record(media_id: str):
    """
    Retrieves full metadata and detections for a specific drone media ID.
    """
    row = query_one("SELECT * FROM drone_media WHERE id = ?", (media_id,))
    if not row:
        raise HTTPException(status_code=404, detail=f"Drone media '{media_id}' not found.")

    dets = []
    try:
        dets = json.loads(row["detections_json"])
    except Exception:
        pass

    polys = []
    try:
        polys = json.loads(row["polygons_json"]) if row.get("polygons_json") else []
    except Exception:
        pass

    return {
        "media_id": row["id"],
        "filename": row["filename"],
        "file_type": row["file_type"],
        "sha256_hash": row["sha256_hash"],
        "gps_latitude": row["gps_latitude"],
        "gps_longitude": row["gps_longitude"],
        "altitude_m": row["altitude_m"],
        "timestamp": row["timestamp"],
        "detections": dets,
        "sam2_segmentation_ready": bool(row.get("sam2_ready", 0)),
        "segmentation_polygons": polys,
        "inference_time_ms": row.get("inference_time_ms", 0.0),
        "model_used": row.get("model_used", ""),
        "device_used": row.get("device_used", ""),
        "image_url": f"/api/drone/media/{row['id']}",
        "is_demo": bool(row.get("is_demo", 0))
    }

@router.get("/status")
async def get_model_status():
    return await inference_client.get_status()

@router.get("/samples")
async def get_sample_drone_missions(include_demo: bool = Query(True)):
    """
    Returns actual recent drone media records from the database.
    Falls back to demo missions only if demo_mode is enabled.
    """
    sql = "SELECT * FROM drone_media WHERE 1=1"
    if not include_demo and not settings.demo_mode:
        sql += " AND is_demo = 0"
    sql += " ORDER BY timestamp DESC LIMIT 10"
    rows = query_all(sql)

    if rows:
        results = []
        for r in rows:
            dets = []
            try:
                dets = json.loads(r["detections_json"])
            except Exception:
                pass
            labels = list({d.get("label", "").capitalize() for d in dets if d.get("label")})
            results.append({
                "id": r["id"],
                "name": f"Drone Surveillance Record {r['id'][:10]}",
                "drone_model": r["model_used"] or "DJI Matrice 350 RTK",
                "date": r["timestamp"],
                "coordinates": [r["gps_latitude"], r["gps_longitude"]] if r["gps_latitude"] and r["gps_longitude"] else None,
                "detections_count": len(dets),
                "machinery_identified": labels,
                "image_url": f"/api/drone/media/{r['id']}",
                "status": "EVIDENCE_ATTACHED" if r["gps_latitude"] else "STORED_UNLINKED",
                "is_demo": bool(r.get("is_demo", 0))
            })
        return results

    return []
