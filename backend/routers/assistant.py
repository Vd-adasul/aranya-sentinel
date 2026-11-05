from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.assistant_service import assistant_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context_incident_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str]
    referenced_incidents: List[str]
    confidence: float

@router.post("/chat", response_model=ChatResponse)
async def query_assistant(req: ChatRequest):
    """
    Grounded Natural-Language Forest Copilot.
    Synthesizes real platform telemetry, database incident records, and drone evidence.
    """
    res = assistant_service.answer_query(
        message=req.message,
        context_incident_id=req.context_incident_id
    )
    return ChatResponse(
        reply=res["reply"],
        suggested_actions=res["suggested_actions"],
        referenced_incidents=res["referenced_incidents"],
        confidence=res["confidence"]
    )
