# Aranya Sentinel — Build Prompt Pack

Compiled from *Aranya\_Sentinel\_Visual\_Redesign\_Specification* (ChatGPT review, 3 Nov 2026). This pack is for handing to a coding agent (e.g. Claude Code) one piece at a time. Use the Master Prompt once at the start of a session, then feed the C-numbered prompts in order.

## Master prompt (give this first, once)

You are implementing a visual redesign of Aranya Sentinel, a Next.js 14 / React 18 / TypeScript / Tailwind forest-monitoring app with 11 existing routes. **Preserve all existing behavior, routes, API calls, field names, and callbacks — this is a styling and composition redesign, not a rebuild.** Do not invent new capabilities, screens, or backend behavior.

Non-negotiable rules for every component you touch:

- **Never fabricate success.** A timer finishing is not the same as a server confirming. If an action's real outcome isn't known yet, show pending state honestly; only show success after a real response.
- **Never hide or silently swap data.** An unknown/missing record shows a missing-state, not a substituted one. Missing values are an em dash or "Not supplied" — never a fabricated zero.
- **Distinguish sample/cached/local/server-confirmed data** wherever the app can be in one of those states — label it, don't blur it.
- **Accessibility is mandatory, not polish:** every state (default, focus, selected, pending, empty, failed, disabled, narrow-screen) needs a defined keyboard path and an accessible name. Reduced-motion and keyboard-only usage must fully work — motion is decoration, never the only way to access something.
- **Design tokens, not literals.** Centralize color/spacing/type values; don't hardcode hex codes or magic numbers per-component.
- **One main object + one main action per screen.** Operational screens (map, incidents, verification, admin, etc.) are tools, not marketing pages — avoid oversized hero treatment, decorative gradients, pulsing badges, confetti, or count-up animations on real data.

### Universal wrapper — apply to every C-prompt below

For the named component: inspect its current props, event handlers, semantic elements, and data ownership first. Preserve its working behavior. Then design its default, focus, selected, pending, empty, failed, disabled, and narrow-screen states (where applicable), and for each state describe: what triggers the transition, what updates immediately vs. waits for a response, where focus goes, what survives dismissal, and what survives reload. Use shared tokens. Verify keyboard and reduced-motion behavior. Never leave a visually complete control with undefined interaction, and never invent a persistence outcome that didn't happen.

---

## Shell and shared primitives

### C01 — Brand lockup and home link

**Prompt:** Refine the existing contour emblem and wordmark as one compact navigational unit. Keep the product name and existing script fragment; inspect actual glyph rendering. Align emblem and text optically, not merely by bounding boxes. Keep subtitle sentence-case and readable, or remove redundant decorative wording through an explicit copy decision. Do not animate the emblem continuously. **Flow:** Pointer/focus highlights the whole link; activation navigates home. The icon is decorative because the link has a name. On small screens shorten secondary material before shrinking the product name. One focus stop, stable header height, no separate nested clickable emblem.

### C02 — Region selector

**Prompt:** Show current region, location icon, and disclosure affordance in a 44px-tall trigger. Quiet border, modest horizontal padding. Open a viewport-contained panel at least as wide as the trigger: region name first, state/canopy context second, explicitly labelled risk third. Single-selection semantics. **Flow:** Opening focuses the current option; keyboard navigation moves through options. Escape closes and returns focus. Selecting closes, updates the context label, then shows scoped loading — don't lose the old view until replacement is ready, and don't treat a failed response as a successful refresh. Current option gets a check and background, not color alone. Search only if the list is long. Mobile uses a sized dialog/list, not an offscreen dropdown.

### C03 — Alert trigger, count, and alert panel

**Prompt:** Enlarge the existing 40px icon target to the shared target size. Show count as a compact attached label without clipping multi-digit values; accessible name like "Active alerts, 12". Define whether the count is global or region-scoped. **Flow:** Click or keyboard opens a titled panel. Remove mouse-leave-only dismissal. Close via Escape, explicit close, or deliberate outside click. Each alert links to its real incident context, not a generic command page. Preview can stay at 4 items but must say so, with a View all. Empty preview uses the same filter logic as the count. Don't mark alerts read unless that capability exists.

