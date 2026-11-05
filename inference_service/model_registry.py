import os
import torch
from typing import Optional, Tuple, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_DIR = os.environ.get("WEIGHTS_DIR", os.path.join(BASE_DIR, "weights"))
if not os.path.exists(WEIGHTS_DIR) and os.path.exists("/root/weights"):
    WEIGHTS_DIR = "/root/weights"

DINO_DIR = os.path.join(WEIGHTS_DIR, "grounding-dino-tiny")
SAM2_DIR = os.path.join(WEIGHTS_DIR, "sam2-hiera-small")

class ModelRegistry:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.dino_model: Optional[Any] = None
        self.dino_processor: Optional[Any] = None
        self.sam2_model: Optional[Any] = None
        self.sam2_processor: Optional[Any] = None
        self.dino_loaded: bool = False
        self.sam2_loaded: bool = False
        self.load_error: Optional[str] = None

    def load_models(self):
        print(f"[ModelRegistry] Initializing models on device: {self.device}")
        
        # 1. Load Grounding DINO Tiny (local weights or fallback to Hugging Face Hub)
        dino_src = DINO_DIR if (os.path.exists(DINO_DIR) and len(os.listdir(DINO_DIR)) > 0) else "IDEA-Research/grounding-dino-tiny"
        try:
            from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection
            print(f"[ModelRegistry] Loading Grounding DINO from {dino_src}...")
            self.dino_processor = AutoProcessor.from_pretrained(dino_src)
            self.dino_model = AutoModelForZeroShotObjectDetection.from_pretrained(dino_src).to(self.device)
            self.dino_model.eval()
            self.dino_loaded = True
            print("[ModelRegistry] Grounding DINO Tiny successfully loaded.")
        except Exception as e:
            print(f"[ModelRegistry] Error loading Grounding DINO: {e}")
            self.load_error = str(e)

        # 2. Load SAM 2 Hiera Small (local weights or fallback to Hugging Face Hub)
        sam2_src = SAM2_DIR if (os.path.exists(SAM2_DIR) and len(os.listdir(SAM2_DIR)) > 0) else "facebook/sam2-hiera-small"
        try:
            from transformers import Sam2Model, Sam2Processor
            print(f"[ModelRegistry] Loading SAM2 from {sam2_src}...")
            self.sam2_processor = Sam2Processor.from_pretrained(sam2_src)
            self.sam2_model = Sam2Model.from_pretrained(sam2_src).to(self.device)
            self.sam2_model.eval()
            self.sam2_loaded = True
            print("[ModelRegistry] SAM2 Hiera Small successfully loaded.")
        except Exception as e:
            print(f"[ModelRegistry] Error loading SAM2: {e}")

    def get_status(self):
        return {
            "status": "ready" if (self.dino_loaded or self.sam2_loaded) else "unavailable",
            "device": self.device,
            "dino_loaded": self.dino_loaded,
            "sam2_loaded": self.sam2_loaded,
            "dino_model_id": "IDEA-Research/grounding-dino-tiny",
            "sam2_model_id": "facebook/sam2-hiera-small",
            "weights_dir": WEIGHTS_DIR
        }

# Global registry instance
registry = ModelRegistry()
