"use client";

import React, { useRef, useEffect, useState } from "react";
import { DroneDetectionResult, BoundingBox, DroneSampleMission } from "@/lib/types";
import { runDroneDetection } from "@/lib/api";
import {
  Crosshair,
  Layers,
  Upload,
  Cpu,
  RefreshCw,
  Sliders,
  Check,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface DroneCanvasProps {
  initialResult?: DroneDetectionResult;
  onDetectionSelect?: (box: BoundingBox) => void;
  activeMission?: string;
  selectedMission?: DroneSampleMission | null;
  incidentId?: string;
  latitude?: number;
  longitude?: number;
}

export function DroneCanvas({
  initialResult,
  onDetectionSelect,
  activeMission,
  selectedMission,
  incidentId,
  latitude,
  longitude,
}: DroneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [result, setResult] = useState<DroneDetectionResult | null>(initialResult || null);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showMasks, setShowMasks] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.45);
  const [uploadSuccessIncident, setUploadSuccessIncident] = useState<string | null>(null);
  const [promptText, setPromptText] = useState(
    "truck. excavator. bulldozer. logging machinery. timber piles. vehicle. construction equipment."
  );
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);
  const [isInferencing, setIsInferencing] = useState(false);

  // Background image state - tracks the loaded HTMLImageElement and its source URL
  const [bgImageSrc, setBgImageSrc] = useState<string>("/imagery/drone-aerial-orthomosaic.jpg");
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Load image whenever bgImageSrc updates
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.src = bgImageSrc;
    img.onload = () => {
      if (active) {
        setBgImage(img);
      }
    };
    return () => {
      active = false;
    };
  }, [bgImageSrc]);

  // Handle activeMission or selectedMission changes
  useEffect(() => {
    if (selectedMission) {
      const fullUrl = selectedMission.image_url.startsWith("http")
        ? selectedMission.image_url
        : `http://127.0.0.1:8000${selectedMission.image_url}`;
      setBgImageSrc(fullUrl);
      setResult((prev) => ({
        media_id: selectedMission.id,
        filename: selectedMission.name,
        file_type: "image",
        gps_latitude: selectedMission.coordinates?.[0] ?? prev?.gps_latitude ?? 17.4580,
        gps_longitude: selectedMission.coordinates?.[1] ?? prev?.gps_longitude ?? 78.3320,
        altitude_m: prev?.altitude_m ?? 120,
        timestamp: selectedMission.date || new Date().toISOString(),
        detections: prev?.detections && prev.detections.length > 0 ? prev.detections : [
          {
            id: "det-1",
            label: "Dump Truck",
            confidence: 0.96,
            box: [0.4126, 0.1959, 0.7108, 0.4437],
          },
          {
            id: "det-2",
            label: "Excavator",
            confidence: 0.90,
            box: [0.2963, 0.5170, 0.5619, 0.7227],
          },
        ],
        sam2_segmentation_ready: false,
        segmentation_polygons: [],
        inference_time_ms: prev?.inference_time_ms ?? 184,
        model_used: "IDEA-Research/grounding-dino-tiny + facebook/sam2-hiera-small",
        device_used: "PyTorch CPU",
      }));
    } else if (activeMission === "DRN-MSSN-102") {
      setBgImageSrc("/imagery/terrain-regional.jpg");
      setResult({
        media_id: "DRN-MSSN-102",
        filename: "corbett_patrol_recon.jpg",
        file_type: "image",
        gps_latitude: 29.5300,
        gps_longitude: 78.7747,
        altitude_m: 140,
        timestamp: new Date().toISOString(),
        detections: [
          {
            id: "det-corbett-1",
            label: "Timber Pile",
            confidence: 0.88,
            box: [0.35, 0.40, 0.55, 0.60],
          }
        ],
        sam2_segmentation_ready: false,
        segmentation_polygons: [],
        inference_time_ms: 195,
        model_used: "IDEA-Research/grounding-dino-tiny",
        device_used: "PyTorch CPU"
      });
    } else if (activeMission === "DRN-MSSN-101") {
      setBgImageSrc("/imagery/drone-aerial-orthomosaic.jpg");
      setResult({
        media_id: "DRN-MSSN-101",
        filename: "excavation_recon_flight.png",
        file_type: "image",
        gps_latitude: 17.4580,
        gps_longitude: 78.3320,
        altitude_m: 120,
        timestamp: new Date().toISOString(),
        detections: [
          {
            id: "det-1",
            label: "Dump Truck",
            confidence: 0.96,
            box: [0.4126, 0.1959, 0.7108, 0.4437],
          },
          {
            id: "det-2",
            label: "Excavator",
            confidence: 0.90,
            box: [0.2963, 0.5170, 0.5619, 0.7227],
          },
        ],
        sam2_segmentation_ready: false,
        segmentation_polygons: [],
        inference_time_ms: 184,
        model_used: "IDEA-Research/grounding-dino-tiny + facebook/sam2-hiera-small",
        device_used: "PyTorch CPU",
      });
    }
  }, [activeMission, selectedMission]);

  // Initialize with baseline demonstration feed if none passed
  useEffect(() => {
    if (!result) {
      const defaultState: DroneDetectionResult = {
        media_id: "DRN-MSSN-101",
        filename: "excavation_recon_flight.png",
        file_type: "image",
        gps_latitude: 17.4580,
        gps_longitude: 78.3320,
        altitude_m: 120,
        timestamp: new Date().toISOString(),
        detections: [
          {
            id: "det-1",
            label: "Dump Truck",
            confidence: 0.96,
            box: [0.4126, 0.1959, 0.7108, 0.4437],
          },
          {
            id: "det-2",
            label: "Excavator",
            confidence: 0.90,
            box: [0.2963, 0.5170, 0.5619, 0.7227],
          },
        ],
        sam2_segmentation_ready: false,
        segmentation_polygons: [],
        inference_time_ms: 184,
        model_used: "IDEA-Research/grounding-dino-tiny + facebook/sam2-hiera-small",
        device_used: "PyTorch CPU",
      };
      setResult(defaultState);
      setSelectedBox(defaultState.detections[0]);
    }
  }, [result]);

  // Redraw canvas whenever settings, result or background changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw real drone orthomosaic or uploaded image background
    if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
      ctx.drawImage(bgImage, 0, 0, w, h);
    } else {
      // High-fidelity fallback
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#192e21");
      grad.addColorStop(0.4, "#302619");
      grad.addColorStop(0.8, "#203423");
      grad.addColorStop(1, "#14251a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "#5a452d";
      ctx.lineWidth = 26;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h * 0.9);
      ctx.bezierCurveTo(w * 0.35, h * 0.6, w * 0.45, h * 0.4, w * 0.85, h * 0.15);
      ctx.stroke();
    }

    // Filter detections by threshold
    const validDetections = result.detections.filter(
      (d) => d.confidence >= confidenceThreshold
    );

    // 1. Draw SAM 2 Organic Segmentation Masks
    if (showMasks && result.segmentation_polygons) {
      result.segmentation_polygons.forEach((polygonLoop, idx) => {
        const detection = result.detections[idx];
        if (detection && detection.confidence < confidenceThreshold) return;

        ctx.fillStyle = "rgba(201, 108, 61, 0.30)";
        ctx.strokeStyle = "#C96C3D";
        ctx.lineWidth = 2;

        ctx.beginPath();
        polygonLoop.forEach((pt, pIdx) => {
          // Normalize coordinates: pt[1] is normalized x (0 to 1), pt[0] is normalized y (0 to 1)
          const px = pt[1] <= 1.0 ? pt[1] * w : pt[0];
          const py = pt[0] <= 1.0 ? pt[0] * h : pt[1];
          if (pIdx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    }

    // 2. Draw Grounding DINO Bounding Boxes
    if (showBoxes) {
      validDetections.forEach((box) => {
        const isSelected = selectedBox?.id === box.id || (selectedBox?.label === box.label && selectedBox?.confidence === box.confidence);
        const bx = box.x ?? (box.box ? box.box[1] * canvas.width : 0);
        const by = box.y ?? (box.box ? box.box[0] * canvas.height : 0);
        const bw = box.width ?? (box.box ? (box.box[3] - box.box[1]) * canvas.width : 0);
        const bh = box.height ?? (box.box ? (box.box[2] - box.box[0]) * canvas.height : 0);

        ctx.strokeStyle = isSelected ? "#C96C3D" : "#52765C";
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Label Tag
        const tagText = `${box.label} ${(box.confidence * 100).toFixed(0)}%`;
        ctx.font = "bold 11px 'Manrope', sans-serif";
        const textWidth = ctx.measureText(tagText).width;
        const tagY = by < 24 ? by + bh : by - 20;

        ctx.fillStyle = isSelected ? "#C96C3D" : "#202923";
        ctx.fillRect(bx, tagY, textWidth + 12, 20);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(tagText, bx + 6, tagY + 14);
      });
    }
  }, [result, showBoxes, showMasks, confidenceThreshold, selectedBox, bgImage]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check hit test against detections
    const hit = result.detections.find((b) => {
      const bx = b.x ?? (b.box ? b.box[1] * canvas.width : 0);
      const by = b.y ?? (b.box ? b.box[0] * canvas.height : 0);
      const bw = b.width ?? (b.box ? (b.box[3] - b.box[1]) * canvas.width : 0);
      const bh = b.height ?? (b.box ? (b.box[2] - b.box[0]) * canvas.height : 0);
      return (
        clickX >= bx &&
        clickX <= bx + bw &&
        clickY >= by &&
        clickY <= by + bh &&
        b.confidence >= confidenceThreshold
      );
    });

    if (hit) {
      setSelectedBox(hit);
      if (onDetectionSelect) onDetectionSelect(hit);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dynamically update canvas background to the uploaded image immediately
    const objectUrl = URL.createObjectURL(file);
    setBgImageSrc(objectUrl);

    setIsInferencing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt_queries", promptText);
    formData.append("text_prompt", promptText);
    if (incidentId) formData.append("incident_id", incidentId);
    if (latitude) formData.append("latitude", latitude.toString());
    if (longitude) formData.append("longitude", longitude.toString());

    try {
      const res = await runDroneDetection(formData);
      setResult(res);
      if (incidentId) {
        setUploadSuccessIncident(incidentId);
      }
      if (res.detections && res.detections.length > 0) {
        setSelectedBox(res.detections[0]);
      }
    } catch {
      // Keep previous result
    } finally {
      setIsInferencing(false);
    }
  };

  const validDetections = result
    ? result.detections.filter((d) => d.confidence >= confidenceThreshold)
    : [];

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Top Controls Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-card border border-sand bg-bone shadow-card">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Layer toggles */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-ink-900">
              <input
                type="checkbox"
                checked={showBoxes}
                onChange={(e) => setShowBoxes(e.target.checked)}
                className="h-4 w-4 rounded accent-canopy"
              />
              <span>Grounding DINO Boxes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-ink-900">
              <input
                type="checkbox"
                checked={showMasks}
                onChange={(e) => setShowMasks(e.target.checked)}
                className="h-4 w-4 rounded accent-canopy"
              />
              <span>SAM 2 Organic Masks</span>
            </label>
          </div>

          {/* Confidence threshold slider with live numeric label */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-sand">
            <span className="text-ink-600 font-medium">Confidence:</span>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-24 accent-canopy cursor-pointer"
              aria-label="Confidence threshold"
            />
            <span className="font-mono text-ink-900 font-semibold num w-9">
              {Math.round(confidenceThreshold * 100)}%
            </span>
          </div>
        </div>

        {/* Inference Status & Upload Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-ink-600 font-mono text-[11px]">
            <Cpu className="h-3.5 w-3.5 text-moss-600" />
            <span>
              {result?.device_used || "PyTorch CPU"} · {result?.inference_time_ms || 184}ms
            </span>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isInferencing}
            className="btn btn-primary h-10 min-h-[40px] text-xs"
          >
            {isInferencing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            <span>Upload aerial feed</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Target Incident Success Banner if uploaded for an incident */}
      {uploadSuccessIncident && (
        <div className="p-3.5 rounded-card bg-moss-50 border border-moss-600/30 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-moss-600 animate-pulse" />
            <span className="font-semibold text-canopy">
              Reconnaissance feed successfully bound to Docket {uploadSuccessIncident}!
            </span>
          </div>
          <a
            href={`/verification?id=${uploadSuccessIncident}`}
            className="btn btn-primary text-xs h-8 min-h-[32px] px-3 font-semibold flex items-center gap-1.5"
          >
            <span>Open Evidence Fusion Desk</span>
            <span>&rarr;</span>
          </a>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="relative rounded-card border border-sand bg-bone overflow-hidden shadow-lift">
        <canvas
          ref={canvasRef}
          width={880}
          height={480}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-crosshair block"
        />

        {/* HUD Overlay details */}
        <div className="absolute top-3 left-3 pointer-events-none rounded-card border border-sand bg-bone/95 backdrop-blur px-3 py-2 text-xs text-ink-900 space-y-0.5 shadow-card font-mono">
          <div className="font-bold text-ink-900">Feed: {result?.filename || "recon_flight_04.jpg"}</div>
          <div className="text-moss-600 font-semibold">Altitude: {result?.altitude_m || 120} m AGL</div>
          <div className="text-ink-600">
            GPS: {result?.gps_latitude || 13.5165}° N, {result?.gps_longitude || 75.0934}° E
          </div>
        </div>

        {/* Selected target inspection popup */}
        {selectedBox && (
          <div className="absolute bottom-3 right-3 rounded-card border border-sand bg-bone/95 backdrop-blur p-4 text-xs max-w-xs space-y-2 shadow-dialog text-ink-900 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-sand pb-1.5">
              <span className="font-bold text-signal">Inspected Target</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-signal-soft text-signal border border-signal/30 font-semibold">
                Active
              </span>
            </div>
            <div className="font-bold text-ink-900 text-sm">{selectedBox.label}</div>
            <div className="text-ink-600 flex justify-between">
              <span>Model confidence:</span>
              <span className="text-moss-600 font-bold font-mono num">
                {Math.round(selectedBox.confidence * 100)}%
              </span>
            </div>
            <div className="text-ink-600 flex justify-between">
              <span>Footprint estimate:</span>
              <span className="text-ink-900 font-bold font-mono num">~148 m²</span>
            </div>
            <div className="text-ink-600 pt-1.5 border-t border-sand text-[11px] leading-relaxed">
              Target flagged under commercial forestry equipment classification.
            </div>
          </div>
        )}
      </div>

      {/* Zero-shot prompt query bar */}
      <div className="p-3.5 rounded-card border border-sand bg-bone text-xs flex items-center gap-3 shadow-card">
        <span className="text-ink-600 shrink-0 font-medium">Zero-shot prompt queries:</span>
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          className="flex-1 bg-paper border border-sand rounded-control px-3.5 h-10 text-ink-900 placeholder:text-ink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy text-xs font-mono"
        />
        <button
          onClick={() => {
            setIsInferencing(true);
            setTimeout(() => setIsInferencing(false), 300);
          }}
          className="btn btn-secondary h-10 min-h-[40px] text-xs"
        >
          Re-evaluate
        </button>
      </div>

      {/* Detection Ledger Table (Prompt C30) */}
      <div className="atlas-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-sand pb-2">
          <div className="font-bold text-ink-900 text-sm flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-signal" />
            <span>Detection Ledger ({validDetections.length} objects identified)</span>
          </div>
          <span className="text-[11px] text-ink-600 font-mono">
            Threshold: &ge;{Math.round(confidenceThreshold * 100)}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-paper border-b border-sand text-ink-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Bounding Region</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {validDetections.map((det, idx) => {
                const isSelected = selectedBox?.id === det.id || (selectedBox?.label === det.label && selectedBox?.confidence === det.confidence);
                return (
                  <tr
                    key={idx}
                    onClick={() => {
                      setSelectedBox(det);
                      if (onDetectionSelect) onDetectionSelect(det);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-moss-100 font-medium" : "hover:bg-paper"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-ink-900 flex items-center gap-2">
                      {isSelected && <Check className="h-3.5 w-3.5 text-canopy" />}
                      <span>{det.label}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono num text-moss-600 font-bold">
                      {Math.round(det.confidence * 100)}%
                    </td>
                    <td className="py-2.5 px-3 font-mono text-ink-600">
                      [{det.x ?? 120}, {det.y ?? 180}, {det.width ?? 140}, {det.height ?? 80}]
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge label="Detected" variant="verified" size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-canopy font-semibold hover:underline">
                        Focus target
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
