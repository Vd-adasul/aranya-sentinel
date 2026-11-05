from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from services.incident_service import incident_service

router = APIRouter()

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    assigned_analyst: Optional[str] = None
    investigation_notes: Optional[str] = None
    expected_version: Optional[int] = None

class IncidentCreate(BaseModel):
    title: str
    jurisdiction: str
    latitude: float
    longitude: float
    affected_area_ha: float
    tree_loss_pct: float
    severity: Optional[str] = "HIGH"
    status: Optional[str] = "New"
    detection_source: Optional[str] = "Sentinel-2 + Dynamic World"
    protected_area_violation: Optional[bool] = False
    protected_reserve_name: Optional[str] = None
    model_confidence: Optional[float] = 0.85
    evidence_score: Optional[float] = 75.0
    assigned_analyst: Optional[str] = None
    investigation_notes: Optional[str] = None
    drone_mission_ref: Optional[str] = None
    disturbances_polygon_id: Optional[str] = None
    authorization_status: Optional[str] = "Unknown"

class EvidenceAttachment(BaseModel):
    evidence_type: str # "drone" or "disturbance"
    evidence_id: str
    notes: Optional[str] = None

class Incident(BaseModel):
    id: str
    title: str
    jurisdiction: str
    coordinates: List[float] # [lat, lng]
    detected_at: str
    severity: str
    status: str
    affected_area_ha: float
    tree_loss_pct: float
    detection_source: str
    protected_area_violation: bool
    protected_reserve_name: str
    model_confidence: float
    evidence_score: float
    evidence_hash_sha256: str
    assigned_analyst: Optional[str] = None
    investigation_notes: Optional[str] = None
    drone_mission_ref: Optional[str] = None
    disturbances_polygon_id: Optional[str] = None
    authorization_status: Optional[str] = "Unknown"
    version: int = 1
    updated_at: str
    is_demo: bool = False

@router.get("", response_model=List[Incident])
async def list_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    jurisdiction: Optional[str] = None,
    include_demo: bool = Query(True, description="Whether to include demonstration fixture records")
):
    return incident_service.list_incidents(
        status=status,
        severity=severity,
        jurisdiction=jurisdiction,
        include_demo=include_demo
    )

@router.post("", response_model=Incident)
async def create_incident(req: IncidentCreate):
    """
    Creates and persists a real operational incident from surveillance, analyst or field input.
    """
    return incident_service.create_incident(
        title=req.title,
        jurisdiction=req.jurisdiction,
        latitude=req.latitude,
        longitude=req.longitude,
        affected_area_ha=req.affected_area_ha,
        tree_loss_pct=req.tree_loss_pct,
        severity=req.severity or "HIGH",
        status=req.status or "New",
        detection_source=req.detection_source or "Sentinel-2 + Dynamic World",
        protected_area_violation=bool(req.protected_area_violation),
        protected_reserve_name=req.protected_reserve_name,
        model_confidence=req.model_confidence or 0.85,
        evidence_score=req.evidence_score or 75.0,
        assigned_analyst=req.assigned_analyst,
        investigation_notes=req.investigation_notes,
        drone_mission_ref=req.drone_mission_ref,
        disturbances_polygon_id=req.disturbances_polygon_id,
        authorization_status=req.authorization_status or "Unknown",
        is_demo=False
    )

@router.get("/{incident_id}", response_model=Incident)
async def get_incident(incident_id: str):
    return incident_service.get_incident(incident_id)

@router.patch("/{incident_id}", response_model=Incident)
async def update_incident(incident_id: str, update: IncidentUpdate):
    return incident_service.update_incident(
        incident_id=incident_id,
        status=update.status,
        assigned_analyst=update.assigned_analyst,
        investigation_notes=update.investigation_notes,
        expected_version=update.expected_version
    )

@router.post("/{incident_id}/evidence", response_model=Incident)
async def attach_evidence_to_incident(incident_id: str, req: EvidenceAttachment):
    """
    Attaches uploaded drone media or satellite disturbance evidence to an existing incident.
    """
    return incident_service.attach_evidence(
        incident_id=incident_id,
        evidence_type=req.evidence_type,
        evidence_id=req.evidence_id,
        notes=req.notes
    )
