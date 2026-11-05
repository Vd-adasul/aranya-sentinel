import requests

file_path = r"c:\NIT KKR\after placement\open code\neurohack\screenshots\excavation image.png"
with open(file_path, "rb") as f:
    files = {"file": ("excavation image.png", f, "image/png")}
    data = {
        "prompt_queries": "truck. excavator. bulldozer. logging machinery. timber piles. vehicle. construction equipment.",
        "incident_id": "AS-2026-089",
        "latitude": "13.5070",
        "longitude": "75.1070"
    }
    res = requests.post("http://127.0.0.1:8000/api/drone/detect", files=files, data=data)

print("Upload status:", res.status_code)
if res.status_code == 200:
    media_id = res.json().get("media_id")
    print("Bound media ID:", media_id)
    fuse_res = requests.get("http://127.0.0.1:8000/api/evidence/fuse/AS-2026-089")
    print("Fuse status:", fuse_res.status_code)
    fuse_data = fuse_res.json()
    print("Verdict:", fuse_data.get("fusion_analysis", {}).get("corroboration_verdict"))
    print("Drone image URL:", fuse_data.get("drone_layer", {}).get("image_url"))
    print("Targets detected:", len(fuse_data.get("drone_layer", {}).get("detected_targets", [])))
    for t in fuse_data.get("drone_layer", {}).get("detected_targets", []):
        print("  Target:", t["class"], f"{t['conf']*100:.0f}%")
