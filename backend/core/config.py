import os
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(BASE_DIR, ".env")

# Lightweight .env loader if file exists
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

DB_PATH = os.environ.get("ARANYA_DB_PATH", os.path.join(BASE_DIR, "aranya_sentinel.db"))
ARTIFACTS_DIR = os.environ.get("ARANYA_ARTIFACTS_DIR", os.path.join(BASE_DIR, "artifacts"))
REPORTS_DIR = os.path.join(ARTIFACTS_DIR, "reports")
DRONE_DIR = os.path.join(ARTIFACTS_DIR, "drone_media")

os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(DRONE_DIR, exist_ok=True)

class Settings(BaseModel):
    app_name: str = "Aranya Sentinel Backend"
    version: str = "2.1.0"
    db_path: str = DB_PATH
    artifacts_dir: str = ARTIFACTS_DIR
    reports_dir: str = REPORTS_DIR
    drone_dir: str = DRONE_DIR
    inference_url: str = os.environ.get("INFERENCE_SERVICE_URL", "http://127.0.0.1:8001")
    earth_engine_project: str = os.environ.get("EARTHENGINE_PROJECT", "autogen-464006")
    demo_mode: bool = os.environ.get("DEMO_MODE", "false").lower() in ("true", "1", "yes")
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]

settings = Settings()