### C04 — Copilot entry and shortcut

**Prompt:** Concise label at desktop widths, clear accessible name when icon-only, visible open state. Show Ctrl/Cmd+K as a small secondary hint only. **Flow:** Preserve the shortcut's avoidance of input/textarea/contenteditable contexts. Opening focuses the composer or panel heading depending on conversation state. Closing restores the actual trigger that opened it. Shortcut must not interfere with form typing. Opening on mobile closes conflicting nav overlays without discarding unsaved form data.

### C05 — Navigation rail and mobile drawer

**Prompt:** Stable icon widths, left-aligned labels, generous hit areas, sentence-case group labels. Active row gets a quiet full-row surface and a slim structural marker. Badges in a dedicated trailing column. No shadow-per-item. **Flow:** A destination link changes route and closes the mobile drawer. Escape/backdrop close restores menu-button focus. Desktop rail isn't modal. Mobile drawer blocks interaction behind it and scrolls independently when short. Keep active destination visible after navigation. No long row stagger animation.

### C06 — PageHeader and page actions

**Prompt:** Standardize title, one useful description, optional current scope, action group. Explicitly remove the decorative eyebrow/editorialAccent pattern from operational headers. One heading voice — no glued arrows or middle-dot metadata strings. Actions align to the title on desktop, wrap below on phones. **Flow:** Header actions operate on current context. With no record selected, disable with an explanation or offer a selection action — never navigate to an arbitrary case. Keep title readable with long region names. Controls must not shift position during brief pending states.

### C07 — Buttons, links, and icon controls

**Prompt:** Define primary, secondary, quiet, destructive treatments with a common height and icon/text alignment. Primary uses canopy color; destructive only for genuinely destructive actions. Separate external-link icon only for actual external destinations. Text links stay recognizable without hover. **Flow:** Press feedback is immediate. Async action switches to a precise pending label and blocks duplicate activation. Success is outcome-driven, not timer-driven. Failure restores retry without losing context. Label width stays stable. Focus is instant; reduced motion uses tonal feedback only, never magnetic/cursor-chasing controls.

### C08 — StatusBadge and provenance label

**Prompt:** Separate three vocabularies: severity (Critical/High/Medium/Low), workflow status (existing statuses), and data provenance (Sample/Cached/Server-confirmed/Local-only, shown only when actually known). Compact text plus icon where helpful; keep full accessible labels; avoid 10px type and pill overuse. **Flow:** Status changes only on real data change — no pulsing for urgency. Unknown values get a neutral label, never a false-success treatment. Non-interactive badges have no pointer cursor; clickable filters are visually distinct separate controls.

### C09 — EmptyState, skeleton, and error notice

**Prompt:** Replace one universal centered card with context-specific variants: a table empty-state occupies the table region, a missing image occupies the reserved media frame, a page failure gets a readable recovery block. Heading = what happened, body = consequence, action = next step. **Flow:** Loading reserves geometry. Empty data shows only after a completed request. No-matches offers Clear filters. Request failure offers Retry with retained context; retry goes pending and can't fire repeatedly. Use appropriate heading depth, not one level everywhere.

### C10 — Form fields, help, and validation

**Prompt:** Visible label above the field, helper immediately beneath/beside, error beneath without relying on a red border alone. Input text at main reading scale. Optional/required meaning explicit. No disappearing floating labels. **Flow:** Typing never moves focus. Validate on blur/submit; failed submit focuses a linked error summary. Correction clears only the resolved error. Pending submission preserves values and blocks duplicate submits. Field-level server errors sit beside the field; service failures sit at form level. Long textareas grow naturally, no decorative height animation.

### C11 — Modal, inspector, and confirmation shell

**Prompt:** Shared overlay hierarchy: header with identity/close, scrollable body, stable action area. A reading inspector can be non-modal at desktop widths; a narrow-screen editor becomes modal — distinguish the two semantics. **Flow:** Opening records the trigger, initializes content, moves focus. Closing a clean surface restores focus; dirty editing asks keep-editing-or-discard. Escape follows the same dirty-state rule. Background scroll blocked only for modal variants. No indefinitely stacking confirmation dialogs. Check long content, short viewport, virtual keyboard, 200% zoom.

