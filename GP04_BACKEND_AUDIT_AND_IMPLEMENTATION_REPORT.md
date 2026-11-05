# GP-04: Illegal Deforestation Detection — Backend Audit and Implementation Handoff

Prepared 3 November 2026 for Aranya Sentinel. This document proposes future implementation; no application code was changed. It is intended to be given to Antigravity together with the current project.

## 1. Executive assessment

The backend is predominantly a demonstration implementation. There is a genuine conditional Grounding DINO path, but satellite analysis, alerts, incident records, evidence fusion and report content are mostly fixed. The most serious defect is that even successful inference with zero detections becomes invented positive machinery evidence. Rearranging folders alone will not fix this.

Build one verifiable workflow first: real AOI → dated satellite observations → quality-controlled change analysis → persisted disturbance geometry → optional drone/external corroboration → analyst review → reproducible downloadable report. Exclude ice melt, flood products and speculative carbon analytics from the first GP-04 release.

Keep observed change, suspected deforestation, contextual risk and authorization assessment separate. An excavator, probability decrease or protected-area overlap does not by itself establish illegality. This report makes no jurisdiction-specific legal determination.

## 2. Review scope and downloaded references

Reviewed all Python files in backend and inference_service, dependency manifests, inference Dockerfile, README, and selected frontend API integration points. Reviewed selected source implementations in all three reference repositories. This was a static audit, not a complete security audit or scientific validation. Models were not downloaded or benchmarked; authenticated external data access was not tested.

| Reference | Local checkout | Reviewed commit |
|---|---|---|
| Climate-Vision/ClimateVision | references/ClimateVision-source | aab970869e8950374a8620e413e46516fd6fa578 |
| wri/gfw | references/gfw | 5e5c3e94c80bf3fdc5c94d7ef1298b656652031f |
| forestdatapartnership/whisp | references/whisp | 4df3b3156102711abb60ba9123e357ba6f795d73 |

Initial ClimateVision cloning failed writing Git HEAD. The successful source checkout uses separate Git metadata in the OS temporary directory. Clearing that temporary directory can break Git operations for that checkout, but its source remains in the workspace. Additional attempted checkout directories may exist. The workspace root itself is not a Git repository, so a root-level Git diff was unavailable. Reference applications were not installed or executed.

