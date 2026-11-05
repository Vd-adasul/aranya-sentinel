# Aranya Sentinel — comprehensive frontend redesign blueprint

Prepared 3 November 2026. Recommendations and implementation instructions only. This document does not implement the redesign or contain application code.

## 1. Purpose and boundaries

Redesign the entire frontend as a **living field atlas**: a distinctive forest-intelligence workspace that moves from regional awareness to specific evidence and accountable action. Keep Aranya Sentinel, all eleven routes, domain entities, useful content, API integrations, field names, callbacks, and query-based navigation. Replace fragmented composition and styling without silently changing the product's behavior.

The intended signature is a grounded terrain evidence plate: a geographical boundary connected directly to the record being investigated. Spatial exploration may feel immersive; investigation, administration, and report reading must remain calm and exact. 3D and animation are purposeful enhancements, not substitutes for missing data.

Assumed audiences, inferred from the code: forest monitoring analysts, incident reviewers, administrators, and citizens submitting observations. Primary operational outcome: identify an incident, inspect its evidence, record a review, and produce the corresponding report. Public outcome: understand approved information and submit an observation with an honest result.

### Review limitations

- Reviewed the source inventory, package manifest, styling configuration, shared state/API/types, shell, specialist components, route source, and existing redesign specification. Large combined reads were sometimes truncated; targeted reads and searches established the findings cited below. This is not an exhaustive executable-code audit.
- The app was not rendered, the backend was not exercised, and browser performance/accessibility were not measured. Recommendations are source-informed; no visual-test or compliance pass is claimed.
- No workspace AGENTS.md was found. Git reported that this directory is not a repository; no clean-diff claim is made.
- Impeccable context loading failed because its engine/cache was unavailable. Existing project context was read directly.
- Only this new Markdown file is the deliverable. Do not modify application code, dependencies, the existing specification, or archives during this documentation task.

### Requested skill application

**Hallmark:** preserve content and wiring; give the product one recognizable visual signature; centralize color/font tokens; use immediate focus, reduced-motion equivalents, and truthful material. Remove decorative status dots, tracked capital labels, isolated italic heading fragments, nested decorative cards, and generic gradients. Apply app-screen rules to operational routes rather than marketing hero rules.

**Impeccable:** distinguish Persuade, Operate, Read, and Experience. Home introduces; maps and investigation tools operate; dossiers support reading; public reporting combines reading and operation. This document proposes a direction, not a confirmed design contract or completed build.

**UI/UX Pro Max:** the local design-system query “forest monitoring geospatial dashboard” returned Real-Time / Operations Landing, with glassmorphism and technical typography. Adopt its truthful freshness states, offscreen suspension, keyboard controls, and static reduced-motion advice. Reject its generic dark-blue palette and broad glass treatment in favor of this project's established canopy/paper identity. A Next.js query returned layout-reservation and bundle-analysis guidance; its version-labelled examples target a newer Next.js than this repository, so future implementation must verify compatibility rather than copy those examples. No generated design system was persisted.

### Existing specification

`Aranya_Sentinel_Visual_Redesign_Specification.md` already establishes a field-atlas direction, which the code partially implements. Extend it rather than pretending the project has no design history. Keep its forest palette, geography-led material, and evidence focus. Resolve conflicts with the requested Hallmark guidance: replace uppercase eyebrows and mixed italic heading fragments; reserve monospace for actual identifiers; prefer native scrolling and one motion owner over stacking every optional effect library. Its historical source observations are not automatically current facts.

## 2. Code walkthrough

### Technology and application entry

`package.json` declares Next.js 14.2, React 18.3, TypeScript 5, Tailwind 3.4, Leaflet, Lucide React, and jsPDF. Manifest ranges are not a verified installed-version inventory. Three.js, React Three Fiber, GSAP, and Motion are not declared dependencies. DroneCanvas is currently a 2D canvas, not a 3D scene.

`src/app/layout.tsx` owns metadata, global CSS, external Leaflet CSS, Google-hosted Instrument Serif/Manrope/IBM Plex Mono, and AppProvider. Geist font files exist locally, but the current layout uses external font links. `src/app/globals.css` defines canopy/paper colors, typography roles, geometry, focus treatment, and component classes. `tailwind.config.ts` repeats many literal values instead of consuming one canonical token authority.

`src/components/layout/AppShell.tsx` combines Navbar, Sidebar, a scrolling main region, skip link, and CopilotDrawer. Its desktop shell uses viewport-height behavior. The home route composes its own landing shell. Preserve this useful distinction while standardizing shared chrome.

### State and request flow

1. `AppProvider` initializes monitoring regions and incidents from `src/lib/data.ts`.
2. Shared context stores selected region, incident records, sidebar/copilot visibility, backend health, and derived alert count.
3. Mounting triggers backend health and incident refresh.
4. `src/lib/api.ts` uses NEXT_PUBLIC_API_URL, defaulting to a localhost service. Several operations catch failures and return fixtures or mutate in-memory caches.
5. Routes own local view state: filters, selected records, comparison position, open panels, and draft forms.
6. Map/canvas components receive data and selection props and report interaction through callbacks.
7. Incident edits, reports, and assistant requests use dedicated API functions.

Keep this flow understandable. Do not duplicate the incident source of truth inside a 3D scene or maintain unrelated copies on every route.

### File responsibility map

| File | Responsibility | Redesign consequence |
| --- | --- | --- |
| src/lib/types.ts | Region, Incident, DisturbancePolygon, BoundingBox, detection, fusion, report, chat contracts | Preserve identity, units, coordinate conventions; review additions explicitly |
| src/lib/data.ts | Initial regions, incidents, disturbances, reports | Keep demonstration data identifiable |
| src/lib/api.ts | Health, incident, satellite, drone, fusion, report, assistant calls and fallbacks | Expose source mode and mutation outcome |
| src/lib/store.tsx | Shared application state | Coordinate region, selection, and data health |
| components/layout/Navbar.tsx | Global header/context | Clarify region and connection state |
| components/layout/Sidebar.tsx | Grouped destinations | Preserve routes, improve labels and active state |
| components/ui/PageHeader.tsx | Heading composition | Remove decorative eyebrow/mixed-accent conventions |
| components/ui/StatusBadge.tsx | Status presentation | Separate severity from workflow state |
| components/ui/EmptyState.tsx | Missing-content presentation | Distinguish empty, filtered, failed, and unavailable |
| components/map/SentinelMap.tsx | Leaflet map, tiles, overlays | Keep dependable 2D view and attribution |
| components/satellite/SwipeComparison.tsx | Band choice, comparison wipe, candidate state | Add honest source and persistence states |
| components/drone/DroneCanvas.tsx | Drawing, masks, boxes, threshold, upload analysis | Align overlays to real media and provide list alternatives |
| components/assistant/CopilotDrawer.tsx | Chat and incident references | Preserve context, improve focus and recovery |
| app/error.tsx / app/not-found.tsx | Recovery surfaces | Match shell and offer meaningful next steps |

### Route inventory

| Route | Existing purpose | Proposed arrangement | Mode |
| --- | --- | --- | --- |
| / | Product introduction | Editorial opening and terrain evidence plate | Persuade |
| /command | Situation summary and incident selection | Queue, spatial overview, contextual inspector | Operate |
| /map | Geographical inspection | Map-first workbench with collapsible tools | Operate |
| /satellite | Dual-date comparison and indices | Image comparison first, interpretation below | Operate |
| /drone | Detection review | Media viewer, control rail, detection ledger | Operate |
| /incidents | Search/filter/triage | Readable ledger and contextual editor | Operate |
| /verification | Evidence fusion | Source panes, comparison, review decision | Operate |
| /analytics | Disturbance/carbon summaries | Trend-led analysis and visible methodology | Read/Operate |
| /reports | Dossier generation/export | Library and document preview | Read/Operate |
| /public | Transparency and citizen reporting | Plain-language explanation and focused form | Read/Operate |
| /admin | Configuration | Grouped settings with explicit persistence | Operate |

## 3. Source-grounded priorities

### P0 — truthful outcomes

`api.ts` can return sample data or local-cache mutations after failures. The visual interface needs a provenance contract: server/sample/cached/local, last successful update, freshness, and persistence outcome. This is a future data-contract change, not merely CSS.

`store.tsx` catches update failures without propagating an explicit result; `incidents/page.tsx` awaits that action and then shows success. Return a real outcome in future implementation and retain the editor on failure.

`SwipeComparison.handleGenerate` advances to committed on a timer; `satellite/page.tsx` announces ledger commitment. Until a real persisted response exists, use “Demo boundary prepared”. `admin/page.tsx` similarly times save/test success. `public/page.tsx` produces a random local receipt after a timeout. `verification/page.tsx` stores the officer signature in local state. None alone proves a durable transaction.

Verification/report pages include authentication and admissibility claims. Hash presence, hash verification, custody, signature, and legal acceptance are different things. Preserve factual source material for owner review, but tie status copy to verifiable events. This document does not validate legal claims. Likewise, public zero-log anonymity claims need a verified service/privacy basis; frontend design cannot establish them.

### P1 — visual consistency

Root CSS and Tailwind duplicate values while routes retain legacy utility names such as text-muted, text-danger, and bg-paper-2. Audit emitted utilities before declaring any individual class broken; migrate through a documented alias bridge. Avoid adding a third vocabulary.

Several operational pages apply text-xs at their content root. Increase reading size, not only headline size. Home mixes an italic serif fragment with roman type, uppercase tracked labels, and decorative status dots. Replace these conventions with one clear headline voice and plain labels.

Home/satellite use gradient-based spatial placeholders; DroneCanvas draws a simulated aerial background. Label these as demonstrations until real media exists. More realistic rendering must not disguise invented evidence.

Container caps vary across 1300, 1400, 1480, and 1600px. Consolidate around a shared workspace measure with deliberate map/document exceptions.

### P1 — identity and scope

`map/page.tsx` changes timeWindow state without passing it to the visible map invocation. Implement actual filtering or clearly disable unsupported filtering. Command/verification may substitute the first incident when selection is missing; an unknown ID must instead show a missing-case state.

Copilot produces incident query links; the incident page's visible state setup does not consume them. Verify and implement deep-link selection explicitly. Region scope, incident jurisdiction, and disturbance region are not interchangeable; define a common scope contract before presenting regional totals.

