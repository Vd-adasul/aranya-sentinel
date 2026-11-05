from fastapi import APIRouter
from services.fusion_service import fusion_service

router = APIRouter()

@router.get("/fuse/{incident_id}")
async def get_fused_evidence(incident_id: str):
    """
    Computes Spatiotemporal Evidence Fusion for a verified incident:
    1. Validates incident existence in database.
    2. Loads linked disturbance polygon geometry.
    3. Calculates real geodesic centroid distance in meters and inside-polygon test.
    4. Evaluates drone mission CV detections.
    5. Computes SHA-256 cryptographic audit seal over the genuine fused evidence payload.
    """
    return fusion_service.fuse_incident_evidence(incident_id)
