import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_negative_plain_image_inference():
    """
    Guarantees that a blank/flat test image NEVER returns canned machinery detections.
    """
    img = Image.new('RGB', (300, 300), color=(60, 120, 50))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    buf.seek(0)

    res = client.post(
        "/api/drone/detect",
        files={"file": ("blank.jpg", buf, "image/jpeg")},
        data={"prompt_queries": "excavator. truck. logging machinery. timber piles."}
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["detections"]) == 0
    assert len(data["segmentation_polygons"]) == 0
    assert data["gps_latitude"] is None
    assert data["gps_longitude"] is None

def test_corrupt_image_rejection():
    """
    Guarantees that corrupt media is rejected with HTTP 400.
    """
    res = client.post(
        "/api/drone/detect",
        files={"file": ("bad.jpg", io.BytesIO(b"MALFORMED_GARBAGE"), "image/jpeg")}
    )
    assert res.status_code == 400
    assert "INVALID_MEDIA" in res.json()["detail"]

def test_video_rejection_on_image_endpoint():
    """
    Guarantees that video files on still-image endpoint are rejected with HTTP 400.
    """
    res = client.post(
        "/api/drone/detect",
        files={"file": ("mission.mp4", io.BytesIO(b"fake_mp4_bytes"), "video/mp4")}
    )
    assert res.status_code == 400
    assert "INVALID_MEDIA" in res.json()["detail"]

