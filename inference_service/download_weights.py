"""
Script to download official pretrained weights locally to disk:
1. IDEA-Research/grounding-dino-tiny (~680 MB)
2. facebook/sam2-hiera-small (~180 MB)
"""
import os
from huggingface_hub import snapshot_download

def download_models(target_dir="./weights"):
    os.makedirs(target_dir, exist_ok=True)
    print("=" * 60)
    print("ARANYA SENTINEL - MODEL WEIGHTS DOWNLOADER")
    print("=" * 60)

    # 1. Grounding DINO Tiny
    print("\n[1/2] Downloading IDEA-Research/grounding-dino-tiny...")
    dino_path = snapshot_download(
        repo_id="IDEA-Research/grounding-dino-tiny",
        local_dir=os.path.join(target_dir, "grounding-dino-tiny"),
        ignore_patterns=["*.msgpack", "*.h5", "*.ot"]
    )
    print(f"✓ Saved Grounding DINO Tiny to: {dino_path}")

    # 2. SAM 2 Hiera Small
    print("\n[2/2] Downloading facebook/sam2-hiera-small...")
    sam_path = snapshot_download(
        repo_id="facebook/sam2-hiera-small",
        local_dir=os.path.join(target_dir, "sam2-hiera-small"),
        ignore_patterns=["*.msgpack", "*.h5", "*.ot"]
    )
    print(f"✓ Saved SAM 2 Hiera Small to: {sam_path}")

    print("\nAll model weights downloaded successfully.")

if __name__ == "__main__":
    download_models()