`types.ts` documents incident/region positions as latitude-longitude and disturbance geometry as longitude-latitude. Centralize conversions and test known points before introducing another renderer.

## 4. Visual direction and design system

### Material and hierarchy

Use warm paper for thinking, dark cartography for spatial inspection, and restrained signal color for attention. Replace repeated card grids with broad reading surfaces, fine rules, and intentional asymmetric workspaces. Depth belongs to terrain, drawers, and spatial explanations. Avoid universal translucency, glowing panels, neon radar motifs, and ornamental shields.

The signature object is a boundary on a grounded terrain tile linked to actual evidence. Important information must also exist outside the canvas. Operational pages are tools, not landing pages with oversized heroes.

### Palette

These starting values derive from current source and require contrast measurement before shipping.

| Token role | Starting value | Use |
| --- | --- | --- |
| Canvas | #F4F1E7 | Main background |
| Reading surface | #FFFEF8 | Forms, tables, documents |
| Primary ink | #202923 | Body/headings |
| Secondary ink | #59645C | Supporting text |
| Canopy | #183C2D | Primary action and spatial backdrop |
| Canopy interaction | #28513D | Hover/pressed context |
| Moss | #52765C | Healthy/verified with explicit labels |
| Quiet selection | #E6EDE3 | Selected row/tab |
| Boundary signal | #C96C3D | Selected geographical geometry |
| Critical | #B94236 | Critical risk only |
| Water | #587B8B | Hydrology semantics |
| Divider | #DDD6C4 | Rules; strengthen interactive boundaries |

Declare primitive values once, semantic roles second, component aliases last. Tailwind, SVG, Leaflet, canvas, and future WebGL materials derive from the same authority. Canvas adapters may resolve token values; do not scatter copied hex values through drawing functions. Measure focus contrast against both imagery and paper. Do not assume white text on orange is accessible.

### Type, spacing, geometry

- Manrope for interface and operational headings. Default reading size 16px, approximately 1.5 line height. Dense table cells may use 14px after checking legibility; important narrative stays 16px.
- Instrument Serif for complete editorial home/public headings, upright. Never splice an italic phrase into another heading face.
- IBM Plex Mono only for hashes, coordinates, and machine identifiers. Ordinary counts use tabular numerals in the UI face.
- Operational heading 28–32px desktop and 24–28px mobile; section heading 18–20px. Home heading 48–64px desktop and 36–42px mobile, verified against real wraps.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px. Main padding 24–32px desktop and 16px mobile. Rows approximately 52–60px, expanding for real content.
- Workspace content cap approximately 1440px inside the available main region. Reading measures approximately 65–75 characters. Map canvas may use the available area. Wide screens grow gutters rather than paragraphs.
- Radius: 8px controls, 12px panels, 16px spatial plate. Pills only for compact tags. Dividers replace decorative nested cards.
- Lucide icons 18–20px for controls with a consistent stroke. Icons supplement labels. No emoji icons or meaningless blinking dots.

## 5. Shared shell

Desktop starting geometry: 64px header and approximately 232px navigation rail. Brand left, region context centrally, connection/copilot controls right. Long region names truncate visually with an accessible full name. Selected incident IDs remain readable.

Use sentence-case groups: Operations, Sensors, Review, Workspace. Preserve destinations. Active links have a quiet surface and a structural indicator. Count labels reflect their actual filters: critical-only is not the same as critical-or-new-or-escalated.

Collapse navigation when it squeezes the task. Use an accessible drawer on mobile, closing after navigation and restoring focus when dismissed. Do not create inconsistent alternate navigation trees. Preserve one dominant scroll region; map inspectors may scroll internally, while long documents should read naturally. Account for mobile safe areas and browser chrome.

Region changes retain previous content with an updating label until replacement is ready. Reject stale responses. If selection belongs to another region, explicitly reset or explain the transition rather than relabelling old evidence.

Connection states: checking, connected, stale, offline with cache, demo, unavailable. Backend health does not establish every service's availability. Detailed diagnostics belong in administration; the current task needs its practical limitation.

## 6. Detailed route redesigns

### 6.1 Home — /

**Task:** understand the product and enter monitoring. Primary action: Open command centre. Secondary: Explore map.

Use a 5/7 opening split with concise text and a larger terrain evidence plate. At 1280 × 800 the headline, one sentence, and actions fit without scrolling. Proposed copy: “See change. Follow the evidence.” Supporting sentence: “Inspect forest change, compare observations, and review incidents in one workspace.” Treat this as draft copy, not an added capability claim.

The plate shows a named region, actual or clearly sample boundary, source, and observation date. Without real elevation/media use a labelled schematic study. Keep key facts in HTML outside the scene. No fake browser frame.

Below: a concise observation-to-review sequence using satellite, drone, verification, and report surfaces; then region navigation and provenance explanation. Avoid identical feature-card walls. Move example-case links below the primary actions without dropping them.

Motion: one restrained plate entrance, then explicit user interaction. No endless globe spin, number count-up, cursor trail, or fake scanning feed. Mobile loads a static plate first.

Accept when actions remain obvious, examples are labelled, scene failure preserves content, and existing destinations work.

### 6.2 Command — /command

**Task:** determine what needs attention and begin investigation.

Replace oversized metric cards with a compact summary band. Where width allows: approximately 30% queue, 45% map, 25% inspector. At narrower widths use two usable panes instead of squeezing three.

Queue rows show severity, title, incident ID, observation time, jurisdiction, and workflow status. Critical describes severity; escalated describes process. Selection synchronizes row, boundary, and inspector. Preserve selection during updates and avoid reordering a row while its case is being edited.

Inspector order: identity, immediate concern, location/time, evidence availability, assignment/status, next action. Review evidence must target the selected ID rather than a default case. Empty regional results differ from request failure.

Summary numbers need scope, units, and source. A static batch must not be called real-time. Use update timestamps. Selected-row feedback is immediate; inspector content may crossfade for 120–160ms. Map recentering is restrained and optional, with immediate positioning under reduced motion.

Accept when identity matches everywhere, region changes cannot mislabel a case, failed updates do not show success, and the queue is keyboard-operable.

### 6.3 GIS map — /map

**Task:** inspect disturbance geography and context.

Keep Leaflet as the reliable 2D default. Compact top toolbar for region/time, collapsible layer panel, right inspector, protected attribution and scale region. Avoid overlapping clusters of floating cards.

Layers receive explicit names, checkboxes, legend samples, and honestly computed counts. Distinguish tile failure, overlay failure, empty results, and missing coordinates. Preserve basemap attribution.

Time windows filter a defined timestamp field. Selection remains when in range; otherwise explain its disappearance. Selected geometry uses a stronger outline and quiet fill. Additional semantic states need patterns/text as well as color.

Inspector: ID, region, area, observation date, change type, before/after probability, confidence, source, related incident. Explain probabilities as model outputs rather than proof of an offence.

Phone: map above an expandable details sheet; layer and time controls open compact dialogs. Prevent sheet drags from panning the map. Provide a selectable feature list, zoom/reset buttons, and text location summary.

Terrain view is an optional explicit mode. Preserve selected ID and approximate extent when switching; always return to 2D. Accept when filters affect data, list/map agree, attribution is visible, and dragging is not required.

### 6.4 Satellite — /satellite

**Task:** compare observations and prepare a candidate boundary.

Lead with imagery. Above: region, dates, sensor, band choice, source state. Below: concise indices, interpretation, candidate action. Reduce competing status chips.

Images must share extent, projection, crop, and dimensions. Dates/cloud cover/resolution come from metadata; absent values say “Not supplied”. Misregistered images cannot be disguised by a polished wipe animation.

The handle has a large target, visible focus, keyboard adjustment, and numeric position control. Offer side-by-side mode. Preserve split position when changing bands. During drag there is no easing lag or arbitrary snap-back.

Before/after labels remain attached to their images. Explain NDVI/NBR/NDMI briefly. Values must reflect the selected observations instead of staying fixed across regions.

Flow: idle → preparing → preview ready → saving → saved, with failure and demo branches. Preview geometry and area before persistence. A timer cannot establish commitment.

Accept when keyboard comparison works, failed imagery has a source-specific message, and the candidate belongs to the chosen observations.

### 6.5 Drone — /drone

**Task:** inspect media and review detections.

Use a large media viewer, compact controls, and detection ledger. Upload dominates the empty state. Once populated, filename, metadata, and Replace media are secondary. Actual pixels lead the composition.

Validate files against real service limits. Preserve original dimensions and normalized coordinates. Letterboxing, resize, zoom, and device pixel ratio must not displace boxes.

Controls: prompt, confidence threshold with numeric value, boxes, masks, run/retry. Retain input on failure. Decide default/demo analysis behavior explicitly instead of making mounting imply a future expensive inference request.

Detection rows show class, confidence, ID, and selection. Hover, focus, and click all reveal the same feature. Prevent label collisions. Confidence is a model output, not certainty.

States: no file, preview, uploading, processing, results, no detections, invalid media, partial metadata, service failure, sample results. No invented progress percentage; use a quiet indeterminate indicator outside the image.

Keep this viewer 2D. One photograph does not supply a reconstructed 3D scene. Accept when overlays remain aligned and every canvas detection has a keyboard-accessible list equivalent.

### 6.6 Incidents — /incidents

**Task:** find a case and save a considered triage decision.

Ledger columns: title/ID, severity, status, jurisdiction, detected date, area, assignee, action. Let titles wrap. Search and filters sit directly above; sorting is explicit and announced. Preserve shareable filter/selection URL state where feasible.

Open a contextual editor; mobile uses a full-screen presentation while preserving routing. Populate status, analyst, and notes from the record. Warn about unsaved edits before dismissal.

Save states: validate, submitting, confirmed, local-only, error. Prevent duplicate submission. Do not close on an arbitrary timer. Failed save retains notes and focus. If rejection requires a reason, enforce it in both UI and service contract.

Unknown query ID shows missing-case recovery, never another incident. No filter matches offers Clear filters; no cases uses a distinct empty state. Row actions remain separately focusable.

Accept when copilot links select the correct case, failed saves preserve input, and long content does not break the ledger.