Source repositories: [ClimateVision](https://github.com/Climate-Vision/ClimateVision), [GFW](https://github.com/wri/gfw), [Whisp](https://github.com/forestdatapartnership/whisp). Findings below are grounded in their downloaded source, not just their README claims.

Tooling limitation: Repomix packaging was attempted but npm registry DNS resolution failed. Review therefore used direct file reads and source searches; no Repomix token/file metrics are claimed. A later checkout-status check encountered a local Git LFS helper permission error, so complete LFS asset availability is not verified. The source paths and commits above were successfully read; trained weights are not assumed present. Successful retry downloads also left gfw-source and whisp-source copies under references.

## 3. File-by-file defects and hardcoding

Line numbers are from this review and may move. Function names are stable search anchors. P0 means fix before presenting results as real; P1 means necessary for a credible working backend; P2 means reliability/maintainability work.

| Priority | Location | Actual behavior | Required replacement |
|---|---|---|---|
| P0 | backend/routers/drone.py:157 | `if not detections` inserts three fixed equipment/log detections, including after a legitimate negative model result. | Successful negative inference returns an empty list. Missing model returns unavailable. Never invent positives. |
| P0 | backend/routers/drone.py:146 | Six-point contours are derived arithmetically from bounding boxes; SAM2 never generates them. | Invoke real SAM2 with box prompts, or report segmentation unavailable. |
| P0 | backend/routers/drone.py, analyze_drone_media | Image decode failure creates a blank replacement image; videos use the same image path. | Reject corrupt images and unsupported video. Do not analyze replacement content. |
| P0 | backend/routers/drone.py:85 | Missing GPS/altitude default to 13.5165, 75.0934, 120 m. | Null metadata plus source/accuracy when provided. |
| P0 | backend/routers/evidence.py:19 | Any incident ID receives the same distance, equipment, polygon, correlation and confirmation. | Validate incident, load its evidence, calculate actual relations and expose insufficient evidence. |
| P0 | backend/routers/evidence.py, response | Hashing fixed JSON is described as authenticated PostGIS custody and VERIFIED_GENUINE. | Hash real bytes/manifests and persist custody events; integrity digest is not proof of authenticity. |
| P1 | backend/routers/satellite.py:22 | Region canopy/risk/disturbance counts are literals. | Persist AOIs and derive summaries from actual records. |
| P1 | backend/routers/satellite.py:67 | Dates and region relabel fixed probabilities, indices, cloud values, 14.8 ha and 0.94 score. | Real AOI/date processing with scene IDs and quality metadata. |
| P1 | backend/routers/satellite.py:122 | Handwritten polygons, areas, confidence and causal drivers. | Vectorize real change masks; compute area; keep cause uncertain without evidence. |
| P1 | backend/routers/alerts.py:16 | Three static GLAD-S2/RADD records; no provider calls or coverage checks. | Dataset-aware provider adapter with versions, coverage and freshness. |
| P1 | backend/routers/incidents.py:36 | Five prewritten incidents in an in-memory list with fixed conclusions and investigator names. | Persistent entities; isolate sample fixtures from live records. |
| P1 | backend/routers/incidents.py:162 | PATCH mutates process memory, without durable audit or state transition enforcement. Truthiness checks prevent deliberate clearing of fields. | Transactions, explicit null semantics, authorization and optimistic version checks. |
| P1 | backend/routers/reports.py:24 | Two fixed dossiers described as certified/enforcement material. | Real incident snapshot and evidence-derived content. |
| P1 | backend/routers/reports.py:59 | Any ID creates a report with 12.4 ha and unlicensed machinery; hash covers only incident ID; download handler is absent. | Validate ID, render real artifact, hash bytes, implement authorized download by report ID. |
| P1 | backend/routers/assistant.py:18 | Keyword branches return fixed narratives/confidences; context_incident_id is ignored. | Query actual authorized incident/evidence records; deterministic summaries first. |
| P1 | inference_service/app.py, load_models/root | Only DINO loads, but readiness claims SAM2 resident even after failure. | Per-model state based on successful load and warm-up. |
| P1 | inference_service/app.py, predict_drone | Missing DINO returns invented detections. | MODEL_UNAVAILABLE; no evidence fallback. |
| P1 | backend/routers/drone.py, module globals | Backend loads models itself at import, independently of inference_service. | Backend orchestrates through an internal inference client; inference_service alone owns models. |
| P1 | backend/main.py and inference app | Wildcard origins with credentials; no authorization layer in reviewed routes. | Explicit origins and appropriate access control for private evidence and writes. |
| P2 | backend/main.py, health | Static healthy status/model names do not prove dependencies work. | Separate liveness, readiness and component states. |
| P2 | requirements files | Backend uses optional ML packages it does not declare; broad version floors do not establish SAM2 compatibility. | Remove backend ML ownership and lock a tested inference environment. |
| P2 | inference_service/download_weights.py | Relative ./weights depends on current directory; no pinned model revision. | Explicit artifact root, immutable revision and checksums. |
| P2 | backend/verify_system.py | Prints success without meaningful assertions; green-image fake detections can pass. | Regression tests for real negative/failure behavior and provenance. |

Additional problems: unrestricted whole-file upload reads; blocking ML execution inside async handlers; no durable job queue; second-resolution IDs can collide; device string claims NVIDIA GPU on CPU; segmentation-ready is unconditional; report time labels IST without explicit timezone conversion. Persist UTC-aware times and format at display time.

Not every constant is bad. Model identifiers, API versions, unit conversions and configurable thresholds are legitimate. Observational facts and operational readiness must be computed or explicitly marked as demo.

### Frontend dependency

Inspect frontend/src/lib/api.ts and frontend/src/lib/data.ts during migration. API fallback result construction can hide failures behind sample content, including report metadata. Preserve the visual design, but remove silent live-mode fallback and support pending, unavailable, failed and empty results. A truthful backend alone is insufficient if the client substitutes demo evidence.

## 4. Reference analysis: what to borrow and what to reject

### ClimateVision

Its src/climatevision package separates api, data, models, inference, training, analytics, governance, workers, database and configuration. Borrow those responsibility boundaries, not its complete product scope.

Study these paths:

- api/main.py: request validation, runs/status, report and organization routes. Avoid copying the entire large module.
- data/gee_downloader.py: provider authentication, scene queries, GeoTIFF and metadata; download_tile_for_analysis starts at line 76.
- data/band_mapping.py, preprocessing.py, quality.py: explicit input/quality responsibilities.
- inference/pipeline.py, postprocess.py, batch_processor.py, alert_generator.py: processing separation.
- models/unet.py and siamese.py: model architectures, not verified trained assets.
- governance/calibration.py, model_card.py, audit_logger.py: evaluation/provenance organization.
- tests/test_band_mapping.py, test_pipeline.py and test_auth.py: boundaries worth testing.

Critical caveats from source: inference/pipeline.py:126 `_load_model` falls back to an untrained U-Net. gee_downloader.py falls back to synthetic scenes if credentials or imagery are missing. Its export defaults to 100 m, so copying it while claiming 10 m detection is wrong. It takes a collection median with SCL included; Aranya should mask individual scenes before compositing instead of treating median categorical SCL as a reliable cloud mask. PROJECT_STRUCTURE.md contains stale TODOs despite implementations existing; source takes precedence.

config.yaml describes four-band B04/B03/B02/B08 forest/non-forest segmentation. That does not directly establish temporal loss or illegal activity. A configured checkpoint path is not a downloadable trained model. Exclude ice_melting, flooding, flood-specific SAR and unrelated carbon products. Do not reproduce synthetic or random-weight fallback in live processing.

### GFW

The inspected wri/gfw repository is primarily a Next.js application consuming external services, not all infrastructure that generates global forest alerts. Its organization includes pages, components, layouts, providers, redux, services and utils. Cloning the application does not host the alert-production backend.

Study services/datasets.js, geostore.js, analysis.js, forest-data.js, latest-alert-date.js, and utils request/proxy modules. geostore.js translates remote geometry, area and bounds into application objects; forest-data.js uses dataset/version paths and transforms output for widgets. Borrow provider adapters and metadata handling rather than the whole frontend or arbitrary client SQL construction.

Normalize external data server-side, hide credentials, cache versioned responses and expose your own stable schema. Separate map tiles from analytical alert records. The [Data API landing page](https://data-api.globalforestwatch.org/) was reachable but its rendered documentation was not readable through the text browser. Exact authentication, endpoint paths and dataset identifiers remain implementation-time verification tasks; this report does not invent a working API URL.

### Whisp

Whisp is especially useful for contextual enrichment. Its package separates stats.py, datasets.py, risk.py, data_checks.py, pd_schemas.py, asset_registry.py and parameters/lookup_datasets.csv. The flow is GeoJSON → prepared datasets → zonal statistics → formatted output → explicit risk rules.

Study `whisp_formatted_stats_geojson_to_df` and `whisp_risk`; use signatures from a pinned package revision. risk.py retains unavailable-input metadata, including risk_inputs_unavailable. Preserve it through your API instead of converting missing evidence into low risk.

Wrap Whisp behind providers/whisp.py and run it in background enrichment jobs for AOIs/disturbance polygons. Store raw output plus normalized fields, package/dataset versions where available, thresholds, dates and missing inputs. Its commodity-oriented historical-cutoff logic should not become an automatic Indian enforcement rule. Keep Whisp risk distinct from operational incident priority and analyst authorization assessment.

### Reuse matrix

| Requirement | Reuse | Avoid |
|---|---|---|
| Backend structure | ClimateVision data/inference/model boundaries | Entire multi-hazard platform |
| Satellite acquisition | Provider abstraction and provenance | Synthetic live fallback |
| External alerts | GFW service adapters and dataset/version concepts | Assuming the web repository generates alert data |
| Plot context | Whisp statistics, dataset registry, missing-input metadata | Treating risk as proof of illegality |
| Drone analysis | Existing DINO branch, corrected and isolated | Fake equipment, GPS and SAM2 contours |
| Investigations | Current route vocabulary and UI | In-memory state and prewritten conclusions |

Check source, model and dataset licenses separately before copying or distributing assets. Repository code licensing does not grant rights to every referenced imagery service.

## 5. Proposed target architecture

Create modules only when they gain real responsibilities; avoid empty scaffolding.

```text
backend/
  main.py               # application assembly/lifecycle
  core/                 # settings, auth, logging, errors
  routers/              # current public route groupings
  schemas/              # typed request/response contracts
  services/             # satellite, incidents, fusion, reports, assistant
  providers/            # earth_engine, gfw, whisp, inference_client
  repositories/         # database access
  db/                   # models, sessions, migrations
  jobs/                 # analysis, ingestion, report workers
  geospatial/           # geometry, raster and area operations
  tests/
inference_service/
  app.py                # internal API and lifecycle
  settings.py
  model_registry.py     # pinned artifacts and readiness
  pipelines/            # detection and actual segmentation
  schemas/
  tests/
```

Use a modular FastAPI backend, PostgreSQL/PostGIS, one durable queue/worker mechanism and an artifact store. A persistent local artifact directory is sufficient initially if accessed through a replaceable storage interface. Keep inference_service separate. Do not add Kubernetes, Kafka or a vector database to achieve the first real workflow.

Flow: UI → API → persistent job → satellite/inference worker → artifacts and database results → analyst review/report. Store queued/running/succeeded/failed/cancelled state, attempts, heartbeat, error code and output references. Bound retries and concurrency. Use an idempotency key based on geometry hash, time windows, dataset versions and processing configuration. Restarts must not lose jobs or incident changes.

## 6. Data model and invariants

| Entity | Essential fields |
|---|---|
| AOI | UUID, geometry, CRS, geometry hash, name, source/version, ownership |
| Analysis run | AOI, baseline/recent windows, actual dates, config hash, pipeline version, state, quality |
| Observation | Provider, scene IDs, acquisition times, bands, CRS, resolution, valid coverage |
| Disturbance | Run, geometry, calculated hectares, observation interval, measurements, quality flags |
| External alert | Provider/dataset/version/record ID, geometry, detected/published/ingested dates, native confidence |
| Drone media | Byte hash, object key, capture time, metadata source, GPS accuracy, dimensions, uploader |
| Detection | Media, model revision, prompt, threshold, box convention, score, mask reference |
| Incident | Disturbance reference, priority, review state, assignment, version, timestamps |
| Evidence link | Linked IDs, spatial/temporal relation, method version, exclusions, reviewer |
| Report | Immutable incident snapshot/version, artifact, hash, author, time, review status |
| Audit event | Actor, action, target/version, time, reason, before/after references |

Use UUIDs, foreign keys, UTC timestamps, spatial indexes and provider uniqueness constraints. Exchange GeoJSON as longitude/latitude; define image boxes separately. Store WGS84 geometries but calculate distance/area using geography or an appropriate projected CRS, never raw degrees.

Enforce transitions such as New → UnderReview → ConfirmedDisturbance or Rejected → Closed. Authorization assessment is separate and supports Unknown. Audit changes transactionally; use optimistic locking to prevent silent overwrites. Reports reference frozen snapshots so later edits do not rewrite prior evidence.

## 7. Satellite pipeline specification

1. Accept valid AOI GeoJSON and nonoverlapping baseline/recent windows. Validate coordinate bounds, geometry topology, date order, maximum area and vertex limits. Define inclusive/exclusive date semantics.
2. Initialize Earth Engine with an approved project and credentials outside source. Verify account access/quotas before scheduling work; credentials missing means unavailable, not demo data.
3. Query real harmonized Sentinel-2 surface-reflectance observations. Store scene IDs and acquisition times. Requested dates are not actual clear observation dates.
4. Mask cloud, cirrus, shadows, snow and invalid pixels on each scene using a versioned method. Scene-level cloud percentage alone is insufficient. Measure usable coverage inside the AOI.
5. Align both windows to the same grid/CRS; build comparable composites or select suitable observations. Record resampling and valid-pixel masks. Cloud-only/insufficient coverage returns insufficient_observations.
6. Compute NDVI=(B8-B4)/(B8+B4), NBR=(B8-B12)/(B8+B12), optionally NDMI=(B8-B11)/(B8+B11), handling invalid denominators. Preserve native/effective resolution: resampling SWIR does not manufacture 10 m detail.
7. Query Dynamic World for compatible AOI/windows, retaining probabilities and class semantics. This is a published dataset in this design, not a local model-weight download.
8. Establish a baseline forest mask; identify persistent tree-to-non-tree candidates supported by spectral change. Thresholds are configurable and require local validation. No illustrative threshold should be presented as validated science.
9. Apply an explicit minimum mapping unit and connected-component filtering; preserve raw and processed masks. Calculate affected valid-pixel area, vectorize, clip to AOI and retain holes/multipolygons.
10. Store georeferenced rasters, polygons, preview imagery, statistics and provenance. Use those actual before/after assets in the UI.
11. Add boundary/permit context and optional GFW/Whisp enrichment with source lineage. Keep unavailable context explicit.
12. Create/update a candidate incident and deduplicate repeated observations of the same event.

A tree probability change from 0.88 to 0.39 is a 0.49 probability change, not automatically 49% canopy removal. Compute hectares from a spatial mask and report the valid-observation denominator separately. Seasonal change, agriculture, fire, plantation harvest, cloud shadow and flooding are competing explanations; temporal persistence and comparable seasons help, but uncertainty must remain visible.

Official collection references: [Dynamic World](https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_DYNAMICWORLD_V1), [Sentinel-2 SR Harmonized](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED). Use GOOGLE/DYNAMICWORLD/V1 and COPERNICUS/S2_SR_HARMONIZED. Dynamic World provides nine-class probabilities; Sentinel-2 SR has scaled reflectance and bands with different spatial resolutions. The processing design above is a recommendation, not a provider-certified algorithm.

## 8. Models: acquisition, usage and limits

### First release choices

Start satellite monitoring with the reproducible data-based pipeline above, rather than waiting for a custom neural network. Use DINO for optional drone objects and SAM2 for masks. Neither establishes forest loss or legal authorization.

| Component | Verified official source | Use |
|---|---|---|
| Grounding DINO Tiny | [Model card](https://huggingface.co/IDEA-Research/grounding-dino-tiny) | Text-conditioned RGB object detection |
| SAM2 Hiera Small | [Model card](https://huggingface.co/facebook/sam2-hiera-small) | Image segmentation from box/point prompts |
| Dynamic World | Catalog above | Existing land-cover observations; no local checkpoint required |
| ClimateVision U-Net/Siamese | Downloaded architecture source | Later experiments requiring trained, validated weights |

The two model pages were reachable. No hardware performance or accuracy claim was validated. Do not promise model size, memory needs or inference latency without testing the selected artifacts and image sizes on the intended machine.

### Download and deployment procedure

1. Select immutable Hugging Face revisions, review licenses and record model ID/revision in a manifest.
2. Create an isolated inference environment. Choose compatible Python/PyTorch/Transformers versions from selected model documentation, smoke-test them together, then lock exact versions. The existing transformers lower bound does not establish compatibility.
3. Use huggingface_hub.snapshot_download with repo_id, pinned revision and explicit local_dir. Download required processor/config/weights together, not an arbitrary standalone checkpoint. Never embed tokens in scripts.
4. Use an explicit structure such as inference_service/weights/grounding-dino-tiny/<revision> and sam2-hiera-small/<revision>. Fix the existing downloader's current-working-directory dependency.
5. Record checksums, preprocessing contract, dependency versions and license. Runtime loads pinned local assets rather than mutable latest models on each boot.
6. Warm up models independently; expose actual loading/ready/failed state and device. DINO boxes can remain usable if SAM2 fails, but masks must be unavailable.
7. Test valid image, no target objects, malformed file and missing-weight startup. None may return canned evidence.

DINO execution: decode actual input → correct orientation → process image and prompt → evaluate under inference mode → postprocess to original dimensions → retain actual labels and scores. Use generic labels; do not invent manufacturer, tree species or license status. Save prompt/threshold/model revision. A raw detection score is not probability of illegal logging.

SAM2 execution: convert actual DINO boxes into the pinned processor's expected coordinate format → segment original image → restore original image resolution → retain masks/quality scores → derive contours if required. Do not use geometric decoration as segmentation. Check [official Transformers SAM2 documentation](https://huggingface.co/docs/transformers/model_doc/sam2) against the installed version; do not mix original Meta predictor calls with Transformers APIs without an adapter.

Mask area is pixels, not square metres. Camera GPS is not object GPS. Ground footprints/areas need a georeferenced orthomosaic or defensible camera/pose/terrain projection and uncertainty. Until then represent drone evidence as nearby imagery, not exact surveyed object coordinates.

### Optional learned satellite model later

This review did not establish a verified deployable ClimateVision deforestation checkpoint URL. Its models/unet_deforestation.pth configuration is not a download location. Never serve random initialized weights as real predictions.

Acquire licensed paired imagery and independently reviewed labels for target regions. Decide forest segmentation versus temporal change detection. Split by geography and time to prevent adjacent-tile leakage. Keep band order, scaling, normalization, CRS/grid and nodata treatment identical between training and deployment. Compare a trained U-Net/paired-image model with the simpler baseline before adopting it.

Evaluate pixel precision/recall/IoU, event-level precision/recall, area error, false alerts per region/time period and detection delay. Include unchanged forest, agriculture, seasonal negatives and cloudy scenes. Synthetic data can test software but cannot validate real-world accuracy. Publish a model card with geographic/seasonal limitations.

## 9. External evidence and domain rules

For GFW, verify a dataset covers the actual Indian AOI and date range before choosing it. Do not assume every GLAD/RADD product covers every geography. Store coverage, update cadence, resolution, native confidence definitions, attribution and version. Validate one real authorized request and save a sanitized response fixture. Distinguish zero alerts, outside coverage, stale data, timeout and authentication failure. Deduplicate by provider/dataset/version/source ID.

For Whisp, preserve stable feature IDs, raw outputs and unavailable-input metadata. Run statistics/risk in workers with a pinned package. Its datasets can overlap with GFW or other inputs; avoid treating agreement from the same underlying source as independent corroboration.

Acquire authoritative protected-area and permit data for the chosen jurisdiction with source, license and effective date. A conservation polygon is not a permit registry. Missing permit data remains Unknown. This prerequisite cannot be solved by downloading an AI model.

## 10. Fusion, reports and assistant

Compute geometry overlap/distance with geospatial operations and GPS uncertainty. Compare drone capture time against the satellite observation interval rather than an invented exact clearing time. Store tolerance/rule versions and explanations. Support related, conflicting, insufficient_evidence and analyst_review_required states. Any priority score must be explainable and separate from calibrated probability.

Preserve source bytes, hashes, immutable processing manifests and append-only custody events. A SHA-256 digest detects changes when compared with a trusted reference; it does not prove content is true or establish legal admissibility.

Reports should contain actual AOI, observation dates, imagery, area method, quality, model results, missing evidence, source references, reviewer status and pipeline versions. Generate JSON first, then real PDF artifacts. Download by report ID with authorization; hash the actual bytes. Unknown incident IDs return 404. Do not automatically mark reports certified.

Start the assistant with deterministic database summaries using context_incident_id and cited evidence IDs. If an LLM is later added, limit context to retrieved authorized facts, validate source references and separate read responses from explicit write actions. Missing information must not trigger a scripted story.

Defer carbon estimates until area, biomass source, forest type, units and uncertainty are defensible. Carbon stock at risk is not instantaneous emissions; the fixed regional value in the current assistant must not be generalized.

## 11. Proposed API contracts

| Operation | Proposed behavior |
|---|---|
| POST /api/aois | Validated geometry → persistent AOI ID |
| POST /api/satellite/analyses | AOI + two windows → 202 and job ID |
| GET /api/jobs/{id} | State/progress/error/result references |
| GET /api/satellite/analyses/{id} | Persisted results plus provenance |
| Existing disturbances route | Paginated AOI/run/date filtering |
| Existing drone/detect | Versioned async job contract or coordinated client migration |
| Existing evidence/fuse/{id} | Read persisted/calculated evidence summary; expensive recomputation is a job |
| Existing incident PATCH | Authorized state transition with version check |
| Existing report generation | Validated incident snapshot → job/report ID |
| GET /api/reports/download/{report_id} | Actual artifact with access checks |

Standardize INVALID_GEOMETRY, INVALID_MEDIA, MODEL_UNAVAILABLE, PROVIDER_UNAVAILABLE and INSUFFICIENT_OBSERVATIONS, with request IDs. Missing values are null plus reason, not zero. Include data_mode, source IDs, observed_at, processed_at, pipeline/model version, quality_flags and unavailable_sources.

Demo mode must be explicit and isolated from live incidents and reports. Live processing never automatically switches to demo mode. Successful empty inference and failed inference are different states.

## 12. Phased implementation and acceptance criteria

### Phase 1: Truthful outputs

Remove fake detections, contours, GPS, GPU/readiness claims and silent fallbacks. Inventory frontend callers; preserve design while introducing unavailable/empty/pending states.

Acceptance: a flat green image never gets the three canned objects; missing model reports unavailable; invalid image fails; demo evidence cannot create live reports.

### Phase 2: Persistence and lifecycle

Implement PostGIS migrations, AOIs, runs/jobs, incidents, artifacts and audit events. Separate routers/services/repositories. Add authorization and transition rules. Seed only explicit demo data.

Acceptance: restart preserves records; concurrent edits cannot silently overwrite; unauthorized writes fail; unknown IDs return 404; repeated ingestion does not duplicate records.

### Phase 3: One real satellite comparison

Configure one AOI, provider access, comparable windows, masking, alignment, change mask, area and vectorization. Store exact provenance and inspect results against actual imagery.

Acceptance: cloud-only data does not create loss; known geometric fixture has correct area within documented tolerance; valid unchanged imagery gives no candidate loss; stored source IDs/config reproduce output.

### Phase 4: Isolated real drone inference

Move all ML ownership to inference_service, pin artifacts, implement true masks and upload limits. Keep device accurate and reject unsupported video.

Acceptance: API workers do not load model copies; masks come from SAM2; orientation/coordinates align; negatives stay empty; outage cannot create evidence.

### Phase 5: Context and analyst review

Add coverage-checked GFW, Whisp, boundaries and lineage; implement actual fusion and review.

Acceptance: no coverage differs from no alerts; missing Whisp layers stay visible; unrelated captures cannot confirm incidents; permit status stays Unknown without reviewed evidence.

### Phase 6: Reports and summaries

Implement immutable downloadable reports and database-grounded assistant. Ensure every visible live metric comes from stored results.

Acceptance: different incidents produce their own evidence-derived reports; downloaded hash verifies; old reports remain stable after edits; no seeded narrative masquerades as live analysis.

## 13. Test and operations plan

- Unit tests: geometry validity, coordinate order, area units, transitions, aggregation, provenance and error mapping.
- Raster fixtures: unchanged scene, known cleared rectangle, nodata, cloud-only window, grid mismatch, seasonal change and boundary clipping.
- Model tests: valid empty output, missing model, corrupt/oversized upload, true masks and original-image coordinate alignment.
- Integration: provider timeout/auth failure, durable retry/restart, duplicate ingestion, transaction rollback, report download and access control.
- Provider contracts: sanitized saved responses plus separately marked authenticated live tests; no implicit paid-service calls in CI.
- Scientific evaluation: reviewed local positives/negatives and held-out regions. Choose accuracy targets from real validation, not invented claims.
- Operations: structured logs, request/job IDs, provider latency/freshness, model revisions, queue depth, memory and failures.

Explicitly configure upload byte/pixel limits, AOI limits, timeouts, concurrency, retries, cache expiry and retention. Keep secrets outside source and provide only example settings. Disable debug reload in deployment. Endpoint HTTP 200 is not evidence of scientific correctness.

## 14. Instruction to paste into Antigravity

Use this entire report as the specification. Inspect current API/client contracts and the reference snapshots before implementing. Work through the phases in order, preserving the current visual design and limiting scope to GP-04. Do not copy the entire reference products.

Start by removing fabricated positive outputs and isolating live/demo data. Make every result traceable to inputs and computation. Preserve empty results; report missing weights/data honestly. Add persistence and durable processing before expanding analytics. Keep models in inference_service and external access behind backend providers.

Do not invent credentials, provider endpoints, permit data, checkpoint URLs, coverage, accuracy or legal conclusions. If an external prerequisite is missing, implement a truthful unavailable contract, document the prerequisite and continue independent work. Never substitute plausible evidence.

For each phase provide changed files, behavior changes, migrations, focused tests/results, startup/configuration instructions and verified limitations. Run negative-path checks before claiming the system is operational.

## 15. Completion checklist

- [ ] Real satellite scene IDs and reproducible configuration accompany every result.
- [ ] Every live detection comes from actual inference; masks are real segmentation.
- [ ] Missing input/model/provider never becomes positive evidence.
- [ ] Persistent incidents and audit history survive restart.
- [ ] GFW coverage/version and Whisp unavailable inputs are explicit.
- [ ] Areas/distances have valid spatial units and methods.
- [ ] Reports are real immutable downloads tied to source evidence.
- [ ] Assistant and frontend do not substitute demo narratives for live failures.
- [ ] Negative/no-data cases and held-out local examples are tested.

The first credible milestone is one real AOI, one reproducible comparison, an honest candidate incident and a downloadable evidence report. Expand after that path works.
