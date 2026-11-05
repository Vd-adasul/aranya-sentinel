# Aranya Sentinel — Implementation Plan & Architecture Specification
**AI-Powered Illegal Deforestation Detection and Forest Intelligence Platform**

## System Architecture

```
                                  +------------------------------------+
                                  |     Aranya Sentinel UI (Next.js)   |
                                  |  - Command Centre (Map-First)      |
                                  |  - Geospatial Intelligence Map     |
                                  |  - Satellite Monitoring & DW       |
                                  |  - Drone AI (DINO + SAM 2)         |
                                  |  - Incident & Verification Queue   |
                                  |  - Analytics & Reports Generator   |
                                  |  - Public Portal & AI Assistant    |
                                  +-----------------+------------------+
                                                    |
                         +--------------------------+--------------------------+
                         |                                                     |
                         v                                                     v
          +-------------------------------+                     +-------------------------------+
          |   FastAPI Backend (Python)    |                     |  Direct Web / Fallback Engine |
          | - Satellite & Dynamic World   |                     | - Client-side PostGIS sim     |
          | - Grounding DINO & SAM 2 Svc  |                     | - Offline/Zero-config mode    |
          | - PostGIS Incident Deduplication                    | - Local Storage & Mock GIS    |
          | - Evidence Fusion Engine      |                     | - Canvas SAM2 Mask Renderer   |
          | - SHA-256 Audit Hasher        |                     | - Grounded Incident Copilot   |
          +-------------------------------+                     +-------------------------------+
                         |                                                     |
                         v                                                     v
          +-------------------------------+                     +-------------------------------+
          |  External Services & AI APIs  |                     | Supabase & PostGIS Storage    |
          | - Hugging Face (DINO / SAM 2) |                     | - Incident Polygons & RLS     |
          | - Sentinel-2 / Dynamic World  |                     | - Media & Evidence Buckets    |
          | - Global Forest Watch (GFW)   |                     | - Spatial Index (GIST)        |
          +-------------------------------+                     +-------------------------------+
```

## Key Modules to Build

1. **Frontend App (`neurohack/frontend`)**:
   - Modern Next.js 14+ App Router with Tailwind CSS, Lucide icons, Leaflet interactive GIS mapping, Recharts data visualization.
   - **Persistent Shell**: Topbar with jurisdictional selector (Western Ghats, Sundarbans, Deodar Reserve, Corbett Buffer, Similipal), live system status indicator, search, notification alerts drawer. Left navigation sidebar with clear categorization.
   - **Page 1: Landing Page (`/`)**: Hero with satellite/aerial imagery, interactive map teaser, mission overview, live disturbance feed, architectural pillars, CTA to launch Command Centre.
   - **Page 2: Command Centre (`/command`)**: Map-first layout with real-time disturbance polygons, severity counters (Critical, High, Medium, Low), live incident stream, quick filter toggles, mini charts for 30-day disturbance trend.
   - **Page 3: Live Geospatial Intelligence Map (`/map`)**: Full-screen GIS workspace with layer controls (Sentinel-2 True Color, NDVI Vegetation Index, Dynamic World Tree Probabilities, Forest Concession Boundaries, Protected Reserve Geofence, Active Drone Flightpaths, Disturbance Clusters), interactive polygon inspector, coordinate HUD, time slider.
   - **Page 4: Satellite Monitoring (`/satellite`)**: Split-screen before-and-after comparison slider (Baseline vs Recent observation), Dynamic World tree-cover loss probability (10m resolution), spectral index delta (NDVI / NBR / NDMI), automated disturbance polygon candidate generator.
   - **Page 5: Drone Intelligence & CV Hub (`/drone`)**: Drag-and-drop imagery & video ingestion, EXIF/GPS coordinate extraction, Grounding DINO zero-shot object detector (logging trucks, excavators, bulldozers, timber stacks, chainsaws), interactive SAM 2 segmentation mask renderer on HTML5 Canvas, frame sampling timeline.
   - **Page 6: Incident Management (`/incidents`)**: Searchable, filterable enterprise investigation grid with severity levels, jurisdictions, detection sources (Satellite, Drone, GFW, Ranger tip-off), quick triage modal, batch status assignments.
   - **Page 7: Verification & Evidence Fusion (`/verification`)**: Dual-pane forensic fusion linking satellite disturbance boundaries with drone detected machinery by spatiotemporal proximity (<500m, <7 days). Human reviewer actions (Verify, Reject, Escalate to Forest Guard), audit notes.
   - **Page 8: Analytics & Threat Intelligence (`/analytics`)**: Time-series disturbance trends, deforestation velocity (hectares/week), jurisdiction vulnerability index, carbon stock loss estimation (Mg C / ha based on biomass defaults), model precision metrics.
   - **Page 9: Reports & Export (`/reports`)**: Official Incident Investigation Dossier generator with SHA-256 cryptographic evidence seal, disturbance polygon coordinates, drone detection snapshots, reviewer sign-off, printable/downloadable format.
   - **Page 10: Public Awareness Portal (`/public`)**: Public-facing sanitized transparency portal, anonymized regional disturbance map, forest conservation metrics, anonymous community tip-off submission form.
   - **Page 11: Administration & Settings (`/admin`)**: Configuration for Hugging Face inference tokens, Global Forest Watch API key, Telegram/Email alert webhooks, PostGIS DB credentials, sensitivity thresholds for DINO & SAM 2.
   - **Grounded AI Copilot (`ForestSentinel AI Assistant`)**: Persistent interactive floating assistant drawer with natural language queries ("Show unverified incidents in Western Ghats", "Summarize incident AS-2026-088", "What machinery was spotted near Buffer Zone B?").

2. **Backend Engine (`neurohack/backend`)**:
   - Python FastAPI application with modular routers:
     - `api/satellite.py`: Sentinel-2 and Dynamic World processing simulator & API hooks.
     - `api/drone.py`: Grounding DINO & SAM 2 inference endpoints, video frame extractor, EXIF GPS parser.
     - `api/incidents.py`: PostGIS spatial queries, polygon bounding box intersection, deduplication logic, severity priority matrix.
     - `api/evidence.py`: Spatiotemporal fusion logic, SHA-256 hashing for tamper-proof evidentiary integrity.
     - `api/assistant.py`: Natural language query parser against active incident database.
     - `api/alerts.py`: Global Forest Watch GLAD/RADD alert ingestion and webhook dispatchers.

3. **Hybrid Robustness**:
   - The frontend includes rich, realistic built-in datasets, realistic Earth observation simulations, and client-side processing so that all 11 pages and the AI assistant work out of the box with zero setup, while also seamlessly connecting to the FastAPI backend or Hugging Face if configured.

