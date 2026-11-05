"""
Aranya Sentinel - Grounding DINO Tiny + SAM 2 Small Dedicated Inference Server
"""
import io
import time
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

from model_registry import registry
from pipelines.detection import run_dino_detection
from pipelines.segmentation import run_sam2_segmentation

app = FastAPI(title="Aranya Sentinel - Model Inference Microservice", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024 # 25 MB limit

@app.on_event("startup")
async def startup_event():
    registry.load_models()

@app.get("/")
def root():
    return registry.get_status()

@app.get("/status")
def status():
    return registry.get_status()

@app.post("/predict")
async def predict_drone(
    file: UploadFile = File(...),
    text_prompt: str = Form("truck. excavator. bulldozer. logging machinery. timber piles. vehicle. construction equipment."),
    box_threshold: float = Form(0.28),
    text_threshold: float = Form(0.22)
):
    if not registry.dino_loaded:
        raise HTTPException(
            status_code=503,
            detail="MODEL_UNAVAILABLE: Grounding DINO Tiny weights are not loaded."
        )

    # Reject video
    filename = file.filename or "unknown"
    if filename.lower().endswith((".mp4", ".mov", ".avi", ".mkv", ".webm")):
        raise HTTPException(
            status_code=400,
            detail="INVALID_MEDIA: Video files are unsupported on this endpoint. Submit still imagery or keyframes."
        )

    start_time = time.time()
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"PAYLOAD_TOO_LARGE: Image exceeds {MAX_IMAGE_SIZE_BYTES / (1024 * 1024):.1f} MB limit."
        )

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"INVALID_MEDIA: Could not decode image file ({str(e)})"
        )

    width, height = image.size

    # Run genuine zero-shot detection
    detections = run_dino_detection(
        image=image,
        prompt=text_prompt,
        model=registry.dino_model,
        processor=registry.dino_processor,
        device=registry.device,
        box_threshold=box_threshold,
        text_threshold=text_threshold
    )

    # If SAM2 is loaded and detections exist, generate true segmentation masks
    sam2_polygons = []
    if registry.sam2_loaded and detections:
        pixel_boxes = [d["pixel_box"] for d in detections]
        sam2_polygons = run_sam2_segmentation(
            image=image,
            pixel_boxes=pixel_boxes,
            model=registry.sam2_model,
            processor=registry.sam2_processor,
            device=registry.device
        )

    # Strip raw pixel_box from response
    clean_detections = [
        {
            "label": d["label"],
            "confidence": d["confidence"],
            "box": d["box"]
        }
        for d in detections
    ]

    elapsed_ms = round((time.time() - start_time) * 1000, 1)

    return {
        "filename": filename,
        "image_dimensions": [width, height],
        "prompt": text_prompt,
        "detections": clean_detections,
        "sam2_segmentation_ready": registry.sam2_loaded,
        "segmentation_polygons": sam2_polygons,
        "inference_time_ms": elapsed_ms,
        "model_used": "IDEA-Research/grounding-dino-tiny" + (" + facebook/sam2-hiera-small" if registry.sam2_loaded else ""),
        "device_used": registry.device
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8001, reload=False)