### 6.7 Verification — /verification

**Task:** assess whether evidence supports the selected incident and record review.

Begin with identity and source completeness. Present satellite and drone evidence side by side, with shared location/time comparison below. Do not lead with unconditional celebratory validation.

Each pane has real media or explicit unavailable state, acquisition time, source, relevant resolution/altitude, and observations. Compute temporal/distance comparisons from supplied data or show unavailable. Hardcoded summaries must not follow unrelated cases.

Separate model corroboration from officer decision. Represent missing, contradictory, failed, and incomplete-custody evidence. Explain score meaning rather than presenting it as a verdict.

Integrity area: algorithm, full accessible digest, copy feedback, source record, and verified result only when a check occurred. Signature needs authentication and persistence; otherwise label a local demonstration. Pass incident ID to reports.

Optional layer-separation diagram may explain alignment, but readable source panes remain default. Accept when missing IDs never silently substitute another case and claims reflect actual outcomes.

### 6.8 Analytics — /analytics

**Task:** understand disturbance scale, trends, and estimation limits.

Sequence: summary, trend, region comparison, methodology. One visible scope bar establishes date/region. Use a readable time series, ranked horizontal bars, and plain assumption table; no 3D charts.

The monthly series is hardcoded in current source. Mark it sample until integrated. Carbon/CO2 values are calculated estimates from area and constants, not observed emissions. Expose assumptions without claiming this design review validated the science.

Every chart needs units, readable axes, provenance, time range, missing-data behavior, keyboard-accessible values, and a table alternative. Missing is not zero. Do not imply common denominators where scope differs. Keep rounding consistent.

Use short opacity refreshes rather than counting values upward. Accept when chart totals reconcile and methodology is reachable from estimates.

### 6.9 Reports — /reports

**Task:** generate, inspect, and export the correct incident's dossier.

Report list left, document preview right. Separate generation controls from download. Treat the preview as a reading document, not another dashboard card.

Order: identity/status, source summary, incident details, observations, evidence references, review history, integrity, owner-approved notices. Wrap hashes independently, repeat table headings across pages, avoid orphan headings and clipped captions.

Distinguish server-generated and local/demo reports. A downloaded file does not prove certification. Show version, date, source mode. If generation fails, retain the previous preview with an explicit previous-version label.

Review the export implementation separately: reports/page.tsx includes its own document/font markup. Unify preview and export identity. Keep generation independent of WebGL. Missing evidence assets require explicit notes.

Accept when case ID matches list, preview, filename, and export; long output is readable; failures allow retry; sample status carries into output when appropriate.

### 6.10 Public — /public

**Task:** understand approved information and report an observation.

Use plain-language explanation and one focused form. Preserve the route; any separate public shell is a future structural proposal requiring a file-level plan rather than silent navigation removal.

Published counters need approved source and scope. Existing report-count and dispatch-rate copy is source material, not validated proof. Do not invent replacement metrics; mark demonstrations or seek owner validation before production presentation.

Form sequence: reserve/location, observation type, description, location details, review, submit. Preserve existing fields. Attachments/contact/tracking are optional backlog features, not assumed capabilities. Avoid prefilled coordinates that could be submitted accidentally as the citizen's location.

Success needs server acknowledgment and a usable receipt. Current random local receipts must say demo. Preserve content on error, prevent duplicates, and explain receipt use only if tracking exists. Avoid unsupported anonymity guarantees and exposing internal case detail.

Motion remains minimal. Accept when failed submissions cannot look successful and labels remain understandable without placeholders.

### 6.11 Administration — /admin

**Task:** understand and change supported configuration.

Group inference, data connections, observation integrations, notifications. Show service-specific state, last test, and storage scope. Keep diagnostics secondary but readable.

Use masked/blank credential controls with explicit Replace behavior; do not prefill production-looking sample secrets. Never echo credentials in toasts/logs/copilot. Server configuration remains server-owned; UI styling is not access control.

States: unchanged, dirty, validating, saving, saved, failed, unavailable. Test connection and Save are distinct. Unsupported operations are unavailable or demo-only. Timer feedback must not imply delivery or synchronization.

Field errors remain near inputs; retain recoverable edits. Warn on dirty navigation. Accept when save/test failures differ and reload behavior matches actual persistence.

## 7. Shared interaction specifications

### Controls

One primary button style, quieter secondary treatment, destructive styling only for actual destructive actions. Minimum target 44 × 44px with adequate separation. Define default, hover, focus-visible, pressed, disabled, loading, success, and error. Focus is immediate. Loading preserves geometry and a readable label. Explain unavailable actions somewhere accessible, not only through a disabled tooltip.

Every input has a persistent label, help/error association, and useful validation timing. Provide an error summary on submission and focus a sensible correction point. Preserve user input on recoverable errors. Tabs and filters need semantics matching their behavior; active is not the same as hover.

### Drawers and copilot

Modal surfaces need a title, sensible initial focus, Escape, background interaction suppression, and focus restoration. Trap focus only when modal. Copilot and incident inspector must not compete for narrow space; switch explicitly or use one full-screen overlay.

Show copilot context: region and optional incident. Preserve conversation across temporary closure where appropriate. Distinguish sending, response, error, and offline/sample response. Reference links select the exact record. Suggested mutation actions require their own review flow. Do not claim streaming if the API returns a complete response.

### Feedback and empty states

Use persistent inline messages for task failures, restrained notices for confirmation, and a global mode banner when needed. Success cannot rely only on an expiring toast. Avoid repeated screen-reader announcements.

Differentiate first-use empty, no matches, no detections, permissions unavailable, missing source, and failed load. Each has a specific next step. Skeletons reserve actual layout; they are not fictional charts. Avoid prolonged large shimmering surfaces.

## 8. Complete 3D direction

### Priorities and architecture

Priority 1: home terrain plate. Priority 2: optional map terrain. Priority 3: optional verification alignment diagram. No 3D tables, settings, form controls, or analytical charts. Core workflows ship before WebGL enhancement.

Future implementation may evaluate Three.js and a React-compatible integration, checking actual Next.js/React compatibility first. This documentation task installs nothing. Keep the scene module isolated, dynamically loaded, and independent from incident state ownership. Do not add competing render frameworks.

### Scene construction

- One bounded terrain tile, not a generic Earth globe. Real boundary geometry and evidence locations define composition.
- Orthographic or restrained perspective camera, starting around 35–45 degrees oblique. Preserve readable boundaries and a clear north/context cue.
- Matte canopy material, warm paper edge, soft key light, restrained fill. No chrome, bloom, neon tubes, or mirror reflections.
- Real relief requires elevation provenance, extent, and resolution. Missing elevation produces a labelled flat/schematic plate, not random mountains presented as geography.
- Record vertical exaggeration. Compute area/distance from geographic source coordinates, never exaggerated geometry.
- Imagery requires correct alignment and permission. Keep acquisition date visible. Never generate synthetic destruction as evidence.
- Prevent z-fighting with a restrained geometry offset. Selected boundaries get a clean outline, not glow.
- Prefer HTML labels projected from anchors. Priority: selected incident, selected boundary, essential context. Hide overlapping low-priority labels, never the only selected identity.
- Optional pointer parallax is only 2–3 degrees, disabled for touch/reduced motion, and never moves text or buttons.

### Interaction

Default scene is composed and still. Offer Rotate, Zoom, Reset view, and 2D view controls. Dragging is optional. Do not capture page scrolling before explicit scene engagement. Constrain orbit so users do not accidentally inspect the underside and lose orientation.

Selection uses the same record ID as the application. Camera movement does not change data selection. Preserve manual camera position during ordinary refresh. Provide an HTML feature list and text summary of region, selected feature, area, date, and source mode.

For verification, optional separated source planes explain alignment. Label spacing as diagrammatic rather than altitude unless measured. One action toggles aligned/separated; reduced motion swaps final states directly. Never invent drone trajectories; the reviewed contracts do not establish recorded flight-path data.

### Fallback and rendering lifecycle

1. Render semantic text and a poster with reserved dimensions first.
2. Load interactive scene near visibility or after activation.
3. Replace poster without layout shift when ready.
4. On load failure, retain poster with “Interactive terrain unavailable”.
5. On context loss, return to poster/2D while retaining selected ID.
6. Suspend hidden/offscreen work; dispose textures, geometry, listeners, observers, and animation frames on teardown.

Proposed starting budgets, not achieved measurements: one active canvas per workspace; no WebGL entry cost on ordinary reports/admin routes; pixel ratio capped around 1.5 on constrained devices; texture sizes matched to displayed detail; initial scene transfer target around 1.5 MB compressed or less. Prefer on-demand frames for still scenes. Degrade visual quality before input responsiveness.

## 9. Motion choreography

Motion explains relationships and never delays a case selection, input, or response. Native scrolling remains standard.

| Event | Timing | Treatment | Reduced motion |
| --- | --- | --- | --- |
| Focus | Immediate | Clear ring | Same |
| Button press | 80–120ms | Tiny transform or immediate tone | Immediate tone |
| Hover | 120–160ms | Restrained opacity emphasis | Immediate |
| Drawer enter | 200–240ms | Translate/opacity | Immediate open |
| Drawer exit | 140–180ms | Shorter reverse | Immediate close |
| Inspector content | 120–160ms | Opacity after identity selection | Immediate |
| Home plate entrance | 450–600ms once | Small translation/opacity | Final pose |
| Camera reset | 350–500ms | Controlled movement | Final position |
| Layer visibility | 120–180ms | Opacity | Immediate |
| Wipe drag | Direct | No easing lag | Same |
| Chart refresh | 120–180ms | Opacity, stable meaningful axes | Final values |
| Success | Immediate, optional 160ms icon | Clear text first | Same text |

Use decisive ease-out entrances and shorter exits. Avoid bouncing in evidence/admin flows. Interrupted transitions resume from current state, not queued obsolete animations. Clean up pending work on navigation.

Decorative DOM animation uses transform/opacity only, never width/height/top/left or transition-all. User-driven image clipping is a functional viewer interaction; optimize and measure its paint cost separately. Do not replay entrances on filters or count numbers through fictional intermediate values.

