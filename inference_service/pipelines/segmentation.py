from typing import List, Any
import numpy as np
import torch
from PIL import Image

def mask_to_polygon(mask: np.ndarray, max_points: int = 24) -> List[List[float]]:
    """
    Extracts ordered polygon contour vertices from a 2D boolean mask.
    Vertices are normalized to [0.0, 1.0] as [y, x] to match Aranya Sentinel UI format.
    """
    H, W = mask.shape
    if not np.any(mask):
        return []

    y_indices, x_indices = np.where(mask)
    if len(y_indices) < 3:
        return []

    cy, cx = np.mean(y_indices), np.mean(x_indices)
    angles = np.linspace(-np.pi, np.pi, max_points, endpoint=False)
    polygon = []

    max_r = np.sqrt(H**2 + W**2)
    r_steps = np.linspace(0, max_r, 60)

    for angle in angles:
        cos_a = np.cos(angle)
        sin_a = np.sin(angle)
        xs = np.clip(np.round(cx + r_steps * cos_a).astype(int), 0, W - 1)
        ys = np.clip(np.round(cy + r_steps * sin_a).astype(int), 0, H - 1)
        valid = mask[ys, xs]
        if np.any(valid):
            last_idx = np.where(valid)[0][-1]
            polygon.append([
                round(float(ys[last_idx]) / H, 4),
                round(float(xs[last_idx]) / W, 4)
            ])

    if polygon and polygon[0] != polygon[-1]:
        polygon.append(polygon[0])
    return polygon

def run_sam2_segmentation(
    image: Image.Image,
    pixel_boxes: List[List[float]],
    model: Any,
    processor: Any,
    device: str = "cpu"
) -> List[List[List[float]]]:
    """
    Runs SAM2 Hiera Small on the provided image guided by bounding box prompts.
    Returns a list of polygon coordinate arrays for each detection box.
    """
    if model is None or processor is None or not pixel_boxes:
        return []

    # Format boxes for Sam2Processor: shape (batch_size=1, num_boxes, 4)
    # Box coordinates are [xmin, ymin, xmax, ymax]
    boxes_batch = [pixel_boxes]

    try:
        inputs = processor(images=image, input_boxes=boxes_batch, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = model(**inputs)

        # Post process masks
        processed_masks = processor.post_process_masks(
            outputs.pred_masks.cpu(),
            inputs["original_sizes"].cpu(),
            binarize=True
        )

        # processed_masks[0] has shape (num_boxes, 3_multimask, H, W)
        masks_tensor = processed_masks[0]
        polygons = []

        num_boxes = len(pixel_boxes)
        for i in range(num_boxes):
            # Select the mask with best score or first multimask
            mask_2d = masks_tensor[i, 0].numpy()
            poly = mask_to_polygon(mask_2d)
            polygons.append(poly)

        return polygons
    except Exception as e:
        print(f"[SAM2 Segmentation Warning] {e}")
        return []

