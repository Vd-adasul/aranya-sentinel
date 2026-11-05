import os
import json
from PIL import Image, ImageDraw, ImageFont
from core.config import settings

def generate_annotated_image(media_id: str, storage_path: str, detections: list) -> str:
    """
    Renders Grounding DINO + SAM 2 bounding boxes, labels, and confidence tags
    onto the raw drone orthomosaic using PIL, and saves it as <media_id>_annotated.jpg.
    Returns the absolute path to the annotated image.
    """
    if not storage_path or not os.path.exists(storage_path):
        return storage_path

    out_path = os.path.join(settings.drone_dir, f"{media_id}_annotated.jpg")
    try:
        img = Image.open(storage_path).convert("RGB")
        w, h = img.size
        draw = ImageDraw.Draw(img)

        # Dynamic font sizing based on resolution
        font = None
        font_size = max(16, int(w / 65))
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except Exception:
            try:
                font = ImageFont.load_default()
            except Exception:
                pass

        line_w = max(4, int(w / 280))

        for d in detections:
            box = d.get("box")
            if not box or len(box) != 4:
                continue
            ymin, xmin, ymax, xmax = box
            if max(box) <= 1.0:
                x0, y0 = int(xmin * w), int(ymin * h)
                x1, y1 = int(xmax * w), int(ymax * h)
            else:
                x0, y0, x1, y1 = int(xmin), int(ymin), int(xmax), int(ymax)

            # Ensure coordinates are within image boundaries
            x0, x1 = max(0, min(x0, w - 1)), max(0, min(x1, w - 1))
            y0, y1 = max(0, min(y0, h - 1)), max(0, min(y1, h - 1))

            # Outer subtle dark border for high contrast on bright sand/gravel
            draw.rectangle([max(0, x0 - 1), max(0, y0 - 1), min(w - 1, x1 + 1), min(h - 1, y1 + 1)], outline="#000000", width=line_w + 2)
            # Primary tactical orange bounding box
            draw.rectangle([x0, y0, x1, y1], outline="#C96C3D", width=line_w)

            # Label badge
            lbl = d.get("label", "TARGET").upper()
            conf = int(float(d.get("confidence", 0.9)) * 100)
            label_text = f" {lbl} {conf}% "

            badge_h = font_size + 10
            badge_w = int(len(label_text) * (font_size * 0.65)) + 12
            tag_y0 = y0 - badge_h if y0 >= badge_h else y0
            tag_y1 = tag_y0 + badge_h
            tag_x0 = max(0, min(x0, w - badge_w))
            tag_x1 = tag_x0 + badge_w

            # Draw badge background with dark rim
            draw.rectangle([max(0, tag_x0 - 1), max(0, tag_y0 - 1), min(w - 1, tag_x1 + 1), min(h - 1, tag_y1 + 1)], fill="#17211B")
            draw.rectangle([tag_x0, tag_y0, tag_x1, tag_y1], fill="#C96C3D")
            # Draw badge text
            draw.text((tag_x0 + 6, tag_y0 + 4), label_text, fill="#FFFFFF", font=font)

        img.save(out_path, "JPEG", quality=95)
        return out_path
    except Exception as e:
        print(f"[AnnotationService] Failed to draw detections on {media_id}: {e}")
        return storage_path