All meaningful content is visible without reveal callbacks. Continuing motion needs pause where appropriate, hidden/offscreen suspension, and reduced-motion behavior from first render. Sound is absent by default. Use CSS for simple transitions; add a presence library only when justified. Scroll libraries are unnecessary for the operational shell.

## 10. Responsive and accessibility details

At 320–390px use one content column, readable labels, suitable full-width form actions, and separated map controls. At 768px use two panes only when both remain usable. At 1024px test the compressed shell rather than assuming three columns fit. At 1280–1440px show the intended operating layout. At 1920px grow gutters and canvas area, not reading line length.

Test 200% zoom and enlarged text. Dialogs scroll, sticky chrome does not cover focus, and controls remain reachable. Breakpoints respond to content. Wide tables may have a deliberately labelled internal scrolling area; the whole page must not overflow accidentally. Mobile ledger summaries preserve essential fields/actions.

Use semantic headings/landmarks, skip link, visible labels, keyboard navigation, focus restoration, and text/icon/shape redundancy. Measure ordinary text contrast to at least 4.5:1 and applicable large-text/control/graphical contrast to 3:1. These are acceptance goals, not current compliance claims.

Tooltips work on focus and dismiss. Icon-only controls have names. Route changes identify the new page. Announce meaningful updates, not every pointer frame. Critical tasks cannot require hover or dragging. Charts/canvas have equivalent readable data and selectable lists. Important values remain copyable.

Stress-test long reserve names, long titles, large counts, negative deltas, unavailable percentages, zero detections, empty arrays, missing timestamps, invalid coordinates, unknown severity, long notes, and full hashes. Never display undefined, NaN, or a fabricated zero. Dates have timezone context where relevant. Format hectares, metres, square kilometres, and percentages consistently; source precision determines displayed precision.

## 11. Backend and data dependencies

| Requirement | Real dependency | Honest interim presentation |
| --- | --- | --- |
| Candidate saved | Persisted geometry response | Demo preview prepared |
| Incident saved | Explicit mutation result | Local-only or failed save |
| Officer signature | Authentication and audit persistence | Review demonstration |
| Citizen receipt | Submission acknowledgment | Demo receipt, not submitted |
| Admin test/save | Service/configuration endpoints | Preview or unavailable |
| Regional time totals | Shared filtering semantics | Clearly scoped samples |
| Satellite comparison | Registered imagery/metadata | Labelled sample viewer |
| Drone evidence | Uploaded pixels and aligned detections | Demonstration result |
| Terrain relief | Elevation source/attribution | Flat schematic |
| Integrity verified | Actual digest comparison/custody | Digest supplied, unchecked |

Source mode is independent of severity. A critical sample is still sample data. Do not silently turn authorization, validation, or server errors into successful local writes. Cached reading may remain available with a stale label. Prevent older requests from overwriting new context. Scope caches appropriately. Do not send credentials or unrelated private incident data into copilot context.

## 12. Asset requirements

Inventory each asset's owner, license, geographical extent, acquisition date, resolution, transformations, and destination route. Required production materials: elevation for real terrain, registered satellite pairs, permitted drone media, and static scene fallback posters. The reviewed tree does not establish that those assets are supplied.

Use labelled demonstrations until assets exist. Abstract contour texture can decorate non-evidence areas; it must not masquerade as measured geography. Do not use random scraped imagery or synthetic evidence.

Evaluate licensed self-hosted fonts to reduce runtime dependency and layout drift. Preserve fallback metrics. Review Leaflet CSS delivery without assuming CDN availability. Keep basemap attribution. Export preparation checks image resolution, font availability, line wrapping, page breaks, and reading order where supported.

## 13. File-level implementation sequence

These are future edits, not changes performed by this document.

1. Capture all routes and controls at desktop/mobile sizes. Record backend/demo state, hrefs, fields, IDs, callbacks, query parameters, and current behavior.
2. Consolidate globals.css and tailwind.config.ts into one token authority with temporary aliases. Review layout.tsx font delivery. Preserve working focus/overflow protections.
3. Refine AppShell, Navbar, Sidebar, PageHeader, StatusBadge, EmptyState, and CopilotDrawer. Establish shell geometry, readable type, dialog behavior, and source-state presentation.
4. Review types.ts/api.ts/store.tsx provenance and mutation-result changes with backend owners. Keep behavior work explicit rather than hiding it in styling.
5. Redesign command, incidents, map, and SentinelMap. Resolve selection, scope, deep links, and filtering before visual spectacle.
6. Redesign satellite/SwipeComparison, drone/DroneCanvas, and verification. Integrate real media or maintain explicit samples.
7. Redesign analytics, reports, public, and admin. Verify estimates, exported documents, form failures, and persistence copy.
8. Add isolated home terrain with fallback. Measure before evaluating optional map terrain or evidence-layer views.
9. Align error/not-found surfaces and partial/offline/empty states.
10. Complete visual, keyboard, workflow, export, and measured performance review. Document the actually built system in a future DESIGN.md.

Potential reusable primitives: provenance label, observation metadata row, filter bar, inspector shell, source-state notice, evidence-media frame. Introduce shared abstractions when real consumers justify them; avoid a universal component with dozens of boolean modes. No route deletion or component-tree replacement is authorized without a specific file-level plan.

## 14. Acceptance and verification plan

### Behavioral scenarios

- Home → command → selected incident → map → verification → report retains the same case identity.
- Region changes during a request do not allow old results to overwrite new context.
- Offline data stays readable as cached/sample; attempted writes never claim persistence incorrectly.
- Missing deep-link IDs produce recovery rather than a substituted case.
- Map time/layer filters update data and counts consistently.
- Invalid media, no detections, and many detections remain usable.
- Failed triage save, report generation, public submission, and admin test preserve appropriate inputs and provide recovery.
- Keyboard and screen-reader workflows reach dialogs, comparison controls, map alternatives, and detections.
- Reduced motion, blocked WebGL, context loss, blocked fonts/tiles, and slow networks do not block core tasks.
- Short/long report exports preserve identity, complete hashes, readable page breaks, and source-state notes.

### Visual review

Inspect 390, 768, 1024, 1440, and 1920px, plus 320px stress and 200% zoom. Check heading wraps, navigation collisions, panel overlap, chart labels, row density, attribution, focus visibility, and drawer dismissal. Review selected/loading/error/empty/populated states rather than only ideal screenshots.

Run actual project lint/build checks after implementation, not as a claim for this document. Add targeted behavior tests for record identity, coordinate conversion, failed writes, and export context; avoid tests that merely mirror styling classes.

Measure route weight before/after 3D. Suggested goals under an agreed realistic setup: LCP within 2.5 seconds, INP within 200ms, CLS under 0.1. These are proposed targets, not measured results. Test representative constrained hardware and inspect main-thread work during map/scene interaction.

### Release gate

- All eleven routes and meaningful existing actions remain reachable.
- Success copy has evidence; sample/cached/local states stay identifiable.
- No silent incident substitution or region mislabelling remains.
- DOM, map, canvas, and exports share consistent tokens and readable type.
- Keyboard, focus, reduced motion, and non-canvas alternatives work.
- 3D failure never prevents investigation or form completion.
- Metrics, imagery, custody, signatures, and guarantees are not invented.
- Screenshots, test results, performance measurements, and unresolved dependencies are recorded honestly.

## 15. Instruction to the future implementer

Build the shared visual foundation and truthful state model first, route-specific workflows second, and terrain/motion enhancements last. Preserve product truth and useful wiring. Treat missing services and assets as explicit dependencies. The finished product should feel atmospheric when exploring geography, precise when judging evidence, and dependable when submitting a form or reading a report.

## 16. Expanded implementation prompt library — how to use this continuation

This continuation adds fine-grained instructions to sections 1–15. It covers every named source component and the major controls found in the route inventory, including controls that currently live inline. It is not a claim to enumerate every DOM node or every possible aesthetic technique. The builder must reconcile its final control inventory against the current source before implementation. Do not invent screens or capabilities simply to fill a pattern library.

Each numbered prompt is an actionable brief. Read it with the global token, accessibility, source-truth, and motion contracts above. Its layout values are starting specifications to validate in a rendered viewport, not measurements of the existing app. Unless explicitly marked optional, the brief describes an existing feature's redesign. A proposed capability needing a backend or new data model is labelled as such.

**Universal prompt wrapper:** For the named component, inspect its current props, event handlers, semantic elements, and data ownership. Preserve working behavior. Design default, focus, selected, pending, empty, failed, disabled, and narrow-screen states where applicable. Describe what triggers each transition, what updates immediately, what awaits a response, where focus goes, what remains after dismissal, and what survives reload. Use the shared tokens; measure actual content; verify keyboard and reduced-motion behavior. Never invent successful persistence. Do not leave a visually complete control with undefined interaction.

## 17. Using the seven requested resources deliberately

### R01 — UI/UX Pro Max: decision and verification workflow

Source: [UI/UX Pro Max repository](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill). The repository describes design intelligence spanning styles, palettes, typography, charts, and stack guidance. Treat it as a searchable decision aid rather than an authority that overrides product requirements.

**Implementation prompt:** Before redesigning a surface, write its user task in one sentence, classify its mode, identify its actual stack, and query one dominant concern. Use the locally installed skill's design-system search once for the overall direction, then focused domain searches for specific interactions. Keep only results that match this product. Record adopted and rejected suggestions with reasons. Do not regenerate a new palette for every route.

Use these focused queries as plain-language search inputs, not application code:

| Component concern | Query | Domain/stack | What to extract |
| --- | --- | --- | --- |
| Failed form submission | error summary validation | ux | Focusable summary and linked inline errors |
| Sticky panel focus | focus not obscured | ux | Focus visibility under fixed chrome |
| Comparison handle | dragging movements | ux | Non-drag alternatives |
| Alert/close controls | icon button accessible label | icons | Clear names and target sizing |
| Busy views | rapid chip animation interrupted | ux | Interrupted-state handling |
| Data graphics | time series missing data | chart | Honest gaps and readable encoding |
| App performance | layout shift dynamic content | nextjs | Reserved geometry and route-level loading |

The local validation search in this expansion returned focusable error summaries, announced errors, and associated inline errors. Use that combination: submission moves focus to a summary; individual messages stay beside inputs; ordinary blur does not repeatedly steal focus. The motion search also returned character splitting and stagger presets. Reject character-by-character operational headings and long staggered ledgers; choose only the subtle patterns compatible with this brief.

