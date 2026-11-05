import modal

app = modal.App("aranya-sentinel-inference")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("libgl1", "libglib2.0-0")
    .pip_install(
        "fastapi>=0.110.0",
        "uvicorn>=0.28.0",
        "python-multipart>=0.0.9",
        "pillow>=10.2.0",
        "torch>=2.2.0",
        "torchvision>=0.17.0",
        "transformers>=4.40.0",
        "huggingface-hub>=0.22.0",
        "numpy>=1.26.0",
    )
    .run_commands(
        "python -c \""
        "from huggingface_hub import snapshot_download; "
        "snapshot_download('IDEA-Research/grounding-dino-tiny', local_dir='/root/weights/grounding-dino-tiny', ignore_patterns=['*.msgpack', '*.h5', '*.ot']); "
        "snapshot_download('facebook/sam2-hiera-small', local_dir='/root/weights/sam2-hiera-small', ignore_patterns=['*.msgpack', '*.h5', '*.ot']); "
        "print('Weights downloaded successfully')\""
    )
    .add_local_python_source("pipelines", "model_registry", "app", copy=True)
)

@app.function(
    image=image,
    cpu=2,
    scaledown_window=20,  # Scaledown window strictly set to 20s to ensure $0 idle cost
    timeout=180,
)
@modal.asgi_app()
def fastapi_app():
    import sys
    sys.path.insert(0, "/root")
    from app import app as fastapi_instance
    return fastapi_instance
