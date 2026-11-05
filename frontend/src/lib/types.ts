export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type IncidentStatus = 
  | "New" 
  | "Under Review" 
  | "Verified" 
  | "Rejected" 
  | "Escalated" 
  | "Resolved";

export type DataProvenance = "server" | "cached" | "local-demo";

export interface Incident {
  id: string;
  title: string;
  description?: string;
  region?: string;
  jurisdiction: string;
  coordinates: [number, number]; // [lat, lng]
  detected_at: string;
  severity: Severity;
  status: IncidentStatus;
  affected_area_ha: number;
  area_hectares?: number;
  tree_loss_pct: number;
  detection_source: string;
  protected_area_violation: boolean;
  protected_reserve_name: string;
  model_confidence: number;
  evidence_score: number;
  evidence_hash_sha256: string;
  assigned_analyst?: string;
  investigation_notes?: string;
  rejection_reason?: string;
  drone_mission_ref?: string;
  evidence_count?: number;
  disturbances_polygon_id?: string;
  authorization_status?: string;
  version?: number;
  updated_at?: string;
  is_demo?: boolean;
}

export interface DisturbancePolygon {
  id: string;
  region: string;
  coordinates: [number, number][]; // [[lng, lat], ...]
  area_hectares: number;
  tree_prob_before: number;
  tree_prob_after: number;
  ndvi_drop: number;
  confidence: number;
  primary_driver: string;
  timestamp: string;
  change_type?: string;
  dominant_class_before?: string;
  dominant_class_after?: string;
}

export interface Region {
  id: string;
  name: string;
  state: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  canopy_cover_pct: number;
  risk_level: "Critical" | "High" | "Moderate" | "Low";
  active_disturbances: number;
  active_incidents?: number;
  area_sq_km?: number;
}

export interface BoundingBox {
  id?: string;
  label: string;
  confidence: number;
  box?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface DroneDetectionResult {
  media_id: string;
  filename: string;
  file_type: "image" | "video";
  gps_latitude?: number;
  gps_longitude?: number;
  altitude_m?: number;
  timestamp: string;
  detections: BoundingBox[];
  sam2_segmentation_ready: boolean;
  segmentation_polygons: number[][][]; // list of organic polygon loops
  inference_time_ms: number;
  model_used: string;
  device_used: string;
  image_url?: string;
}

export interface EvidenceFusionData {
  incident_id: string;
  fusion_analysis: {
    spatial_match: boolean;
    distance_between_centroids_m: number;
    temporal_correlation_score: number;
    corroboration_verdict: string;
    explanation: string;
    evidentiary_integrity: {
      sha256: string;
      chain_of_custody: string;
      tamper_status: string;
    };
  };
  satellite_layer: {
    sensor: string;
    resolution: string;
    polygon_bounds: [number, number][];
    spectral_indices: {
      ndvi_drop: number;
      nbr_drop: number;
    };
  };
  drone_layer?: {
    drone_id?: string;
    media_id?: string;
    filename?: string;
    image_url?: string | null;
    gps?: [number, number] | null;
    altitude_m?: number | null;
    sensor?: string;
    detected_targets?: {
      class: string;
      conf: number;
      box?: [number, number, number, number];
      gps?: [number, number];
    }[];
  } | null;
}

export interface ReportItem {
  id: string;
  incident_id: string;
  title: string;
  jurisdiction: string;
  generated_at: string;
  generated_by: string;
  status: string;
  summary: string;
  area_hectares: number;
  machinery_detected: string[];
  sha256_evidence_seal: string;
  download_url: string;
  drone_mission_ref?: string;
  drone_image_url?: string;
}

export interface ChatResponse {
  reply: string;
  suggested_actions: string[];
  referenced_incidents: string[];
  confidence: number;
}

export interface AoiCreateRequest {
  id: string;
  name: string;
  state?: string;
  geometry_geojson: {
    type: string;
    coordinates?: number[][][];
    geometry?: {
      type: string;
      coordinates: number[][][];
    };
  };
  risk_level?: "Low" | "Moderate" | "High" | "Critical";
  canopy_cover_pct?: number;
}

export interface SatelliteAnalysisRequest {
  aoi_id: string;
  baseline_date?: string;
  recent_date?: string;
  allow_benchmark?: boolean;
}

export interface IncidentCreateRequest {
  title: string;
  jurisdiction: string;
  latitude: number;
  longitude: number;
  affected_area_ha: number;
  tree_loss_pct: number;
  severity?: Severity;
  status?: IncidentStatus;
  detection_source?: string;
  protected_area_violation?: boolean;
  protected_reserve_name?: string;
  model_confidence?: number;
  evidence_score?: number;
  assigned_analyst?: string;
  investigation_notes?: string;
  drone_mission_ref?: string;
  disturbances_polygon_id?: string;
  authorization_status?: string;
}

export interface EvidenceAttachmentRequest {
  evidence_type: "drone" | "disturbance";
  evidence_id: string;
  notes?: string;
}

export interface DroneSampleMission {
  id: string;
  name: string;
  drone_model: string;
  date: string;
  coordinates?: [number, number] | null;
  detections_count: number;
  machinery_identified: string[];
  image_url: string;
  status: string;
  is_demo: boolean;
}

export interface GFWAlert {
  id: string;
  provider: string;
  dataset: string;
  version?: string;
  latitude: number;
  longitude: number;
  confidence_level: string;
  date_detected: string;
  geofence_status?: string;
  ingested_at?: string;
  is_demo?: boolean;
}