### C12 — Copy action, tooltip, and transient notice

**Prompt:** Attach Copy to an actual full value (hash/receipt). Keep the displayed value selectable. Tooltip explains secondary context only — never essential instructions. **Flow:** Copy success shows only after the clipboard op actually succeeds; failure offers manual selection. Announce brief feedback without moving focus. Tooltip opens on hover and keyboard focus, closes on Escape, never blocks nearby controls. Toasts never carry the only record of a failed write or important receipt.

## Spatial and evidence controls

### C13 — Home terrain plate and caption

**Prompt:** Compose terrain, selected boundary, and one evidence anchor as a single dominant object. A 16px rounded outer frame may hold the scene, but captions align to a shared grid rather than floating. Source/date/provenance go in a quiet caption strip — no decorative sensor claims. **Flow:** Poster first, optional scene second, explicit interaction third. Pointer motion never affects the left headline or action group. Selection highlights a real record and exposes its link. An illustrative plate stays labelled. Mobile poster is a complete visual on its own; activation is optional. No blank canvas flash or layout jump.

### C14 — Summary metric band

**Prompt:** Show three or four useful summaries on one ruled band, not separate shadowed cards. Label above, tabular value below, unit adjacent, scope/source available. Left-aligned, consistent numeral baselines. Risk color belongs only on the relevant value. **Flow:** New data replaces old data without count-up. Unknown is an em dash with explanation, not zero. If a metric is also a filter shortcut, make that explicit and keyboard-operable; otherwise it's plain content. Phone layout: two columns or stacked pairs, labels don't shrink.

### C15 — Command queue row and severity filters

**Prompt:** Stable left identity region, right severity/status context per row. Selected state uses background plus edge rule. Compact filter group with an All option and explicit result count. Don't mix a state filter and a severity filter under one ambiguous label. **Flow:** Selecting updates ID immediately, then inspector/map. Filter changes preserve selection only if still visible; otherwise explain or reset — never silently select a different case. Keyboard users can select rows and trigger distinct actions without nested-control conflicts. Background updates don't move the focused row unexpectedly.

### C16 — Command quick actions

**Prompt:** Inspect existing verify/escalate handlers before relabelling. Show the action's actual consequence and current case ID. "Review evidence" is navigation; status mutation is a separate operation. **Flow:** A consequential status change captures reason/confirmation if required, then awaits an explicit persistence outcome. Other case content stays readable while pending. Rejection restores the previous status with an error — never show green because a local timer finished. Undo only if the backend can actually reverse it.

### C17 — Basemap switcher

**Prompt:** Preserve satellite/dark/topographic choices in SentinelMap with clear names and selected state. Compact segmented group or menu depending on width. No decorative thumbnails unless they're accurate previews. **Flow:** Switching changes the base layer while preserving extent, selected ID, overlays. Failed tile loading retains usable overlays with a source-specific notice. Attribution updates with the source. No duplicate layers from repeated switching. Mobile controls never cover zoom/attribution.

### C18 — Map layers and legend

**Prompt:** Visibility checkboxes beside human-readable layer names, legend explaining each geometry below. Hit area includes the label. Disturbance outlines, incident markers, drone observations stay visually distinguishable without relying on color alone. **Flow:** Toggle updates immediately, preserves underlying data. Turning off the selected feature's layer either keeps the inspector with "Layer hidden" or explicitly clears selection — pick one and document it. Legend explains, it isn't a hidden toggle. Unavailable data disables with a reason, not a fake empty layer.

### C19 — Time window control

**Prompt:** 7/14/30/90-day options with a clear date/time basis. State which observation timestamp is filtered and whether the window ends now or at a dataset cutoff. **Flow:** Selection updates query/scope, shows pending state where needed, rejects stale responses, then updates geometry/counts together. Preserve the selected ID only if within range. No data → offer a wider window. Fix the current cosmetic-only behavior.

### C20 — Marker, polygon, popup, inspector

