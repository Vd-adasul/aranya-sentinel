# ARANYA SENTINEL (अरण्य सेंटिनल)
### AI-Powered Autonomous Deforestation Detection, Geospatial Intelligence & Forensic Evidence Platform

Aranya Sentinel is an **editorial field-intelligence console** engineered to detect, track, investigate, and legally prosecute illegal deforestation, unauthorized clear-cutting, and protected reserve encroachments across India's critically endangered biospheres.

The system fuses **Sentinel-2 multispectral satellite surveillance (10m resolution)**, **Google Dynamic World AI land cover probability models**, **zero-shot aerial drone computer vision (Grounding DINO Tiny + SAM 2 Small)**, and **cryptographic spatiotemporal evidence fusion** into an archival survey atlas designed for high-stakes environmental law enforcement.

---

## 🏛️ Visual Identity & Design System: Editorial Field-Intelligence Console

Built strictly according to [`Aranya_Sentinel_Visual_Redesign_Specification.md`](file:///c:/NIT%20KKR/after%20placement/open%20code/neurohack/frontend/Aranya_Sentinel_Visual_Redesign_Specification.md), pairing the authority of an archival survey atlas with the speed and precision of contemporary geospatial operations software.

### 1. Controlled Palette Architecture
- **Canopy 950** (`#183C2D`) & **Canopy 800** (`#28513D`): Deep forest structural anchors, primary buttons, and navigational active states.
- **Moss 600** (`#52765C`) & **Moss 100** (`#E6EDE3`): Vegetation markers, verified state indicators, and subtle cartographic keylines.
- **Paper 100** (`#F4F1E7`), **Bone 50** (`#FFFEF8`), & **Sand 200** (`#E7E1D3`): Warm canvas ground, elevated card surfaces, and ruled tabular borders.
- **Ink 900** (`#202923`) & **Ink 600** (`#59645C`): High-contrast editorial typography and secondary observational metadata.
- **Signal Orange** (`#C96C3D`): Action triggers, drone bounding boxes, and urgent operational notices.
- **Critical Red** (`#B94236`): Severe canopy breach polygons, high-probability clear-cuts, and emergency alerts.
- **Water Slate** (`#587B8B`): Riparian corridors and mangrove hydrology overlays.

### 2. Tri-Voice Typography
- **Instrument Serif** (Editorial / Display): Italic section accents and historical field documentation motifs (`A living picture of the forest`, `Western Ghats Cadastral Survey`).
- **Manrope** (Operational UI / Body): Clean, legible 14–16px body copy, structural navigation, form inputs, and status badges.
- **IBM Plex Mono** (Cartographic Data): GPS coordinates (`13.5133° N, 75.0931° E`), SHA-256 evidence hashes, spectral indices (`ΔNDVI -0.42`), and flight telemetry.

### 3. Spatial System & Tactile Controls
- **Radii Hierarchy**: `8px` (`rounded-control`) for buttons and inputs, `12px` (`rounded-card`) for operational cards, `16px` (`rounded-panel`) for map sheets and video viewports, and `9999px` (`rounded-full`) for status badges.
- **Human Touch Targets**: Strict 44–48px control heights for glove-compatible field operation.
- **Truthful Status Disclosure**: Live PyTorch GPU inference engine is clearly distinguished from local simulated telemetry.

---

## 🗺️ Operational Workspaces (All 11 Routes Live & Verified 200 OK)

| Route | Workspace | Description |
|---|---|---|
| `/` | **Survey Atlas Overview** | Two-column editorial briefing, satellite evidence plate with real coordinate delta, and active biosphere transects. |
| `/command` | **Command Centre** | Operational dispatch room with 4 KPI summary cards, Leaflet GIS viewport, priority incident triage, and real-time activity stream. |
| `/map` | **Geospatial GIS Canvas** | Full-viewport cartographic exploration with Esri World Imagery, Carto Dark, and Topo basemaps, temporal observation window, and polygon inspector drawer. |
| `/satellite` | **Satellite & Dynamic World** | Interactive dual-date swipe comparison (Baseline vs Recent observation), 10m land cover class probabilities, and spectral indices ($\Delta\text{NDVI}$, $\text{NBR}$, $\text{NDMI}$). |
| `/drone` | **Aerial CV Studio** | Aerial reconnaissance suite running Grounding DINO zero-shot detection and SAM 2 organic segmentation masks with confidence slider and SHA-256 custody card. |
| `/incidents` | **Incident Ledger** | Ruled operational docket with multi-parameter filtering (Status, Severity, Jurisdiction) and a 6-state lifecycle triage modal. |
| `/verification` | **Evidence Fusion Desk** | Spatiotemporal correlation banner matching satellite canopy drops with drone-detected machinery ($\Delta d < 500\text{m}$, $\Delta t < 7\text{ days}$) under the Indian Wildlife Protection Act 1972. |
| `/analytics` | **Forest Velocity Analytics** | 6-month clearing velocity bars, IPCC Tier-1 Biomass Carbon stock loss estimation ($\text{Mg C / ha}$), and reserve vulnerability indices. |
| `/reports` | **Forensic Dossiers** | Official Incident Investigation Dossier generator with letter-folded layout, SHA-256 cryptographic seal, and one-click printable court-admissible PDF formatting. |
| `/public` | **Public Transparency** | Public awareness view with anonymized incident metrics and zero-IP-tracking citizen tip-off submission form. |
| `/admin` | **System Administration** | Safe masked credential inputs, PostGIS spatial connection configuration, and emergency Telegram alert webhook dispatcher. |

---

## 🚀 Running the Application

### 1. Frontend (Next.js 14 App Router + Tailwind CSS)

```bash
cd "c:\NIT KKR\after placement\open code\neurohack\frontend"
npm run dev
```
Available at: [http://localhost:3000](http://localhost:3000)

Production Build & Type Check:
```bash
npm run build
npx tsc --noEmit
```

### 2. Backend (FastAPI + PyTorch Engine)

```bash
cd "c:\NIT KKR\after placement\open code\neurohack\backend"
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Available at: [http://localhost:8000](http://localhost:8000) (Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs))