Expected artifact before implementation: a short decision table listing problem, selected guidance, adaptation, and acceptance test. No automatic persistence or forced overwrite of an existing design system. If a search fails, label the fallback judgment rather than claiming a database recommendation.

### R02 — GSAP ScrollTrigger: one evidence story, not scroll effects everywhere

Source: [official ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/). ScrollTrigger supports defined trigger ranges, pinning, scrubbed timelines, custom scrollers, recalculation through refresh, and instance cleanup. A numeric scrub smooths the playhead's catch-up. These mechanisms should support a readable sequence; they do not justify blocking normal navigation.

**Project-specific prompt:** On the home route only, design one optional section explaining observation → comparison → review. Keep all three text sections in normal document order. Let one accompanying evidence plate stay in view on sufficiently wide/tall screens while its visual state changes with the adjacent text. Use one timeline owner for the plate. Do not hide the text until animation runs.

Storyboard, proposed rather than sourced settings:

1. At entry the complete terrain plate is already readable. The first text explains where the observation belongs. A source/date caption stays fixed within the plate.
2. Through the middle portion, transition the visual emphasis from regional boundary to the before/after evidence pair. Crossfade imagery or overlay opacity; do not slide the body text around.
3. At the final portion, emphasize the selected evidence record and show the existing Review evidence destination beside the text. The action stays available throughout its section rather than unlocking at a scroll threshold.
4. Scrolling backward restores the previous visual emphasis without changing selected incident data or firing any server action.
5. On short viewports, phones, reduced motion, or script failure, use three ordinary stacked text blocks with one static plate or labelled thumbnails. No pinning.

Prefer normal sticky positioning if it achieves this composition. If pinning is needed, pin a dedicated wrapper and animate its child, reserve the resulting space, and keep the sequence short enough to exit naturally. Never pin the operational shell or stack multiple fullscreen pins.

Define start/end against the actual section geometry and the actual scrolling element. AppShell has an internal scrolling main area; assuming the browser window for every route is incorrect. Restrict this story to the home document to avoid that ambiguity. Recalculate after meaningful font/image/layout changes, not on every frame. Remove route-owned timelines, triggers, listeners, and inline animation effects on teardown; do not kill unrelated global instances.

Use progress to control explanatory visuals only. Do not use it to fabricate analysis progress. Development markers are temporary. Test browser Back, direct anchors, resizing halfway through the sequence, quick direction reversal, keyboard Page Down, and reduced-motion changes. Acceptance: the same content and actions remain accessible without the timeline, and navigating away/back does not duplicate triggers.

### R03 — Lenis: optional scroll feel with strict ownership

