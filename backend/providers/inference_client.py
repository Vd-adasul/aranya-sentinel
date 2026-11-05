import io
import os
import sys
import httpx
from typing import Dict, Any, Optional
from PIL import Image
from core.config import settings

# Add inference_service to sys.path so in-process execution is seamless if microservice is co-located
INFERENCE_DIR = os.path.join(os.path.dirname(os.path.dirname(settings.artifacts_dir)), "inference_service")
if INFERENCE_DIR not in sys.path:
    sys.path.insert(0, INFERENCE_DIR)

class InferenceClient:
    def __init__(self, service_url: str = settings.inference_url):
        self.service_url = service_url

    async def get_status(self) -> Dict[str, Any]:
        # Try HTTP endpoint first
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.service_url}/status")
                if res.status_code == 200:
                    return res.json()
        except Exception:
            pass

        # Fall back to in-process model registry
        try:
            from model_registry import registry
            return registry.get_status()
        except Exception as e:
            return {
                "status": "unavailable",
                "device": "cpu",
                "dino_loaded": False,
                "sam2_loaded": False,
                "error": str(e)
            }

    async def predict(
        self,
        image_bytes: bytes,
        filename: str,
        text_prompt: str,
        box_threshold: float = 0.24,
        text_threshold: float = 0.20
    ) -> Dict[str, Any]:
        # Try HTTP endpoint first
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                files = {"file": (filename, image_bytes, "image/jpeg")}
                data = {
                    "text_prompt": text_prompt,
                    "box_threshold": str(box_threshold),
                    "text_threshold": str(text_threshold)
                }
                res = await client.post(f"{self.service_url}/predict", files=files, data=data)
                if res.status_code == 200:
                    return res.json()
                elif res.status_code in [400, 413, 503]:
                    raise RuntimeError(f"{res.json().get('detail', res.text)}")
        except RuntimeError:
            raise
        except Exception:
            # Fall back to in-process execution
            pass

        # In-process execution with real DINO and SAM2
        try:
            from model_registry import registry
            from pipelines.detection import run_dino_detection
            from pipelines.segmentation import run_sam2_segmentation
            import time

            if not registry.dino_loaded:
                registry.load_models()

            if not registry.dino_loaded:
                raise RuntimeError("MODEL_UNAVAILABLE: Grounding DINO weights are not loaded.")

            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            width, height = image.size

            start_t = time.time()
            raw_detections = run_dino_detection(
                image=image,
                prompt=text_prompt,
                model=registry.dino_model,
                processor=registry.dino_processor,
                device=registry.device,
                box_threshold=box_threshold,
                text_threshold=text_threshold
            )

            sam2_polygons = []
            if registry.sam2_loaded and raw_detections:
                pixel_boxes = [d["pixel_box"] for d in raw_detections]
                sam2_polygons = run_sam2_segmentation(
                    image=image,
                    pixel_boxes=pixel_boxes,
                    model=registry.sam2_model,
                    processor=registry.sam2_processor,
                    device=registry.device
                )

            clean_detections = [
                {
                    "label": d["label"],
                    "confidence": d["confidence"],
                    "box": d["box"]
                }
                for d in raw_detections
            ]

            elapsed_ms = round((time.time() - start_t) * 1000, 1)

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
        except Exception as e:
            raise RuntimeError(f"Inference execution failed: {str(e)}")

inference_client = InferenceClient()