**Prompt:** Differentiate point markers from boundary geometry; selected polygon gets a crisp outline with restrained fill. Popups stay concise: identity, type, Open details — full analysis lives in the inspector. Small marker visuals can have larger invisible hit areas without falsifying mapped size. **Flow:** Click/list selection opens matching detail; closing returns to the trigger without resetting the whole view. Popups must not obscure their own close control at viewport edges. Overlapping features need a selection list or clustering strategy, not random z-order. Missing coordinates stay inspectable in the ledger with a location-unavailable note.

### C21 — Map navigation and 2D/3D switch

**Prompt:** Zoom in/out, reset extent, and explicit view-mode controls with accessible names. Compass/reset orientation belongs only to a rotatable mode — no disabled decorative compass on a fixed north-up map. **Flow:** Mode switch preserves selected ID and fits a comparable extent. Loading 3D retains the 2D view until ready; failure keeps 2D, not a dead panel. Controls offer alternatives to dragging/pinching. Keyboard stepping and reset allow recovery from an unfamiliar camera angle.

### C22 — Satellite band tabs and metadata

**Prompt:** Present Dynamic World, NDVI delta, and true color as clearly selected choices with a short description of the active visualization. Dates, sensor, spatial resolution, source state in an adjacent readable metadata strip. **Flow:** Switching preserves comparison position and geometry, requests the correct layer where supported, shows unavailable bands honestly. Never animate one data representation into another as if intermediate colors were measurements. Keyboard navigation matches the chosen tab pattern.

### C23 — Before/after wipe

**Prompt:** Fine divider, conspicuous 44px handle contrasting against both imagery extremes. Before/after labels stay legible over changing pixels via stable opaque label backplates. Handle must not hide essential evidence. **Flow:** Drag tracks input directly; arrow keys adjust a small step, larger keyboard increments and numeric input are alternatives, reset returns to 50%. Position is accessible without announcing every pointer frame. Side-by-side is an optional mode with the same data. Release retains exact position. No autoplay wipe that blocks inspection.

### C24 — Candidate boundary action

**Prompt:** Place the action beside a summary of selected observations and an explanation of what will be produced. Preview includes boundary ID (if supplied), area, source pair, provenance. **Flow:** Prepare → inspect preview → save if supported. Pending can't claim a percentage without progress data. Invalid/empty geometry explains the failure. Demo preparation never says "committed." Repeated activation can't create accidental duplicates (idempotency is a backend concern). Saved record links to the actual result.

### C25 — Spectral index reading

**Prompt:** Each index is a ruled reading: name, before/after values, delta, one short interpretation. Consistent units/meaning. A tiny chart only if real sequence data exists — never decorative. **Flow:** Values update from the selected pair. Missing values are marked unavailable; sign change is explicit in text. Tooltip/detail explains the index without implying causation from one value. No dramatic red styling for every nonzero change.

### C26 — Drone mission selector

**Prompt:** Preserve the mission choices visible in drone/page.tsx but show real mission identity, date, availability when supplied. Selected state needs more than a color change. **Flow:** Changing mission updates its associated media/result, or clearly states the current selector is a demonstration. Never change only the label while retaining another mission's evidence. Dirty prompt/media state gets an explicit retain/discard decision. Missing mission media gets a scoped empty state.

### C27 — Upload and media replacement

**Prompt:** Labelled upload control with supported types/limits from the service contract. Drag/drop supplements, never replaces, the file chooser. Filename, file size (if known), Replace action appear before analysis. **Flow:** Choose → validate → preview → analyze. Canceling the picker changes nothing. Invalid file retains the previous valid media. Replacing media clears incompatible detection selection and warns about unsaved derived work. Revoke temporary preview resources on replacement/unmount. No false upload-success label for a local-only file.

### C28 — Detection threshold, boxes, and masks

**Prompt:** Pair the confidence slider with a numeric value and explanatory label. Boxes and masks are independent labelled checkboxes. The threshold control must not imply it reruns inference if it only filters existing detections. **Flow:** Adjusting threshold updates visible rows/overlays consistently. If the selected detection disappears, announce it and clear/mark the selection. A mask unavailable from the model gets an unavailable state — never paint a synthetic mask. Preserve slider focus during result updates.

### C29 — Analysis prompt and rerun