Sources: [Lenis official site](https://lenis.dev/) and [official README](https://github.com/darkroomengineering/lenis/blob/main/README.md). The site positions Lenis as a smooth-scroll library and links its integration documentation. The implementation must follow the version actually installed, not a copied snippet from an unrelated release.

**Project-specific prompt:** First finish and test home using native scroll. Evaluate Lenis only if the home evidence story benefits perceptibly from smoothing. Leave command, map, satellite, drone, incidents, verification, analytics, reports, public forms, admin, menus, and copilot on native scrolling. Adding Lenis globally to the root provider is not the desired integration.

Use one route-owned instance and one frame-clock owner. If coordinating with GSAP, follow the current official integration recipe; do not simultaneously run the library's automatic frame loop and a second manual loop. Confirm expected time units at the integration boundary. Never compensate for a broken setup by adding duplicate tickers.

Keep wheel response close to direct input; reject a heavy trailing sensation. Preserve native touch behavior unless testing proves a specific need. Anchor links must land below the header, focus their destination appropriately, and remain usable with smoothing disabled. Back/forward restoration and browser find must still behave predictably.

Menus, dialogs, and scrollable text areas need independent native scrolling. Modal opening pauses background scrolling; closing restores the prior position. Reduced motion uses native scroll from initial load. Tear down the instance and subscriptions when leaving home. Do not combine Lenis with another smooth-scroll system or apply competing CSS smooth behavior.

Acceptance: no extra wheel travel is needed to reach a target; a modal does not scroll the page behind it; route transitions reset/restore according to navigation intent; map zoom is never intercepted; the native version remains the fallback. If these tests fail, omit Lenis rather than weakening the task flow.

### R04 — Vanta.js: abstract atmosphere, never evidence terrain

Sources: [Vanta official site](https://www.vantajs.com/) and [Vanta repository](https://github.com/tengbao/vanta). Vanta supplies animated website backgrounds. Its setup is effect/dependency-specific; the public examples include older Three.js script references. Do not assume that a modern terrain renderer and those examples share compatible dependencies.

**Project-specific prompt:** Treat Vanta as an optional alternative to the home terrain visual, not an additional canvas behind it. If real terrain assets are unavailable and the owner wants atmosphere, prototype a low-contrast abstract field inside the visual plate. Explicitly label it illustrative. Do not call it a satellite image, detection map, canopy model, or geographical reconstruction.

Confine it to a reserved rectangular visual slot; never put animated contrast behind paragraph text or form labels. Derive its supported color options from canopy tokens. Choose the slowest, least busy composition that still adds something. Do not copy every configurator option onto every effect—inspect the chosen effect's supported settings.

Initialize only after its container and dependency are ready. Keep a route-owned instance, destroy it on unmount, and avoid duplicate initialization during development remounts. Where the chosen effect lacks a reliable pause mechanism, destroy it when hidden and keep the static poster; recreate only when appropriate. Do not manipulate undocumented internals to force suspension.

Disable it for reduced motion and constrained contexts where measurement shows poor responsiveness. Keep a CSS/static background beneath it. If the container resizes, verify geometry and sharpness rather than allowing the canvas to overflow. User pointer reaction is optional and absent on touch.

Acceptance: disabling the effect removes no information; one scene owns the visual slot; there are no leftover animation loops after navigation; text contrast stays stable. Accurate geographical terrain remains the separate custom-renderer path described in section 8.

### R05 — Supahero: composition study without imitation

Source: [UiPedia Supahero listing](https://www.uipedia.design/resources/resource/inspirations/Supahero), which describes a curated hero-section collection. Its Open Website link resolved back to UiPedia during this review, so no individual Supahero examples were inspected or selected. Do not claim a particular reference board has already been reviewed.

**Design prompt:** When the collection is accessible, select three references for composition only: one image-led split opening, one type-led opening, and one spatial/product opening. Record each reference URL and identify headline width, visual mass, navigation density, action placement, empty-space distribution, and mobile reflow. Discard references whose appeal depends on irrelevant celebrity imagery or fake proof.

Create a comparison sheet with three questions per reference: what directs the eye first; what makes the next action obvious; what survives at 390px? Extract a structural principle, not its branding, copy, imagery, or exact layout.

For Aranya, apply only the useful principles: asymmetrical text/terrain mass, a short headline with stable wrapping, two action levels, a source caption, and an opening that fits the intended viewport. Do not import a fashionable giant hero into the incident ledger. Acceptance: the result is recognizably this product, and reference-derived decisions are stated concretely rather than “make it like this site”.

### R06 — Best Free Fonts: specimen and licensing workflow

Source: [Best Free Fonts](https://bestfreefonts.com/), a curated font discovery site with preview and category browsing. Discovery does not replace checking the actual downloaded font's license and web files.

**Typography prompt:** Keep the current Manrope/Instrument Serif/limited monospace pairing as the baseline. Use the site to compare at most two alternatives for a role only if the baseline fails a concrete requirement. Never swap every font because a catalog has many choices.

Build a specimen using real strings: Aranya Sentinel; Western Ghats (Agumbe Reserve); AS-2026-088; 14.8 ha; 13.5165° N; 0.82 → 0.51; Under review; and the existing अरण्य wordmark fragment. Compare 16px paragraphs, 14px table rows, 28px operational headings, and the home headline. Inspect 0/O, 1/I/l, decimal points, arrows, degree signs, long hashes, and Devanagari fallback. Do not assume a Latin family covers the wordmark's script.

For a selected font, verify owner/source, license, commercial web use, redistribution/self-hosting permission, required notices, actual weights, and available WOFF2 files. Keep license files with the asset inventory. Avoid synthetic bold/italic. Subset only when required glyphs and future languages remain supported.

Reserve fallback geometry and test font-blocked rendering. Compare line wraps before/after load, navigation width, metric alignment, and exported report fonts. Do not make decorative display typography responsible for dense numbers. Acceptance: the font solves a demonstrated problem, fits the identity, and does not introduce unreadable metadata or layout shift.

### R07 — Uppbeat: optional presentation media with explicit boundaries

Source: [Uppbeat](https://uppbeat.io/) lists music, sound effects, stock video, motion graphics, and other creative assets with plan-dependent usage descriptions. Its homepage is not sufficient to establish rights for every asset or redistribution scenario.

**Media prompt:** The application stays silent by default. Consider Uppbeat first for a separate product walkthrough or optional user-initiated home video, not routine button sounds or background music in an analyst workspace. No sound signifies verification, danger, or success without corresponding visual/text feedback.

Before downloading, define the asset's exact purpose, placement, duration, and distribution: a demonstration video differs from an embedded reusable in-app asset. Verify the chosen asset's actual license, account entitlement, client/commercial usage, attribution, and whether embedding/redistribution is permitted. Record the asset URL, creator, license evidence, acquisition date, and transformation notes. If rights are unclear, leave an asset slot rather than promising use.

For a walkthrough, favor restrained atmosphere that leaves narration intelligible. Provide captions, transcript, mute, pause, and a visible play control. No autoplay audio. Stop on dismissal or route change. A short illustrative forest clip must not appear inside a forensic evidence pane or imply it depicts the selected reserve.

Optional future alert audio requires a separate user preference and verified event source, rate limiting, and equivalent visual notice. It is not part of the default redesign. Acceptance: no audio starts unexpectedly, the muted experience is complete, and source/license records accompany shipped media.

### Resource ownership matrix

| Responsibility | Owner | Must not compete with |
| --- | --- | --- |
| Simple hover/focus/pressed | Shared CSS/state styling | A second animation library on the same property |
| Home evidence timeline | One GSAP timeline, if needed | Independent scroll handlers moving the same plate |
| Optional home scroll smoothing | One Lenis instance | Native task-pane scroll or another smoother |
| Accurate terrain | Isolated geographical scene renderer | Vanta pretending to be measured geography |
| Abstract home atmosphere | Optional Vanta alternative | A simultaneous terrain canvas in the same slot |
| Font discovery | Best Free Fonts plus source/license review | Uncontrolled family proliferation |
| Hero inspiration | Supahero reference study | Copying assets or operational layouts blindly |
| Optional presentation media | Licensed Uppbeat asset | Autoplay/task-critical audio |

## 18. Component prompts: shell and shared primitives

### C01 — Brand lockup and home link

**Prompt:** Refine the existing contour emblem and wordmark as one compact navigational unit. Keep the product name and existing script fragment; inspect actual glyph rendering. Align emblem and text optically, not merely by bounding boxes. Keep subtitle sentence-case and comfortably readable, or remove redundant decorative wording through an explicit copy decision. Do not animate the emblem continuously.

**Flow:** Pointer/focus highlights the whole link; activation navigates home. The icon is decorative because the link has a name. On small screens shorten secondary material before shrinking the product name. Expect one focus stop and a stable header height; no separate nested clickable emblem.

### C02 — Region selector

**Prompt:** Show current region, location icon, and disclosure affordance in a 44px-tall trigger. Use a quiet border and modest horizontal padding. Open a viewport-contained panel at least as wide as the trigger, with region name first, state/canopy context second, and explicitly labelled risk third. Use single-selection semantics appropriate to a chooser rather than a bag of unrelated menu buttons.

**Flow:** Opening focuses the current option; keyboard navigation moves through options. Escape closes and returns focus. Selecting closes, updates the context label, then shows scoped loading. Do not lose the old view until replacement is available, and do not treat a failed response as a successful region refresh. Current option gets a check and background, not color alone. Search is optional only when the region list becomes long. On mobile use a comfortably sized dialog/list, not an offscreen dropdown.

### C03 — Alert trigger, count, and alert panel

**Prompt:** Enlarge the existing 40px icon target to the shared target size. Show the count as a compact attached label without clipping multi-digit values; announce a meaningful accessible name such as “Active alerts, 12”. Define whether the count is global or region-scoped.

**Flow:** Click or keyboard opens a titled panel. Remove the current mouse-leave dismissal behavior as the sole closing mechanism. Close through Escape, explicit close, or deliberate outside interaction. Each alert is a semantic link to its actual incident context, not a clickable div that always sends everyone to generic command. Preserve the four-item preview if useful, but show that it is a preview and offer View all. An empty preview must use the same filter semantics as the count. Do not mark alerts read unless that capability exists.

**Expected:** Focus remains predictable, leaving the pointer does not erase a panel while someone reads, and clicking AS-2026-088 opens that case. Source: Navbar currently owns alertDrawerOpen, urgentIncidents, and generic command navigation.

### C04 — Copilot entry and shortcut

**Prompt:** Give the assistant trigger a concise label at desktop widths, clear accessible name when icon-only, and open state. Show Ctrl/Cmd+K only as a small secondary hint, not a primary instruction.

**Flow:** Preserve the existing shortcut's avoidance of input/textarea/contenteditable contexts. Opening focuses the composer or panel heading according to conversation state. Closing restores the actual opening trigger. Shortcut behavior must not unexpectedly interfere with form typing. Opening copilot on mobile closes conflicting navigation overlays without discarding unsaved form data.

### C05 — Navigation rail and mobile drawer

**Prompt:** Use stable icon widths, left-aligned labels, generous hit areas, and sentence-case group labels. Active row gets a quiet full-row surface and a slim structural marker. Keep badges aligned in a dedicated trailing column. Avoid shadows on every navigation item.

**Flow:** A destination link changes route and closes the mobile drawer. Escape/backdrop close restores menu-button focus. Desktop rail is not a modal. Mobile drawer prevents interaction behind it and has its own scroll area when short. Keep active destination visible after navigation. Do not animate every row in a long stagger.

### C06 — PageHeader and page actions

**Prompt:** Standardize title, one useful description, optional current scope, and action group. Remove the existing decorative eyebrow/editorialAccent approach from operational headers through an explicit component migration. Use one heading voice, no glued arrows or middle-dot metadata strings. Main actions align to the title region on desktop and wrap below on phones.

**Flow:** Header actions operate on current context. When no record is selected, disable with an explanation or present a selection action; never navigate to an arbitrary case. Keep title readable with long region names. Header controls must not move during a brief pending state.

### C07 — Buttons, links, and icon controls

**Prompt:** Define primary, secondary, quiet, and destructive treatments with common height and icon/text alignment. Primary uses canopy, destructive only for actual destructive intent. Use a separate icon for an external destination only when it truly leaves the application. Text links look like links and remain recognizable without hover.

**Flow:** Press feedback occurs immediately. Async action then changes to a precise pending label and blocks duplicates. Success is driven by outcome, not elapsed animation. Failure restores retry without losing context. Keep label width stable. Focus is instant, pressed movement no more than a tiny scale/translation, reduced motion uses tonal feedback only. Never make essential controls magnetic or chase the cursor.

### C08 — StatusBadge and provenance label

**Prompt:** Separate three vocabularies: severity, workflow status, data source. Severity may be Critical/High/Medium/Low; workflow uses existing statuses; provenance says Sample/Cached/Server-confirmed/Local-only when actually known. Render compact text with an appropriate icon when helpful. Preserve full accessible labels; avoid 10px type and excessive pills.

**Flow:** Status changes only on data change. No pulsing to imply urgency. Unknown values show a neutral readable label rather than a false success treatment. Non-interactive badges have no pointer cursor. Clickable filters are separate controls, not visually identical passive badges.

### C09 — EmptyState, skeleton, and error notice

**Prompt:** Replace a universal centered card with variants based on context. A table empty state occupies the table region; a missing image occupies the reserved media frame; a page failure gets a readable recovery block. Heading says what happened, body explains consequence, action supplies the next step.

**Flow:** Loading reserves geometry. Empty data appears only after a completed request. No matches offers Clear filters. Request failure offers Retry and retained context. Retry becomes pending and cannot repeat uncontrollably. Use appropriate heading depth rather than always emitting the same heading level. Keep icons subordinate to explanation.

### C10 — Form fields, help, and validation

**Prompt:** Place visible label above the field, helper immediately beneath or beside it, error beneath without relying on a red border. Input text uses the main reading scale. Keep optional/required meaning explicit. Avoid disappearing floating labels.

**Flow:** Typing does not move focus. Validate suitable constraints on blur or submit; failed submit focuses a linked summary. Correction removes only the resolved error. Pending submission preserves values and prevents duplicate requests. A field-level server error belongs beside its field; a service failure belongs at form level. Long textareas grow through normal layout or scroll comfortably without decorative height animation.

### C11 — Modal, inspector, and confirmation shell

**Prompt:** Create a shared overlay hierarchy: header with identity/close, scrollable body, stable action area. A reading inspector can be non-modal at desktop widths; a narrow-screen editor becomes modal. Distinguish those semantics.

**Flow:** Opening records the trigger, initializes content, then moves focus. Closing a clean surface restores focus; dirty editing asks whether to keep editing or discard. Escape follows the same dirty-state rules. Background scroll is blocked only for modal variants. Never stack confirmation dialogs indefinitely. Inspect long content, short viewport, virtual keyboard, and 200% zoom.

### C12 — Copy action, tooltip, and transient notice

**Prompt:** Attach Copy to an actual full value such as a hash/receipt. Keep the displayed value selectable. Tooltip explains only secondary context, never essential instructions.

**Flow:** Copy success appears only after the clipboard operation succeeds; failure offers manual selection. Announce short feedback without moving focus. Tooltip opens on hover and keyboard focus, closes on Escape, and does not block nearby controls. Toasts never carry the only record of a failed write or important receipt.

## 19. Component prompts: spatial and evidence controls

### C13 — Home terrain plate and caption

**Prompt:** Compose terrain, selected boundary, and one evidence anchor as a single dominant object. A 16px rounded outer frame may hold the scene, but captions remain aligned to a shared grid rather than floating everywhere. Put source/date/provenance in a quiet caption strip, with no decorative sensor claim.

**Flow:** Poster first, optional scene second, explicit interaction third. Pointer motion never affects the left headline or action group. Selection highlights a real record and exposes its link. An illustrative plate remains labelled. On mobile the poster is already a complete visual; activation is optional. Expect no blank canvas flash or layout jump.

### C14 — Summary metric band

**Prompt:** Show three or four useful summaries on one ruled band rather than separate shadowed cards. Label above, tabular value below, unit adjacent, scope/source available. Prefer left alignment and consistent numeral baselines. Risk color belongs only to the appropriate value.

**Flow:** New data replaces old data without count-up. Unknown is an em dash with explanation, not zero. If a metric is a filter shortcut, make that explicit and keyboard-operable; otherwise it is plain content. Phone layout becomes two columns or stacked pairs without shrinking labels.

### C15 — Command queue row and severity filters

**Prompt:** Give each row a stable left identity region and right severity/status context. Selected state uses background and edge rule. Use a compact filter group with an All option and explicit result count. Avoid mixing a state filter with a severity filter under the same ambiguous label.

**Flow:** Selecting updates ID immediately, then inspector/map. Filter changes preserve selection only if still visible; otherwise explain or reset. Do not silently select the first different case. Keyboard users can activate row-level selection and distinct actions without nested interactive conflicts. Background updates do not move the focused row unexpectedly.

### C16 — Command quick actions

**Prompt:** Inspect existing verify/escalate handlers before relabelling them. Show the action's actual consequence and current case ID. Present Review evidence as navigation and status mutation as a separate operation.

**Flow:** A consequential status change captures required reason/confirmation if the product requires it, then awaits explicit persistence outcome. Keep other case content readable while pending. Rejection restores the previous status with an error. Do not show a green state because a local timer finished. Optional undo appears only if the backend can reverse the action.

### C17 — Basemap switcher

**Prompt:** Preserve satellite, dark, and topographic choices in SentinelMap, with clear names and selected state. Use a compact segmented group or menu depending on width. Do not use tiny decorative thumbnails unless they accurately preview the choice.

**Flow:** Switching changes the base layer while preserving extent, selected ID, and overlays. Failed tile loading retains usable overlays and shows a source-specific notice. Attribution updates with the source. Repeated switching does not leave duplicate layers. Mobile controls never cover zoom or attribution.

### C18 — Map layers and legend

**Prompt:** Put visibility checkboxes beside human-readable layer names, followed by a legend explaining each geometry. The hit area includes the label. Disturbance outlines, incident markers, and drone observations remain visually distinguishable without color alone.

**Flow:** Toggle updates immediately and preserves the underlying data. Turning off the selected feature's layer either retains its inspector with “Layer hidden” or explicitly clears selection; choose and document one behavior. Legend is explanatory, not another unlabeled toggle. If data is unavailable, disable with a reason rather than showing a fake empty layer.

### C19 — Time window control

**Prompt:** Display 7, 14, 30, and 90-day options with a clear date/time basis. State which observation timestamp is filtered and whether the window ends now or at a dataset cutoff.

**Flow:** Selection updates query/scope, exposes pending state where needed, rejects stale responses, then updates geometry/counts together. Preserve the selected ID only if within range. No data offers a wider window action. The current cosmetic-only state must not remain after redesign.

### C20 — Marker, polygon, popup, inspector

**Prompt:** Differentiate point markers and boundary geometry; selected polygon has a crisp outline with a restrained fill. Keep popups concise: identity, type, and Open details. Full analysis belongs in the inspector. Small marker visuals may have larger invisible hit areas without falsifying mapped size.

**Flow:** Click/list selection opens matching detail; closing returns to the map/list trigger without resetting the entire view. A popup must not obscure its own close control at viewport edges. Overlapping features need a selection list or clustering strategy appropriate to scale, not random z-order. Missing coordinates remain inspectable in the ledger with a location-unavailable note.

### C21 — Map navigation and 2D/3D switch

**Prompt:** Provide zoom in/out, reset extent, and explicit view-mode controls with accessible names. Compass/reset orientation belongs only to a mode that can rotate. Do not show a disabled decorative compass on a fixed north-up map without explanation.

**Flow:** Mode switch preserves selected ID and fits the comparable extent. Loading 3D retains the 2D view until ready. Failure keeps 2D, not a dead panel. Controls offer alternatives to dragging/pinching. Keyboard stepping and reset allow recovery from an unfamiliar camera angle.

### C22 — Satellite band tabs and metadata

**Prompt:** Present Dynamic World, NDVI delta, and true color as clearly selected choices with a short description of the active visualization. Put dates, sensor, spatial resolution, and source state in an adjacent readable metadata strip.

**Flow:** Switching preserves comparison position and geometry, requests the correct layer where supported, and shows unavailable bands honestly. Do not animate one data representation into another as though intermediate colors are measurements. Keep selected semantics accurate and keyboard navigation consistent with the chosen tab/control pattern.

### C23 — Before/after wipe

**Prompt:** Use a fine divider with a conspicuous 44px handle, contrasting against both imagery extremes. Before/after labels remain legible over changing pixels using stable opaque label backplates. The handle must not hide essential evidence.

**Flow:** Drag directly tracks input; arrows adjust a small step, larger keyboard increments and numeric input provide alternatives, reset returns to 50%. Display the chosen position accessibly without announcing every pointer frame. Side-by-side is an optional presentation mode with the same data. On pointer release retain the exact position. No autoplay wipe that prevents inspection.

### C24 — Candidate boundary action

**Prompt:** Place the action beside a summary of selected observations and an explanation of what will be produced. Preview includes boundary ID if supplied, area, source pair, and provenance.

**Flow:** Prepare → inspect preview → save if supported. Pending cannot claim a percentage without progress data. Invalid/empty geometry explains the failure. Demo preparation never says committed. Repeated activation cannot create accidental duplicates; backend idempotency is a separate integration requirement. A saved record links to the actual result.

### C25 — Spectral index reading

**Prompt:** Make each index a ruled reading: name, before/after values, delta, and one short interpretation. Keep units/meaning consistent. Use a tiny chart only if real sequence data exists, not as decoration.

**Flow:** Values update from the selected pair. Missing values are marked unavailable; change in sign is explicit in text. Tooltip/detail explains the index without claiming causation from a single value. Do not use dramatic red styling for every nonzero change.

### C26 — Drone mission selector

**Prompt:** Preserve the mission choices visible in drone/page.tsx but show actual mission identity, date, and availability when supplied. Selected state needs more than a color change.

**Flow:** Changing mission updates its associated media/result, or clearly states that the current implementation is a demonstration selector. Never change only the label while retaining another mission's evidence without explanation. Dirty prompt/media state gets an intentional retain/discard decision where necessary. Missing mission media produces a scoped empty state.

### C27 — Upload and media replacement

**Prompt:** Use a labelled upload control with supported types/limits drawn from the service contract. Drag/drop can supplement, never replace the file chooser. Selected filename, file size if known, and replace action appear before analysis.

**Flow:** Choose → validate → preview → analyze. Canceling the file picker changes nothing. Invalid file retains the previous valid media. Replacing media clears incompatible detection selection and warns about unsaved derived work where applicable. Revoke temporary preview resources on replacement/unmount. Avoid a false upload-success label when the file is only local.

### C28 — Detection threshold, boxes, and masks

**Prompt:** Pair the confidence slider with a numeric value and explanatory label. Boxes and masks are independent labelled checkboxes. Ensure the threshold control does not imply it reruns inference if it only filters existing detections.

**Flow:** Adjust threshold and update visible rows/overlays consistently. If the selected detection disappears, announce it and clear or mark the selection. A mask unavailable from the model has an unavailable state; do not paint a synthetic mask. Preserve slider focus during result updates.

### C29 — Analysis prompt and rerun

**Prompt:** Retain the current object-query input but use a visible label and concise example. Run analysis is the clear primary action within the tool, not globally across the page.

**Flow:** Validate required media/query → pending → result/error. Disable duplicate runs. Keep the prior result visible and explicitly label it previous while a new run is pending. A late result for old media cannot overwrite the current image. Failure preserves media/query and offers retry. No fake scanning beam or fabricated progress.

### C30 — Detection ledger and selected target

**Prompt:** List label, confidence, ID, and available location/area metadata. Selection synchronizes row and overlay. Use a quiet outline and selected label, not a huge opaque box over the target.

**Flow:** Hover previews emphasis; focus provides the same information; activation locks selection. Zoom/pan maintains coordinate alignment. Empty filtered results differ from no detections returned. The full result remains readable without canvas interaction. Do not equate missing GPS with zero latitude/longitude.

## 20. Component prompts: records, forms, reports, and recovery

### C31 — Incident search and filter bar

**Prompt:** Search has a visible purpose, clear button, and result count. Status and severity remain separate selects. Align labels, control heights, and gaps; wrap the group vertically on mobile rather than shrinking it.

**Flow:** Local search can update immediately; future remote search may debounce without delaying keyboard feedback. Clearing search retains other filters. Clear all restores the documented default. Store shareable state where appropriate and preserve browser Back behavior. No results offers recovery, not an alarming error.

### C32 — Incident table and row actions

**Prompt:** Align numbers by value, text by reading edge, and dates consistently. Use a stronger header rule than body separators. Keep title flexible, ID compact, and action targets large. Sticky headings must not obscure focus. Avoid zebra stripes plus heavy borders plus hover shadows simultaneously.

**Flow:** Sort preserves selected ID. Row activation opens the case; embedded Review evidence/Open triage actions do not accidentally trigger another row handler. On mobile provide the essential identity/severity/status/action grouping. Large-dataset pagination/virtualization is optional pending real scale; never invent total counts.

### C33 — Triage editor fields and footer

**Prompt:** Header shows case ID/title, then status select, analyst input, and notes textarea. Footer has Cancel and Save changes. Show unsaved state quietly. Explain optional fields and required reasons.

**Flow:** Opening copies current record into a draft. Edits stay local until submission. Cancel discards only after appropriate dirty-state confirmation. Save waits for explicit result; failure retains draft, confirmed success updates the shared record. If concurrent edits are supported, show conflict recovery rather than silently overwriting. Do not invent concurrency guarantees absent from the API.

### C34 — Evidence pane and corroboration ribbon

**Prompt:** Give satellite and drone panes matching metadata hierarchy but preserve their distinct content. The corroboration ribbon shows model result, explanation, scope, and missing inputs rather than blanket green approval.

**Flow:** Load each source independently where possible. Partial completion remains readable. Fusion starts from the actual requested case. Missing one source gives incomplete corroboration, not positive confirmation. A comparison diagram is explicitly explanatory; measured values appear only when supplied or correctly calculated.

### C35 — Integrity digest and signature action

**Prompt:** Display a short digest preview with access to the full selectable value, algorithm, source, and check status. Place signature review separately from integrity display so a hash does not visually imply officer approval.

**Flow:** Copy does not verify. Checking integrity, if supported, reports match/mismatch/unavailable. Signing, if supported, identifies actor and record, confirms intent, awaits persistence, and shows returned audit information. Local demo state remains labelled and cannot generate an authoritative-looking success stamp.

### C36 — Analytics chart frame and methodology disclosure

**Prompt:** Title states the question, subtitle states scope, axes show units, and legend uses direct understandable labels. Place a View data action and Methodology disclosure near the chart. Use 2D encodings and consistent time intervals.

**Flow:** Hover/focus reveals the same value; keyboard or data table accesses every point. Missing periods are gaps, not zero. Changing scope updates chart, table, totals, and methodology context together. Estimates expose assumptions and source date. Keep explanatory text available when charts cannot render.

### C37 — Report incident picker and generation

**Prompt:** The picker identifies the incident by ID and title. Generate report names its action; do not merge it with download. Show source mode and required missing inputs before activation.

**Flow:** Pick case → generate → server/local outcome → select returned report. Disable duplicates while pending. Failure leaves the existing library/preview intact. A returned report must reference the selected incident. Do not optimistically add a completed dossier before generation succeeds.

### C38 — Report library, preview, and export

**Prompt:** Library rows show title, incident ID, creation time, and status. Preview has a quiet paper surface, readable text, and a separate toolbar. Page shadows suggest document boundaries only; do not nest decorative cards inside the dossier.

**Flow:** Selection loads the matching report without resetting library scroll. Print/download actions expose actual behavior; if the action opens browser print, label it accordingly rather than pretending a server download occurred. Handle popup/print limitations gracefully. Long reports preserve table headings, page margins, full hashes, and evidence captions. Preview/source identity must match the exported content.

### C39 — Public observation form and receipt

**Prompt:** Use a plain sequence of labelled fields: reserve, disturbance type, coordinates, description. Explain coordinates with an example and validation, but do not prefill a real-looking location as the citizen's observation. Keep description generous and readable.

**Flow:** Submit validates and focuses linked errors. Pending preserves content. Real acknowledgment shows a copyable receipt and a concise explanation; local simulation says so. Submit another resets deliberately after success, not while a request is unresolved. No automatic user-location request or new attachment field is implied by this redesign.

### C40 — Public transparency statistic

**Prompt:** Pair each published figure with what it measures, period, and provenance. Use moderate scale, not promotional oversized proof. Unknown/unapproved values have an explicit sample or unavailable treatment.

**Flow:** Refresh changes values only with a source response. No animated count-up or false real-time label. Detail links reveal methodology only if such information exists. Never let a nearby privacy icon imply anonymity guarantees the service has not established.

### C41 — Admin credential/configuration field

**Prompt:** Group fields by service with a short purpose statement. Distinguish secret values from non-secret endpoints. Masked existing credentials indicate configured state without shipping the secret to the browser; replacing is an explicit action if supported.

**Flow:** Edit → dirty → validate → save → returned outcome. Do not log or echo secrets. A test action uses the intended draft/saved configuration consistently and explains which. Missing permission makes the limitation explicit. Browser reload must not appear to retain unsaved in-memory changes.

### C42 — Connection test and save feedback

**Prompt:** Test connection and Save configuration have distinct labels and results. Place feedback near the owning service, with time and a safe summary when supplied. Avoid a global success banner for one tested subsystem.

**Flow:** Pending blocks duplicate tests but not unrelated reading. A timeout/failure includes a next step without exposing credentials or internal payloads. Saving does not imply a test was run. Testing a notification channel does not imply message delivery unless the result establishes delivery.

### C43 — Copilot conversation and composer

**Prompt:** Header names the assistant and current scope. Messages have readable measure, restrained role distinction, and clear source/reference links. Composer remains reachable above mobile keyboard; suggested prompts sit quietly above it rather than overwhelming the conversation.

**Flow:** Submit appends the user's message and pending response state. Failure offers retry without duplicating messages. New messages do not force-scroll someone reading older content; provide a new-response affordance. Suggestions preserve their actual behavior: sending a prompt is not executing a mutation. Clear/reset, if retained, explains what it removes. Referenced incidents open their specific IDs and preserve return context where possible.

### C44 — Error boundary, not-found, and retry

**Prompt:** Keep recovery pages visually related to the app, with a plain heading, short consequence, and clear action. Technical stack traces stay out of public UI. Not-found distinguishes an unknown route from a missing record inside a valid route.

**Flow:** Retry invokes the actual recovery action and shows pending feedback where meaningful. Persistent failure remains an error; do not simulate success. Home/command links provide a safe route out. Preserve useful case/filter context in recovery links when known. No spinning globe, humorous missing-tree illustration, or heavy background effect should compete with recovery.

## 21. End-to-end flow scripts: what the user sees and what the app must do

### F01 — First visit to a useful investigation

Home displays usable copy and poster immediately. User selects Open command centre. Command exposes its scope/source state and queue. Selecting a case updates the inspector identity at once, then loads matching evidence. Review evidence includes that ID. Verification shows available sources, missing inputs, and model assessment separately. Report navigation retains the case. At no point should a default hardcoded case quietly replace the chosen one.

**Expected feeling:** a continuous narrowing from region to case to evidence. **Preserved state:** selected region and case. **Failure branch:** stop at the failed source with retry/back, retaining identity. **Motion:** small spatial continuity, no full-screen route curtain.

### F02 — Alert-driven triage

User opens Alerts with mouse or keyboard. Panel remains open while reading. Selecting a preview opens that incident, closes the panel, and moves focus to the destination heading. User changes status/analyst/notes. Save shows pending, then server-confirmed or local-only/error. The alert count recomputes from the same documented predicate after the record updates.

**Expected feeling:** direct and accountable. **Failure branch:** notes remain editable. **Do not:** navigate every alert to a generic page or close the editor on a success timer.

### F03 — Geographical comparison

User chooses region, date window, and layers. Map settles with explicit scope. Selecting a boundary opens its inspector. Optional Terrain view loads without losing selection; failure leaves 2D. Opening satellite comparison carries compatible region/boundary context where the data contract supports it. Unsupported context transfer is labelled rather than guessed.

**Expected feeling:** geography remains stable while tools change. **Failure branch:** unavailable imagery preserves boundary details. **Do not:** use newly generated terrain to imply missing elevation measurements.

### F04 — Upload to reviewed detection

Choose media; validate; show local preview; enter query; run analysis; show processing; display result with provenance; select detection in list; highlight aligned overlay; inspect confidence and metadata. Rerunning retains previous results as previous until replacement is valid.

**Expected feeling:** explicit stages and recoverable work. **Failure branch:** invalid media does not erase a previous valid file; inference failure preserves query. **Do not:** show sample detections on a newly uploaded image as if they were its result.

### F05 — Report creation and export

Choose incident; generate; confirm returned report identity/source mode; inspect preview; export/print. The exported artifact repeats relevant source/demo status. Generation error leaves the previous report visibly identified. Print failure does not change report status.

**Expected feeling:** a document with traceable context. **Do not:** use the existence of a PDF or hash as proof of legal certification.

### F06 — Citizen submission

Read purpose/privacy information; choose reserve/type; enter location/description; review; submit. Validation links to specific fields. Server acknowledgment produces a receipt; a demonstration produces a clearly labelled demo result. Copy receipt gives actual clipboard feedback. Submit another starts a new draft intentionally.

**Expected feeling:** simple, respectful, honest. **Failure branch:** all input survives. **Do not:** imply a patrol was dispatched or anonymity guaranteed through a timer.

### F07 — Administration change

Review service state; edit a supported setting; see unsaved indication; optionally test the intended configuration; save; inspect returned result. Leaving while dirty asks whether to retain editing or discard. Test and save histories remain distinct.

**Expected feeling:** predictable configuration, no false confidence. **Failure branch:** safe error detail and retained draft where appropriate. **Do not:** surface secrets or label local state as synchronized.

### F08 — Copilot-assisted navigation

Open assistant; see current scope; ask a question; wait or retry; read answer and references; open a referenced incident. If the answer is sample/offline, that remains apparent. Closing returns focus and preserves conversation according to the chosen session policy. No assistant suggestion silently mutates records.

## 22. Fine aesthetic decisions and deliberate exclusions

### Optical alignment and rhythm

Align text baselines, not just box centers. Correct icon optical imbalance with small internal positioning while maintaining the same hit area. Use one recurring page gutter and one operational column gap. Let separators continue consistently across related rows. Avoid almost-equal gaps such as 13, 15, and 17px without a meaningful reason.

Numbers align by place value where useful. Units sit close enough to read as part of the value but do not compete in weight. Negative signs and decimal points remain visible. Do not pad unknown values with fictional zeros. Long identifiers wrap only in dedicated regions; names wrap naturally rather than breaking every word.

### Surface depth

Base page has no shadow. Reading sheets use a border or very light elevation. Menus/dialogs have stronger elevation because they float over content. A selected row changes surface, not shadow. Use one directional lighting logic for the terrain plate and its frame. Avoid multiple conflicting light sources implied by unrelated shadows.

Thin contour texture may occupy a quiet home margin at low contrast. Keep it off tables, form backgrounds, chart plotting areas, and evidence images. Never animate grain across the entire app. Avoid expensive full-screen blur; opaque readable panels are preferred over translucent layers on busy imagery.

### Type finish

Balance short home headings without forced line breaks that fail on mobile. Do not reduce body text to fit a card. Remove redundant labels before shrinking. Avoid justified body copy, exaggerated tracking, all-caps metadata, and decorative mixed italics. Use consistent sentence case while preserving genuine identifiers and acronyms. Check the existing Devanagari mark with a real supporting font.

### Image treatment

Product evidence remains true to source: no aesthetic color grade that alters interpreted values. Decorative home imagery may use a consistent restrained treatment only when labelled as illustrative. Crop with a documented focal point; evidence viewers offer full-image access. Reserve geometry before load. Captions identify source and time rather than becoming decorative microtype.

### Microdelight that belongs

Useful delight includes a precisely aligned selected boundary, a clean handoff from row to inspector, a reliable copy confirmation, a restored draft, and a terrain reset that lands on a composed view. These make the product feel finished. Avoid confetti for verified incidents, celebratory sounds around forest loss, bouncing warning badges, rotating badges, elastic form fields, typewriter headings, hover-tilting tables, and magnetic controls.

### Density and emphasis

Give each screen one main visual object and one main task action. A page can contain many controls without making them all equally loud. Secondary explanations belong in disclosure or readable support regions; never hide essential caveats in hover-only tooltips. The operational screen may exceed a marketing word budget when the task requires it, but redundant jargon should be removed.

## 23. Prompt completion contract and final coverage check

For each C01–C44 prompt, the future builder should record: current source owner; changed files; preserved props/handlers; final layout; all applicable states; keyboard path; mobile behavior; motion/reduced-motion behavior; source/backend dependency; screenshot or behavior evidence; unresolved limitations. A checked box without evidence is not completion.

Before shipping, reconcile every current button, link, input, select, textarea, range, file input, checkbox, row action, and canvas hit target against this catalogue. Any newly discovered control gets its own brief using the universal wrapper in section 16. Do not silently remove it because it was absent from this document.

Resources were consulted on 3 November 2026. No external asset was downloaded, no library installed, no license entitlement established, and no UI code changed by this documentation expansion. Individual Supahero examples remain unreviewed. The preceding timings, dimensions, scene choices, and integration boundaries are project-specific recommendations, not claims that the reference sites prescribe this exact design.
