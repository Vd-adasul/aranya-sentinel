from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from providers.gfw import gfw_provider

router = APIRouter()

class GFWAlert(BaseModel):
    id: str
    provider: str
    dataset: str
    version: Optional[str] = None
    latitude: float
    longitude: float
    confidence_level: str
    date_detected: str
    geofence_status: Optional[str] = None
    ingested_at: Optional[str] = None
    is_demo: bool = False

@router.get("/status")
async def get_gfw_status():
    return gfw_provider.get_status()

@router.get("/gfw-stream", response_model=List[GFWAlert])
async def get_gfw_alerts(
    dataset: Optional[str] = None,
    include_demo: bool = Query(True, description="Whether to include demonstration fixture alerts")
):
    """
    Returns Global Forest Watch alerts with lineage, dataset version, and spatial geofencing context.
    Demo fixtures are explicitly marked with is_demo=true.
    """
    return gfw_provider.get_alerts(dataset=dataset, include_demo=include_demo)
