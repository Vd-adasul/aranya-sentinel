from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from services.report_service import report_service

router = APIRouter()

class ReportItem(BaseModel):
    id: str
    incident_id: str
    title: str
    jurisdiction: str
    generated_at: str
    generated_by: str
    status: str
    summary: str
    area_hectares: float
    machinery_detected: List[str]
    sha256_evidence_seal: str
    download_url: str
    drone_mission_ref: Optional[str] = None
    drone_image_url: Optional[str] = None
    is_demo: bool = False

@router.get("", response_model=List[ReportItem])
async def list_reports(include_demo: bool = True):
    return report_service.list_reports(include_demo=include_demo)

@router.post("/generate/{incident_id}", response_model=ReportItem)
async def generate_report(incident_id: str):
    """
    Generates an immutable forensic report snapshot for a verified incident.
    Renders a physical PDF/dossier artifact, hashes the bytes with SHA-256,
    and returns verified evidence metadata.
    """
    return report_service.generate_report(incident_id)

@router.get("/download/{report_id}")
async def download_report_artifact(report_id: str):
    """
    Downloads the physical report artifact (PDF/JSON) secured by the cryptographic seal.
    """
    file_path, media_type, filename = report_service.get_report_artifact(report_id)
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename,
        headers={"Cache-Control": "no-cache", "Content-Disposition": f'attachment; filename="{filename}"'}
    )
