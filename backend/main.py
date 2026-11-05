"""
Aranya Sentinel - Backend Engine
AI-Powered Illegal Deforestation Detection & Forest Intelligence API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import satellite, drone, incidents, evidence, assistant, alerts, reports
from db.init_db import init_database
from db.database import query_one
from providers.inference_client import inference_client
from core.config import settings

app = FastAPI(
    title="Aranya Sentinel API",
    description="Autonomous Forest Intelligence, Satellite Monitoring, and Drone Computer Vision Fusion Engine",
    version=settings.version
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    print("[Aranya Sentinel] Booting engine and initializing SQLite database...")
    init_database()
    print("[Aranya Sentinel] Database initialized. Loading models...")
    try:
        from model_registry import registry
        registry.load_models()
        print("[Aranya Sentinel] AI Models resident and warmed up.")
    except Exception as e:
        print(f"[Aranya Sentinel] Model load note: {e}")

# Mount modular routers
app.include_router(satellite.router, prefix="/api/satellite", tags=["Satellite Intelligence"])
app.include_router(satellite.router, prefix="/api/aois", tags=["AOI Management"])
app.include_router(drone.router, prefix="/api/drone", tags=["Drone & Computer Vision"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incident Management"])
app.include_router(evidence.router, prefix="/api/evidence", tags=["Evidence Fusion"])
app.include_router(assistant.router, prefix="/api/assistant", tags=["AI Forest Copilot"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["External Alerts & GFW"])
app.include_router(reports.router, prefix="/api/reports", tags=["Investigation Reports"])

@app.get("/api/health")
async def health_check():
    db_ok = False
    try:
        r = query_one("SELECT 1 as alive")
        db_ok = r and r["alive"] == 1
    except Exception:
        db_ok = False

    inf_status = await inference_client.get_status()

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "Aranya Sentinel Backend",
        "version": settings.version,
        "database": {
            "engine": "SQLite WAL",
            "connected": db_ok,
            "path": settings.db_path
        },
        "inference": inf_status,
        "models": {
            "grounding_dino": "IDEA-Research/grounding-dino-tiny",
            "sam_2": "facebook/sam2-hiera-small",
            "dynamic_world": "GOOGLE/DYNAMICWORLD/V1"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