**Prompt:** Retain the current object-query input with a visible label and concise example. "Run analysis" is the clear primary action within the tool, not page-global. **Flow:** Validate required media/query → pending → result/error. Disable duplicate runs. Keep the prior result visible, explicitly labelled "previous," while a new run is pending. A late result for old media can't overwrite the current image. Failure preserves media/query and offers retry. No fake scanning beam or fabricated progress.

### C30 — Detection ledger and selected target

**Prompt:** List label, confidence, ID, available location/area metadata. Selection syncs row and overlay. Quiet outline and selected label — not a huge opaque box over the target. **Flow:** Hover previews emphasis; focus gives the same info; activation locks selection. Zoom/pan maintains coordinate alignment. Empty filtered results differ from no-detections-returned. Full result stays readable without canvas interaction. Missing GPS is not the same as zero latitude/longitude.

## Records, forms, reports, and recovery

### C31 — Incident search and filter bar

**Prompt:** Search has a visible purpose, clear button, result count. Status and severity stay separate selects. Align labels, control heights, gaps; wrap the group vertically on mobile instead of shrinking it. **Flow:** Local search can update immediately; future remote search may debounce without delaying keyboard feedback. Clearing search retains other filters. Clear all restores the documented default. Store shareable state where appropriate; preserve Back behavior. No-results offers recovery, not an alarming error.

### C32 — Incident table and row actions

**Prompt:** Align numbers by value, text by reading edge, dates consistently. Stronger header rule than body separators. Title flexible, ID compact, action targets large. Sticky headings must not obscure focus. Avoid zebra stripes + heavy borders + hover shadows all at once. **Flow:** Sort preserves selected ID. Row activation opens the case; embedded "Review evidence"/"Open triage" actions don't accidentally trigger the row handler. Mobile shows essential identity/severity/status/action grouping. Pagination/virtualization is optional pending real scale — never invent total counts.

### C33 — Triage editor fields and footer

**Prompt:** Header shows case ID/title, then status select, analyst input, notes textarea. Footer has Cancel and Save changes. Unsaved state shown quietly. Explain optional fields and required reasons. **Flow:** Opening copies the current record into a draft. Edits stay local until submission. Cancel discards only after appropriate dirty-state confirmation. Save waits for an explicit result; failure retains the draft, confirmed success updates the shared record. Concurrent-edit conflicts get recovery UI, not silent overwrite — don't invent concurrency guarantees the API doesn't have.

### C34 — Evidence pane and corroboration ribbon

**Prompt:** Satellite and drone panes get matching metadata hierarchy but keep their distinct content. The corroboration ribbon shows model result, explanation, scope, missing inputs — never blanket green approval. **Flow:** Load each source independently where possible. Partial completion stays readable. Fusion starts from the actual requested case. Missing one source = incomplete corroboration, not positive confirmation. A comparison diagram is explicitly explanatory; measured values appear only when supplied or correctly calculated.

### C35 — Integrity digest and signature action

**Prompt:** Short digest preview with access to the full selectable value, algorithm, source, check status. Signature review sits separately from the integrity display so a hash doesn't visually imply officer approval. **Flow:** Copy does not verify. Checking integrity (if supported) reports match/mismatch/unavailable. Signing (if supported) identifies the actor and record, confirms intent, awaits persistence, shows returned audit info. Local demo state stays labelled and can't produce an authoritative-looking success stamp.

### C36 — Analytics chart frame and methodology disclosure

**Prompt:** Title states the question, subtitle states scope, axes show units, legend uses direct labels. "View data" and "Methodology" sit near the chart. 2D encodings, consistent time intervals. **Flow:** Hover/focus reveals the same value; keyboard or a data table reaches every point. Missing periods are gaps, not zero. Changing scope updates chart, table, totals, and methodology context together. Estimates expose assumptions and source date. Keep explanatory text available when the chart can't render.

### C37 — Report incident picker and generation

**Prompt:** Picker identifies the incident by ID and title. "Generate report" is its own labelled action — not merged with download. Show source mode and required missing inputs before activation. **Flow:** Pick case → generate → server/local outcome → select returned report. Disable duplicates while pending. Failure leaves the existing library/preview intact. A returned report must reference the selected incident — never optimistically add a completed dossier before generation succeeds.

### C38 — Report library, preview, and export

**Prompt:** Library rows show title, incident ID, creation time, status. Preview: quiet paper surface, readable text, separate toolbar. Page shadows suggest document boundaries only — no decorative nested cards inside the dossier. **Flow:** Selection loads the matching report without resetting library scroll. Print/download actions expose real behavior — if it opens browser print, label it that way rather than implying a server download. Handle popup/print limitations gracefully. Long reports preserve table headings, page margins, full hashes, evidence captions. Preview and exported content identity must match.

### C39 — Public observation form and receipt

**Prompt:** Plain sequence of labelled fields: reserve, disturbance type, coordinates, description. Explain coordinates with an example and validation — never prefill a real-looking location as the citizen's observation. Description field generous and readable. **Flow:** Submit validates and focuses linked errors. Pending preserves content. Real acknowledgment shows a copyable receipt and a concise explanation; local simulation says it's a simulation. "Submit another" resets deliberately after success, not while a request is unresolved. No implied automatic location request or attachment field this redesign doesn't actually add.

### C40 — Public transparency statistic

**Prompt:** Pair each published figure with what it measures, period, provenance. Moderate scale — not promotional oversized proof. Unknown/unapproved values get an explicit sample or unavailable treatment. **Flow:** Refresh changes values only with a real source response — no animated count-up, no false real-time label. Detail links reveal methodology only if it actually exists. A nearby privacy icon must never imply an anonymity guarantee the service hasn't established.

### C41 — Admin credential/configuration field

**Prompt:** Group fields by service with a short purpose statement. Distinguish secret values from non-secret endpoints. Masked existing credentials indicate configured state without shipping the secret to the browser; replacing is an explicit action if supported. **Flow:** Edit → dirty → validate → save → returned outcome. Never log or echo secrets. A test action uses the intended draft/saved configuration consistently and says which. Missing permission is stated explicitly. A browser reload must not appear to retain unsaved in-memory changes.

### C42 — Connection test and save feedback

**Prompt:** "Test connection" and "Save configuration" get distinct labels and results. Feedback sits near the owning service, with time and a safe summary when supplied. No global success banner for one tested subsystem. **Flow:** Pending blocks duplicate tests but not unrelated reading. A timeout/failure includes a next step without exposing credentials or internal payloads. Saving doesn't imply a test ran. Testing a notification channel doesn't imply message delivery unless the result actually establishes delivery.

### C43 — Copilot conversation and composer

**Prompt:** Header names the assistant and current scope. Messages have readable measure, restrained role distinction, clear source/reference links. Composer stays reachable above the mobile keyboard; suggested prompts sit quietly above it. **Flow:** Submit appends the user message plus a pending response state. Failure offers retry without duplicating messages. New messages don't force-scroll someone reading older content — offer a new-response affordance instead. Suggestions keep their real behavior: sending a prompt is not executing a mutation. Clear/reset, if kept, explains what it removes. Referenced incidents open their specific IDs and preserve return context where possible.

### C44 — Error boundary, not-found, and retry

**Prompt:** Recovery pages stay visually related to the app, with a plain heading, short consequence, clear action. No technical stack traces in public UI. Not-found distinguishes an unknown route from a missing record inside a valid route. **Flow:** Retry invokes the actual recovery action and shows pending feedback where meaningful. Persistent failure stays an error — never simulate success. Home/command links provide a safe way out. Preserve useful case/filter context in recovery links when known. No spinning globe, humorous missing-tree illustration, or heavy background effect competing with recovery.

---

## Completion checklist (apply when wrapping up any C-prompt)

For each prompt, record before calling it done: current source owner, changed files, preserved props/handlers, final layout, all applicable states, keyboard path, mobile behavior, motion/reduced-motion behavior, source/backend dependency, and any unresolved limitations. **A checked box without evidence is not completion.**

Before shipping, reconcile every current button, link, input, select, textarea, range, file input, checkbox, row action, and canvas hit target against this catalogue. Any newly discovered control gets its own brief using the Universal Wrapper above — don't silently remove a control just because it isn't listed here.
