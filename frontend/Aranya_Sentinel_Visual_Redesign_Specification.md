**FIELD INTELLIGENCE / DESIGN SYSTEM / 01**

Aranya Sentinel

A complete visual redesign & interaction specification

*From a utilitarian collection of pages to a memorable, calm, high-trust forest intelligence workspace.*

<table style="width:100%;">
<colgroup>
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>CANOPY<br />
#183C2D</strong></th>
<th><strong>MOSS<br />
#52765C</strong></th>
<th><strong>PAPER<br />
#F4F1E7</strong></th>
<th><strong>BONE<br />
#FFFEF8</strong></th>
<th><strong>SIGNAL<br />
#C96C3D</strong></th>
<th><strong>CRITICAL<br />
#B94236</strong></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Prepared from the supplied src archive and a route-by-route review of the Next.js implementation. The .next archive was treated as compiled development output—not as an editable design source.

Scope: 11 routes, global shell, navigation, map canvas, satellite comparison, drone detection canvas, copilot, reports, shared data and status language.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>THE CENTRAL DESIGN IDEA<br />
</strong>An editorial field-intelligence console. Think archival survey atlas meets contemporary geospatial operations software: beautifully typeset, spatially calm, and exact when the work becomes urgent.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 01 / Executive direction

The current interface is not suffering from one isolated font or color mistake. The visual grammar is inconsistent between pages and within components. The source already contains a promising “Furrow” foundation, but that foundation has not been made into a rigorous system and is contradicted by multiple competing token vocabularies, tiny type, mixed corner treatments and map-specific styling.

| **Observed source issue**                                                                                                                          | **Why it weakens the experience**                                                     | **Required correction**                                                                                                     |
|----------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Main application pages commonly force text-xs (12px) at the page container.                                                                        | Dense reading, low legibility and a cramped “debug tool” feeling.                     | Set 14px minimum for dense metadata; default UI body 15–16px; labels 12–13px only when secondary.                           |
| CSS declares paper/ink/green/orange tokens but components mix legacy names such as bg-surface, content-primary, border-subtle, forest and raw hex. | The same conceptual surface can render differently by route; semantic intent is lost. | One canonical token layer, one documented alias bridge, no raw colors in page components.                                   |
| Rounded-pill buttons and 6px “key” controls coexist with 10px cards, 14px entry cards and map HUDs with their own radius language.                 | No consistent shape rhythm; the UI feels assembled.                                   | Use 8px controls, 12px cards, 16px large feature panels; reserve pills for compact tags only.                               |
| Global header/sidebar, each route and specialist canvases feel like separate products.                                                             | The user must repeatedly relearn what matters.                                        | Standard shell and page-heading contract; page-specific density is allowed, page-specific design language is not.           |
| The page heading treatment is mostly a single font-size + icon + description.                                                                      | No strong typographic art direction.                                                  | Use a two-family headline system: elegant editorial display phrase + compact technical/eyebrow metadata.                    |
| Mock/fallback data and optimistic status copy sit alongside “connected”, “ready”, “committed” language.                                            | The design can overstate whether backend actions actually happened.                   | Make demo/local/offline/connected states visually and semantically distinct; never present a simulated action as completed. |

## What “jaw-dropping” means for this product

- It is not a marketing landing page inside an operations app. The operational screens should be poised, exceptionally clear and information-rich without feeling dense.

- The memorable signature is the type composition, restrained forest palette, cartographic linework, generous negative space and high-quality real imagery—not gradients, glow or constant animation.

- The most visually expressive surfaces should be Home, the Command Centre, Satellite comparison, GIS Map and the dossier preview. Incident triage, verification and administration should lean on clarity and precision.

- Every screen must still look finished with all motion disabled. Animation is a refinement and an explanation of state, never a substitute for visual design.

# 02 / Design method and skill interpretation

| **Reference / tool**             | **What it contributes**                                                                                                                                        | **How it is applied here**                                                                                                                                                                         |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Hallmark                         | Selects a distinctive design material and macrostructure; audits AI-generated anti-patterns; differentiates screens by task rather than reskinning a template. | Choose the “field atlas / editorial instrument” design fingerprint. Use audit gates: hierarchy, theme consistency, purposeful variation, real imagery, mobile integrity, focus and reduced motion. |
| Impeccable                       | Art-direction, critique, UX hierarchy, layout, color, typography, motion and craft floors. Requires rendered checks and a clear product point of view.         | Use the operate/read distinction: operational screens favor precision and restraint; public-facing home/transparency may be more atmospheric. Validate at shipped breakpoints.                     |
| Design Taste                     | Studies curated website compositions, typography, color and imagery as a design language; avoids describing a design only with vague words.                    | Build a small inspiration board from the references named below, extract DNA (composition, contrast, type pairing, image treatment), then create original pages—not clones.                        |
| UI/UX Pro Max                    | Measured usability guidance: accessibility, touch targets, performance, responsive behavior, typography, color, charts, forms and motion patterns.             | Apply 16px base body text, 44px touch targets, WCAG contrast, clear field labels, inline validation, accessible chart legends and responsive grids.                                                |
| Framer Motion / Motion           | Component-level interaction choreography and presence/transition handling.                                                                                     | Use for route transition, drawer, panel, card and small state transitions only; keep map rendering independent.                                                                                    |
| Lenis                            | Smooth scrolling with native scrolling behavior and input consistency.                                                                                         | Optional, only on public/long editorial pages. Do not add it to the fixed-height operational shell or GIS map where native scroll and wheel precision matter.                                      |
| GSAP + ScrollTrigger             | Timeline control and scroll-linked choreography.                                                                                                               | Use for 1–2 editorial storytelling moments on Home/Public only; never use scroll-jacking in operational tables or map workflows.                                                                   |
| Vanta.js                         | WebGL animated backdrop effects.                                                                                                                               | Not recommended as a default. If used at all, use a single low-motion atmospheric hero on the public page with static fallback, no effect on dashboards/maps.                                      |
| OpenMoji / motion references     | Potential source of animated micro-interaction ideas and iconography.                                                                                          | Use Lucide already in the repo for functional icons. Do not mix emoji-like OpenMoji art with the fine-line GIS icon set. Borrow motion principles only when they clarify state.                    |
| Uppbeat                          | Potential music/sound source.                                                                                                                                  | No ambient sound on an operations console. Optional opt-in sound for a critical alert is a future feature, muted by default, with user control and licensed asset verification.                    |
| Supahero / Log System references | Visual references for hero composition, typography, spatial hierarchy and system-like layout.                                                                  | Extract one or two useful composition ideas; reject oversized marketing patterns on command, analytics, incident and map routes.                                                                   |
| Best Free Fonts                  | Discovery source for font families.                                                                                                                            | Use it to inspect specimens and licensing; choose only typefaces with a verified license, web files/variable axes, adequate numeral support and clear pairing roles.                               |

Skills availability note: Hallmark, Impeccable, Taste Skill and UI/UX Pro Max repository guidance was inspected from GitHub/repository material. They are design methodologies, not magic switches. The exact downloaded skill folder versions on the user’s machine were not present in the supplied ZIP, so this document records the intended interpretation and workflow rather than claiming to have executed local skill commands.

# 03 / Visual identity: the field atlas

## 3.1 Product personality

| **Axis**  | **Decision**                                                                                                                                                        |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Character | Field-scientific, calm, credible, quietly premium, evidence-led.                                                                                                    |
| Materials | Warm archival paper, deep canopy ink, translucent map overlays, fine cartographic rules.                                                                            |
| Contrast  | Light editorial surfaces for reading; dark green instrument surfaces for spatial canvases and focused command panels.                                               |
| Signature | Oversized editorial title + small all-caps field identifier + tabular data + delicate contour-line motif.                                                           |
| Avoid     | Generic SaaS purple/blue gradients, neon green, random glassmorphism, excessive badges, giant empty hero cards, over-rounding, card grids with identical treatment. |

## 3.2 Palette tokens

| **Token**     | **HEX target** | **Use**                                                    | **Restrictions**                                |
|---------------|----------------|------------------------------------------------------------|-------------------------------------------------|
| Canopy 950    | \#183C2D       | Primary brand surface, dark shell accents, primary button. | Use sparingly as a large field, not every card. |
| Canopy 800    | \#28513D       | Hover, selected nav, dark secondary surfaces.              | Do not use as body text on dark canopy.         |
| Moss 600      | \#52765C       | Positive/healthy, secondary accent, vegetation context.    | Not for warning or general decoration.          |
| Moss 100      | \#E6EDE3       | Soft success and selected contextual backgrounds.          | Pair with dark forest text.                     |
| Paper 100     | \#F4F1E7       | Main page canvas.                                          | Avoid flat \#fff everywhere.                    |
| Bone 50       | \#FFFEF8       | Cards, reading sheets, dialogs.                            | Use for primary reading surface.                |
| Sand 200      | \#E7E1D3       | Borders, separators, subtle fills.                         | Thin rules should remain visible.               |
| Ink 900       | \#202923       | Primary text.                                              | Never use pale grey for primary content.        |
| Ink 600       | \#59645C       | Secondary text.                                            | Check 4.5:1 contrast for body text.             |
| Signal orange | \#C96C3D       | Primary action, selected feature, actionable detection.    | Never color every heading orange.               |
| Critical red  | \#B94236       | Critical severity only.                                    | Never use as a general accent.                  |
| Water slate   | \#587B8B       | Water/map hydrology data only.                             | Keep spatial semantics consistent.              |

These are target design values, not a claim about exact current CSS color rendering. The current CSS uses OKLCH; preserve perceptual consistency by defining canonical OKLCH variables or converting these values into consistent perceptual equivalents. Components should consume semantic variables such as --surface-canvas, --surface-card, --text-primary and --status-critical, not raw hex values.

## 3.3 Color architecture

- Canvas: Paper 100. Raised reading cards: Bone 50. Quiet secondary zone: Paper 200/Sand 200. Use white as a highlight, never as the sole product background.

- Primary navigation and action: Canopy 950. Selected route may have a slim Signal-orange keyline plus a pale Moss tint—not a saturated block.

- Risk is semantic: Critical red, High amber-orange, Watch ochre, Informational blue-slate, Verified moss. Each state needs icon/text/shape, not color alone.

- Maps retain their own data palette, but the controls and legends must use the same card, text, radius and spacing system as the rest of the app.

- Dark map canvas: charcoal-canopy \#17241D, not pure black. Satellite imagery remains imagery-led; UI overlays stay opaque enough to read.

## 3.4 Typography: controlled three-voice system

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Recommended pairing<br />
</strong>Display / editorial: Instrument Serif (or Newsreader if it tests better). Product UI: Manrope. Data / coordinates / technical labels: IBM Plex Mono. This is three type roles, not three fonts in every component.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Role**         | **Family**       | **Weight / size**                                                                  | **Where**                                                                    |
|------------------|------------------|------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| Display / hero   | Instrument Serif | Regular 400; 48–64px desktop; 38–44px mobile. Italic only for one phrase fragment. | Home hero, public portal hero, selected editorial section titles.            |
| Page headline    | Manrope          | 600–700; 30–36px desktop, 27–30px mobile; line-height 1.05–1.12.                   | App page titles and primary section headings.                                |
| UI / body        | Manrope          | 400–500; 15–16px body, 14px dense tables, 13px helper copy.                        | Navigation, labels, cards, forms, tooltips.                                  |
| Label / eyebrow  | Manrope          | 600; 11–12px, tracking +0.08em, uppercase.                                         | Section identifiers, time range labels, tiny context cues.                   |
| Data / technical | IBM Plex Mono    | 400–500; 12–14px; tabular numerals.                                                | IDs, coordinates, latencies, model names, hashes, timestamps and KPI values. |

Current implementation uses Red Hat Display/Text/Mono via Google Fonts. It is not intrinsically “bad”; it is simply deployed with insufficient scale contrast and weak hierarchy. The proposed switch to Instrument Serif + Manrope + IBM Plex Mono is a directional choice. Before adoption, compare actual specimen text, numeral shapes, x-height, italics and web license. Do not load fonts from a font-index page without checking the original foundry license and hosting requirements.

## 3.5 Mixed-font heading art direction

Use mixed typography in no more than two high-visibility locations per page. A good treatment is a single headline containing one serif phrase and one Manrope phrase, with the serif italic phrase carrying emotion or geography. Never split arbitrary words across fonts just to look decorative.

| **Example composition**                             | **Treatment**                                                                                                                                                               |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| “A living picture of the forest.”                   | “A living picture” in Instrument Serif 58px / italic only on “living”; “of the forest.” in Manrope 48px 650. One line at wide desktop; 2 deliberate lines on tablet/mobile. |
| “Deforestation intelligence, grounded in evidence.” | Manrope 34px 650; “grounded in evidence” Instrument Serif 36px italic. Keep baseline aligned and no word collisions.                                                        |
| “Command / Western Ghats”                           | Manrope headline 32px; small mono route code and region code on the same baseline or under it, not a decorative multi-font collage.                                         |

# 04 / Layout, spacing and responsive grid

| **Token** | **Value** | **Usage**                             |
|-----------|-----------|---------------------------------------|
| space-1   | 4px       | Icon/text nudge, tiny internal gaps.  |
| space-2   | 8px       | Compact label-to-value spacing.       |
| space-3   | 12px      | Small component gap.                  |
| space-4   | 16px      | Default control/card inner gap.       |
| space-5   | 20px      | Dense section gap.                    |
| space-6   | 24px      | Default card padding and page rhythm. |
| space-8   | 32px      | Section spacing.                      |
| space-10  | 40px      | Large section break.                  |
| space-12  | 48px      | Hero/content separation.              |
| space-16  | 64px      | Editorial separation.                 |

| **Breakpoint** | **Behavior**                             | **Rules**                                                                                                                             |
|----------------|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| ≤ 639px        | Single-column and simplified navigation. | Top bar 56–60px; drawer navigation; KPI cards 2 columns; tables become stacked rows or horizontal scroll with pinned key column only. |
| 640–767px      | Compact tablet.                          | Page padding 20px; two-column card grid; map overlays collapse into drawers.                                                          |
| 768–1023px     | Tablet / small laptop.                   | Sidebar collapses to icon rail or drawer; main page 24px gutters; no 12-column command layout if map becomes too narrow.              |
| 1024–1439px    | Standard desktop.                        | Sidebar 248px; header 68px; content max width 1480px; main content 28–32px padding.                                                   |
| ≥ 1440px       | Wide workspace.                          | Sidebar 264px; content max width 1600px; map/preview expands; typography may scale fluidly, not infinitely.                           |

Do not use h-screen + w-screen + nested overflow-hidden as a global layout primitive without testing short viewports and mobile safe areas. The current AppShell uses h-screen w-screen overflow-hidden and an inner scroll region. It can remain for desktop operations only if the header/sidebar are stable and all content has a single, intentional scroll owner. On mobile use min-height: 100dvh and allow the content to scroll naturally.

## 04.1 Geometry and alignment rules

- Main page content uses a consistent 24–32px desktop inset and 16–20px mobile inset.

- Align page title, KPI grid, data table and feature panel to one shared left/right content edge. Avoid each page inventing max widths (1300, 1400, 1600) without a reason.

- KPI cards: equal heights within a row, stable label/value baselines, consistent icon placement; do not force the same visual layout on map or document preview modules.

- Use CSS grid minmax(0, 1fr) for flexible columns; every map, canvas and table container must have min-width: 0 to prevent overflow.

- Use aspect-ratio for image and map thumbnails; reserve space before images load to prevent layout shift.

- Never place critical metadata at a map panel edge where attribution, zoom controls, selection controls or the system drawer can overlap it.

# 05 / Component design language

| **Component**        | **Specification**                                                                                            | **States / edge cases**                                                                                    |
|----------------------|--------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| Button / primary     | 44–48px height; 8px radius; 14px Manrope 650; canopy fill; 16px icon; 16–20px horizontal padding.            | Hover: 2% brighter; active: translateY(1px); focus: 2px outline offset 2; disabled: muted fill and reason. |
| Button / secondary   | Bone surface; 1px Sand border; ink label; no heavy shadow.                                                   | Hover Sand 200; active subtle darken.                                                                      |
| Button / destructive | Critical red fill only when action is destructive and confirmed.                                             | Use confirmation dialog for irreversible action.                                                           |
| Card / standard      | Bone background; 1px subtle border; 12px radius; 20–24px padding; shadow almost imperceptible.               | No card shadow on every element; hover only for interactive cards.                                         |
| Card / feature       | Canopy dark background or warm featured surface; 16px radius; large typography; editorial inner composition. | Only one or two per screen.                                                                                |
| Badge / status       | Pill 999px radius; 11–12px text; icon + label; tinted background with adequate contrast.                     | No more than two adjacent badges; show descriptive label, avoid cryptic all-caps.                          |
| Input / select       | 44–48px height; 8px radius; 1px border; 14–15px text; visible label above.                                   | Focus ring; invalid state includes inline message; disabled state visually distinct.                       |
| Table                | 14px text; 44px row minimum; 12px horizontal padding; 1px horizontal dividers.                               | Sticky header where useful; responsive overflow wrapper; loading, empty, error, filtered-empty states.     |
| Tabs                 | 40px height; text-led; selected underline or pale moss surface.                                              | Keyboard arrows; focus; scrollable tab strip on narrow screens.                                            |
| Drawer               | Desktop width 400–480px; mobile full-screen / near-full-screen.                                              | Focus trap, Escape, restore focus, scroll locking; keep content scroll separate from action footer.        |
| Modal                | Max width 560px for standard forms; 720px for rich evidence.                                                 | Avoid nested modals; confirm risky actions; accessible title/description.                                  |
| Map overlay          | Bone at 94–98% opacity, 10–12px radius, thin dark border, 12–14px UI.                                        | Reserve safe areas around zoom, scale and attribution; mobile move into bottom sheet.                      |
| Tooltip              | 12px UI, max 280px, dark canopy background, 6px radius.                                                      | Delay ~300ms; touch alternatives; never essential-only content.                                            |
| Empty state          | Concise title, one sentence, relevant icon/illustration, one recovery action.                                | No meaningless “No data” placeholder without explaining what to do.                                        |
| Toast                | One line title + optional detail; status-specific icon; max width 420px.                                     | Auto-dismiss non-critical after 4–6s; critical remains until action or acknowledgment.                     |

## 05.1 Iconography

- Keep Lucide as the single functional icon family already used in the repository. Standard stroke 1.7–1.9px; 16px in controls, 18–20px nav, 24px feature icon.

- Do not mix filled OpenMoji emoji-style assets with Lucide outline glyphs for the core dashboard. A custom forest illustration can exist as a separate illustration system.

- Use icons with labels where the icon meaning may be ambiguous. Icon-only controls need aria-label, tooltip and 44px hit area.

- Never use icon color as the only indicator of success, warning or danger.

# 06 / Global shell: shared across all operational pages

## 6.1 Top navigation bar

Source: src/components/layout/Navbar.tsx

| **Region**      | **New visual treatment**                                                                                                | **Behavior / fixes**                                                                                               |
|-----------------|-------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| Brand mark      | A compact custom Aranya mark: canopy/contour motif and wordmark. Wordmark Manrope 650; small mono “FIELD INTELLIGENCE”. | Home link must be obvious; avoid just using a satellite icon as brand identity.                                    |
| Region selector | A text-led selector showing region name, jurisdiction and a small chevron; optional tiny map thumbnail.                 | Dropdown width 320–380px; search/filter when region list grows; keyboard navigable.                                |
| Alert center    | Bell icon with count; critical dot / count, not a giant red badge.                                                      | Drawer panel with severity, time, jurisdiction, one primary “Review incident” link; mark read and no-alert states. |
| AI copilot      | Primary but visually secondary action: “Ask Sentinel” with command-key hint.                                            | Use drawer with conversation history, contextual prompts and close button; shortcut must not hijack input typing.  |
| System status   | Small status indicator plus human-readable backend state.                                                               | Show “Connected”, “Local demo”, “Offline” or “Checking”. Do not label fallback browser emulation as connected.     |

## 6.2 Sidebar

Source: src/components/layout/Sidebar.tsx

- Keep the existing 5 information groups but reduce navigation label verbosity. Proposed order: Command, Map; Satellite, Drone; Incidents, Evidence; Analytics, Reports; Public portal, Settings.

- Group headings 11px uppercase Manrope 700 with letter spacing, low contrast but still readable. Nav rows 42–44px high with 10px radius, icon 18px and 12–14px gap.

- Active route: pale moss row + 3px canopy/orange vertical indicator; do not use a rounded pill for every link. Hover is a quiet background transition.

- Badges only for dynamic alert count or a highly relevant live sensor condition. Static “10 m live”, “14 d pass”, “sha-256” metadata should move into route descriptions or tooltips.

- Footer should show a clear environment state and build version. “Evidence integrity” belongs in verification/reporting, not as an always-green decorative stamp.

## 6.3 App content frame

Source: src/components/layout/AppShell.tsx

- Desktop: fixed 68px top bar, 248px sidebar, independently scrollable main content with background Paper 100.

- Page-level content max width 1480px by default. The full-bleed GIS page and command centre are explicit exceptions.

- Use a shared PageHeader component: eyebrow + title + optional serif accent phrase + supporting description + right-side actions.

- Use a shared PageSection heading: title, helper copy, optional action. Standardize separators and spacing.

- Mobile: 56px top bar; sidebar via accessible sheet; persistent bottom action bars only when the current task benefits.

# 07 / Page-by-page redesign blueprints

The following is the implementation handoff. Page order follows the user-facing route hierarchy. Every page should be reviewed at 1440px, 1024px, 768px and 390px widths. A 320px smoke test should catch catastrophic overflow.

## 07.1 Home / Product overview

Source: src/app/page.tsx

Current role / critique: Public-facing overview and entry point. This route currently has a 4xl–5xl heading, metric cards, sections and a table, so it is the right place for the clearest editorial personality.

Design objective: Make a strong first impression without disguising a serious operational platform. Establish what Aranya Sentinel does and route users quickly to operations.

Page composition: Hero: a two-column editorial composition. Left: small eyebrow “FOREST INTELLIGENCE / WESTERN GHATS”, mixed serif+sans headline, 2-line explanatory statement, primary “Open command centre” and secondary “Explore the map”. Right: one large, real satellite/forest evidence image or rendered map crop framed by cartographic annotations (region code, sensor/date, 10 m resolution). Under hero: a thin facts strip, not four generic cards. Then “How evidence becomes action” as a three-step horizontal process with distinct geometry; then selected active monitoring regions or latest verified event; then a restrained footer.

Typography / color / visual finish: Typography: 56–64px desktop display, 40–44px mobile; body 17px; section headings 28–32px. Hero art should be authentic satellite/forest imagery, not fabricated map texture. Use subtle contour lines as background detail.

Responsive / overlap / functional safeguards: Avoid card grid of three identical sections; avoid small 12px paragraph copy; avoid fake proof/statistics; label modeled/demo values clearly; ensure CTA sits above the fold at 768px height. Mobile stacks image after headline and retains both CTAs.

## 07.2 Command Centre

Source: src/app/command/page.tsx + src/components/map/SentinelMap.tsx

Current role / critique: Primary operations screen. Current composition: four KPI cards then 8/4 column map/side panel with min-height constraints.

Design objective: Let an operator understand alert pressure, geography and the next action in under 5 seconds.

Page composition: Header title “Command centre” with small shift/region/date context and one right aligned action. KPI ribbon: Critical alerts, new incidents, detected area, verified cases; use varying semantic accent only where status requires. Main grid 8/4: large map with clean dark-canopy map surface; side stack: “Priority incident” featured card with severity, area, time, jurisdiction and review action, then compact activity timeline. Put a small “Monitoring coverage” status below map only if meaningful.

Typography / color / visual finish: Map height 560–640px desktop, 420px tablet, mobile 58vh with inspector in bottom sheet. Feature incident card gets 16px title and one large metric. Use tabular numerals.

Responsive / overlap / functional safeguards: Current KPI and map sizing may feel squeezed at 1280px when sidebar is present. At widths under 1200px switch side panel beneath or use 7/5 only after verifying. No overlap between marker clusters, legends, attribution and HUD. Show backend/demo provenance in page header or status area.

## 07.3 GIS Map

Source: src/app/map/page.tsx + src/components/map/SentinelMap.tsx

Current role / critique: Full-bleed spatial analysis canvas with toolbar and floating information panels.

Design objective: The map is the product’s main instrument; keep chrome minimal and make overlays feel deliberate.

Page composition: Use full-bleed map below global nav. Top-left: region and time-window selector. Top-right: layer control, search, locate, map style. Left vertical tool rail: select, draw, measure, layer stack. Right inspector drawer for selected incident/disturbance, with clear expand/collapse. Bottom: compact legend and scale/coordinates. On mobile use a bottom-sheet inspector and floating layer/search buttons.

Typography / color / visual finish: Map canvas charcoal-canopy or satellite imagery; panels Bone 96% with thin boundary and 12px radius. Toolbar hit targets 44px. Mono coordinates 12–13px.

Responsive / overlap / functional safeguards: Current map page has bottom-left/bottom-right overlays; enforce safe margins and collision rules at 1024/768/390. Use pointer-events only on controls, not the whole overlay. Ensure attribution and Leaflet zoom controls are not covered. Avoid tiny 9px labels in SentinelMap.

## 07.4 Satellite & Change Detection

Source: src/app/satellite/page.tsx + src/components/satellite/SwipeComparison.tsx

Current role / critique: Before/after swipe comparison, band selection and generated candidate polygon.

Design objective: Make temporal change legible and explain why the system believes the area changed.

Page composition: PageHeader with region/time context. A broad comparison panel (minimum 16:9) with draggable divider, date labels anchored in each side, clear “Earlier / Latest” tags, visible source/sensor and cloud cover. Place band controls above comparison as segmented tabs. Below: 3-column evidence summary—Canopy change, bare-ground expansion, affected area—then “Model interpretation” with confidence and corroboration. Candidate polygon action is a clear workflow action with pending/success/failure state.

Typography / color / visual finish: The image comparison must dominate. Use thin white divider handle with accessible 44px drag area, orange outline on candidate polygon and muted forest overlays. Keep text over imagery on dark translucent readable plate.

Responsive / overlap / functional safeguards: The source draws fake imagery in SwipeComparison; ensure the screen identifies generated/simulated image data unless a real imagery tile is loaded. Current 1400px inner image width and fixed sizing can crop on small screens; replace with responsive container dimensions and pointer/touch-aware drag. Make keyboard-accessible slider equivalent.

## 07.5 Drone Vision Studio

Source: src/app/drone/page.tsx + src/components/drone/DroneCanvas.tsx

Current role / critique: Upload aerial imagery/video, run Grounding DINO + SAM2 detection, toggle boxes/masks and inspect selected target.

Design objective: Make the computer-vision result the hero, with tools in a predictable control surface.

Page composition: Header: “Aerial vision” + mission selector, model status, upload action. Large image canvas 70% width and inspection panel 30%. Put detection toggles and confidence threshold in a compact toolbar above canvas. Selected detection details in persistent right panel: class, confidence, box/polygon stats, evidence action. Below canvas show detection list and inference metadata.

Typography / color / visual finish: Use a real uploaded image as the base. Detection masks: transparent signal orange; object boxes: moss; selected object: thicker light outline. Label plates use 12px Manrope with mono confidence.

Responsive / overlap / functional safeguards: Current canvas paints a synthetic forest background and draws detection boxes; this must be marked “Sample scene” until a real file is processed. Current labels at 11px may be hard to read; ensure label backgrounds remain inside canvas bounds and reflow on edge collisions. Video upload must show progress/unsupported states. Canvas selection needs focusable companion list.

## 07.6 Incident Matrix

Source: src/app/incidents/page.tsx

Current role / critique: Search/filter incident table with selected incident inspector, notes and status update actions.

Design objective: This is a triage workbench, not a decorative dashboard. Optimize scan speed and low-error decisions.

Page composition: PageHeader plus compact count summary. Filters row: Search, status, severity, jurisdiction, reset. Table with pinned severity/status indicators, incident ID, detected time, location/jurisdiction, area, source and assigned analyst. Right inspector panel on desktop; full detail drawer on tablet/mobile. Include activity trail and evidence link.

Typography / color / visual finish: Default row 48–56px; 14px body; IDs in IBM Plex Mono; severity shown as text + shape/icon; selected row pale moss. Table header 12px medium.

Responsive / overlap / functional safeguards: Current all-page text-xs is too small for incident triage. Keep horizontal scroll contained and provide visible cue. Do not show a blank inspector when no row is selected; use a clear empty state. Saving notes/status should show pending, success or error based on actual API result, not just optimistic UI.

## 07.7 Evidence Fusion / Verification

Source: src/app/verification/page.tsx

Current role / critique: Combines multiple sources of evidence, provenance and integrity to verify incident.

Design objective: Communicate chain of evidence and confidence, not just a row of technical cards.

Page composition: Header with incident ID and verification status. Visual evidence flow: Satellite observation → drone detection → external alert / ranger evidence → fused conclusion. Each source node shows date, source, relevant thumbnail or metric and provenance. Central fusion panel shows agreement/corroboration score, confidence explanation, limitations and final state. Bottom timeline/chain-of-custody section with hashes.

Typography / color / visual finish: Flow connectors are fine-line cartographic paths. Use visual states: received, matched, corroborated, unresolved. Use one focal score, not multiple competing percentages. Mono hashes in compact but selectable text blocks.

Responsive / overlap / functional safeguards: Hashes must wrap safely or have copy control; never overflow beyond card. Use text labels for provenance. Avoid implying cryptographic verification unless hash checks actually ran. Distinguish “computed”, “matched” and “verified” carefully. At mobile collapse flow into ordered steps.

## 07.8 Forensic Dossiers / Reports

Source: src/app/reports/page.tsx

Current role / critique: Select report, generate report, display preview and download dossier. Current source includes generated HTML string and inline styles.

Design objective: Make a document workspace that feels like a professional investigation dossier and prints beautifully.

Page composition: Two-column layout: left dossier list and generation controls; right document preview. Preview uses paper-like sheet, consistent type hierarchy, evidence cover strip, incident summary, methodology, source records, findings, caveats, map/photo plate, signature and verification footer. Toolbar: Download PDF / Print / Copy link (only if implemented).

Typography / color / visual finish: Document typography: Manrope UI; dossier title 30–36px; serif 28–32px for title cover; body 10.5–11.5pt print; metadata 9–10pt mono. Page preview width ~760px.

Responsive / overlap / functional safeguards: Sanitize generated HTML and avoid injecting untrusted user text unsafely. Separate report template CSS from application CSS. Print stylesheet controls page-break-inside, margins and image resolution. Make the report accessible as semantic HTML before export.

## 07.9 Public Transparency Portal

Source: src/app/public/page.tsx

Current role / critique: Public tip-off form with supporting transparency metrics and explanatory content.

Design objective: Make reporting approachable and trustworthy; the visual world can be a little more editorial than the operator console.

Page composition: Hero: “Your local knowledge can protect the forest” with clear privacy/reassurance explanation. Form as a 2-step progressive flow: Where? What did you see? Add optional coordinates/photo; review and submit. Right rail: response expectations, privacy, what happens next, emergency caveat. Post-submit receipt screen with reference ID and next steps.

Typography / color / visual finish: Use serif phrase in hero, generous spacing, pale forest topographic motif. Form labels 14px, inputs 48px, helper copy 13px.

Responsive / overlap / functional safeguards: Do not imply anonymity or guaranteed dispatch unless the backend supports it. Current fake receipt/timeouts must be labeled local demo if not backed by API. Provide clear validation, coordinate formatting and upload constraints. User can submit with keyboard and screen reader.

## 07.10 Analytics

Source: src/app/analytics/page.tsx

Current role / critique: KPI metrics, monthly disturbance bar chart and table.

Design objective: Turn raw totals into interpretable trends and explain assumptions.

Page composition: Header plus time range/region filters. Top row 3–4 KPI cards with comparison period and methodology cue. Main visualization: time series of affected area by month with accessible axes/tooltips, anomaly markers and baseline. Secondary charts for type/region distribution. Below table of high-impact regions or trends. “How metrics are calculated” methodology disclosure.

Typography / color / visual finish: Charts use Moss for baseline, Signal orange for selected/alert, Critical red only for critical markers. Keep legend and labels visible. KPI values 32–40px Manrope/mono; units 13px.

Responsive / overlap / functional safeguards: Current hardcoded six-month values and IPCC Tier-1 conversion need source/methodology provenance. Do not show calculated carbon equivalent as measured fact. Add empty/loading/error. Ensure chart is not a color-only communication channel.

## 07.11 System Administration

Source: src/app/admin/page.tsx

Current role / critique: AI model settings, PostGIS DSN, external API keys, Telegram webhook and save/test actions.

Design objective: Make a safe configuration console with clear grouping and strong trust cues.

Page composition: Header with environment and permission context. Three settings sections: Model Runtime, Geospatial Database, Alert Integrations. Each section has status summary, editable fields, reveal/copy controls, test connection action and last-tested timestamp. Sticky save bar shows unsaved changes. Danger zone separated at bottom.

Typography / color / visual finish: Quiet utilitarian layout, no big metric cards. Labels 13px semibold; inputs 46px high; mono for paths/URLs but truncate visually with copy/view.

Responsive / overlap / functional safeguards: Source currently pre-populates token/key-like values and webhook-like endpoints. Remove all hardcoded secrets and fake credentials; render masked placeholders from secure server config only. Do not use frontend state as secret storage. “Save” and “Test” must call real APIs and report truthful outcomes. Require access control, audit trail and CSRF-safe server operations.

# 08 / Functional truth: design cannot hide broken UX

Several behaviors in the source are local/demo fallbacks or simulated UI states. These require explicit status language and real feedback; they should not be painted as success states just because the page looks polished.

| **Source behavior**                                                                 | **Required treatment**                                                                                                                                               |
|-------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| src/lib/api.ts catches backend failures and returns static in-memory fallback data. | Add a global environment banner/status model: Live backend, Local demo data, Offline cache, Error. Every affected page should show the provenance of current values. |
| getBackendHealth returns browser-emulation when API is unreachable.                 | Do not map every non-healthy response to “Local edge” with a green “connected” dot. Use separate statuses and amber/neutral visual treatment.                        |
| updateIncidentStatus falls back to mutating an in-memory cache.                     | Show “Saved locally (not synced)” separately from “Saved to server”. Provide retry/sync action when connectivity returns.                                            |
| DroneCanvas draws a simulated image scene and demo detection polygons.              | Add “Sample scene / illustrative output” watermark or chip; do not imply a real inference has occurred.                                                              |
| Satellite page calls setTimeout to show candidate boundary committed.               | Only show “Committed” after API confirmation. Otherwise label “Preview only” and retain an explicit failure message.                                                 |
| Public tip-off flow uses local timeout/receipt style.                               | Clearly indicate demo-only or connect to a real submission endpoint. Do not promise a field response time without operational SLA.                                   |
| Admin form prefilled with credential-shaped values.                                 | Remove them; use server-side secret references, secure vault integration and no client-side secret defaults.                                                         |
| Copilot shortcut and drawer interactions.                                           | Ensure keyboard shortcut ignores input/textarea/contenteditable focus, announces state and keeps focus management.                                                   |
| Report HTML string generation and download.                                         | Sanitize user-controlled strings, validate output, provide print preview and error handling. No blind trust in a generated HTML fragment.                            |

# 09 / Motion language: Framer Motion, Lenis, GSAP, Vanta

Motion should have three tiers: interface feedback, spatial continuity, and editorial storytelling. The operational experience uses the first two. The public/home experience may use all three in moderation.

| **Tier**               | **Library**            | **Motion recipe**                                                                                                                | **Where**                                                                             |
|------------------------|------------------------|----------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| Micro feedback         | Framer Motion / Motion | 120–180ms; ease-out; opacity + 2–4px translate; subtle scale 0.98→1 on pressed buttons.                                          | Buttons, dropdowns, selected rows, tabs, drawers, toasts, copilot.                    |
| Spatial continuity     | Framer Motion / Motion | 180–280ms; spring with moderate damping; shared layout or opacity/translate; exit faster than enter.                             | Incident inspector opening, command side panel, selected region change, filter chips. |
| Editorial scroll       | GSAP + ScrollTrigger   | One master timeline per section; 500–900ms stagger; scrub only when user intent benefits; no pinned content blocking navigation. | Home hero, “evidence becomes action”, Public portal story section.                    |
| Smooth page scrolling  | Lenis                  | Native-like input feel; tuned duration/lerp; stop on reduced motion; do not hijack scroll containers.                            | Optional public/home long page only; not operational workspace.                       |
| Atmospheric background | Vanta.js / Three.js    | One low-motion background only, limited particles/complexity, reduced-motion static fallback and capability check.               | At most public portal hero; not command centre, GIS or analytics.                     |

## 09.1 Exact motion timings

| **Interaction**     | **Duration** | **Suggested easing**     | **Notes**                                                            |
|---------------------|--------------|--------------------------|----------------------------------------------------------------------|
| Button press        | 100–140ms    | ease-out                 | Translate 1px; avoid exaggerated bounce.                             |
| Hover / focus color | 120–160ms    | ease-out                 | No positional movement for every card.                               |
| Dropdown menu       | 160–200ms    | cubic-bezier(.2,.8,.2,1) | Opacity 0→1; y 4px→0; reduced-motion immediate.                      |
| Drawer              | 220–280ms    | spring or ease-out       | Slide 12–20px, opacity; focus trap independent.                      |
| Toast               | 180–240ms    | ease-out                 | Enter from 8px; auto dismiss only non-critical.                      |
| Route transition    | 180–240ms    | ease-in-out              | Crossfade main content; keep nav shell persistent.                   |
| Chart reveal        | 400–650ms    | ease-out                 | Animate series once; no continuous loops.                            |
| Scroll reveal       | 500–750ms    | ease-out                 | Stagger 60–100ms; reveal once, never keep text hidden on JS failure. |
| Map camera / focus  | 250–450ms    | native map easing        | Must not fight map pan/zoom; respect user input.                     |

## 09.2 Rolling / scroll-linked effects

For the “rolling effect” mentioned in the request, use a measured sequence rather than a decorative infinite scroll animation: a line of cartographic contour work slowly resolves as the user scrolls, a satellite-image compare section reveals a before/after boundary, and a short three-stage evidence flow lights up in order. Use GSAP ScrollTrigger only for these editorial sections. Avoid pinned multi-screen effects on the public transparency form because they interfere with task completion.

For the operational app, “rolling” should mean high-quality panel transition and chart/data reveal, not scroll choreography. The command console should remain stable and instantly navigable.

## 09.3 Motion constraints

- Honor prefers-reduced-motion everywhere. Remove scroll smoothing and parallax when requested; replace with static state.

- No continuous pulsing except a live sensor/alert heartbeat. Pulse only when data is genuinely live and include a textual state.

- Never animate width/height of large layout blocks when transform/opacity can do the job.

- Use one animation owner per interaction. Do not let Framer Motion and GSAP both drive the same element.

- No background video/audio or Vanta on map-heavy screens; keep GPU for map and canvas.

- All drag/swipe interactions need keyboard alternatives and non-drag controls.

# 10 / Imagery, maps, texture and reference usage

Visual references should inform design DNA, not become copy-and-paste templates. The app’s subject is a real place and real environmental evidence; imagery needs to be authentic or labelled as illustrative.

| **Reference**                           | **Useful lesson**                                                               | **How to apply / avoid**                                                                                      |
|-----------------------------------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| Log System (system.co as named by user) | Tight system language, restrained brand, considered typography, strong layouts. | Use as reference for precision and compositional restraint; not for copying its entire palette or components. |
| Supahero                                | Curated hero section layouts and composition ideas.                             | Only Home/Public hero; avoid importing a marketing hero into operational screens.                             |
| BestFreeFonts                           | Font discovery and specimen comparison.                                         | Verify each foundry license and file format before production.                                                |
| Uppbeat                                 | Licensed sound and creative audio source.                                       | Only future opt-in notification sound; never auto-play background ambience.                                   |
| OpenMoji/Open Motion                    | Motion and icon/illustration inspiration.                                       | Keep icons consistent; use motion examples only where meaningful.                                             |
| Framer Motion / Motion examples         | Polished transitions and spring feel.                                           | Apply to UI state changes and route transitions, not to map tiles or high-frequency canvas.                   |
| GSAP examples                           | Scroll-linked storytelling choreography.                                        | Restrict to public/editorial pages with clear start/end points.                                               |

## 10.1 Image direction

- Prefer real satellite imagery from the project’s actual imagery provider, uploaded drone media, or openly licensed photographs with attribution.

- Use large image crops with clear subject hierarchy—canopy texture, edge of forest, logging road, field survey, map contour—rather than generic green forest stock photos.

- If synthetic demo imagery is retained, label it “Illustrative / sample scene” and keep it visually distinct from verified case evidence.

- Build a neutral image treatment: slight grain only if subtle, no heavy duotone that destroys evidence detail, no fake satellite scanlines over real images.

- Supply responsive srcset/next image optimization, fixed aspect ratio and explicit alt text for informative imagery.

# 11 / Data visualization and map-specific rules

| **Element**         | **Rule**                                                                                                                          |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| KPI cards           | Lead with one number, one unit, one comparison and one provenance hint. No duplicate giant labels.                                |
| Charts              | Label axes and units; include tooltip + text summary; distinct series use different stroke/dash/marker patterns as well as color. |
| Risk/severity       | Use severity order critical → high → moderate → low → informational. Keep semantic colors stable across all routes.               |
| Confidence          | Do not conflate model confidence, corroboration score, probability and verified status. Each must be defined.                     |
| Geospatial overlays | Legend labels and units explicit; separate boundary, detected object and selected feature styles.                                 |
| Map controls        | Group controls into tool categories; avoid scattering small floating buttons. Hit targets 44px.                                   |
| Map popups          | Keep popup to identity + severity + one action; detailed evidence belongs in inspector panel.                                     |
| Loading states      | Tile loading, imagery loading and model processing need independent indicators. Skeleton only in predictable panel boundaries.    |

# 12 / Accessibility, responsive and overlap prevention

| **Risk**                        | **Preventive design rule**                                                                                                            | **Acceptance check**                                                   |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| Heading collision / orphan word | Fluid type with clamp(), constrained measure (max 18–22 characters for main display line), controlled line breaks at key breakpoints. | No orphan/overlapping heading at 1440/1024/768/390/320.                |
| Sidebar + content squeeze       | At 1024px and below collapse to rail/drawer; reduce grid columns deliberately.                                                        | No content column below 520px for dense table + inspector.             |
| Map HUD collisions              | Create overlay zones: top toolbar, bottom legend, corners reserved for native Leaflet controls/attribution.                           | No panel obscures map attribution, scale, zoom or selected marker.     |
| Long IDs / hashes               | Use overflow-wrap:anywhere or break-all only for hashes; keep IDs copyable and visually truncated with reveal affordance.             | No horizontal page overflow; copy includes full original.              |
| Table overflow                  | Wrap table in overflow-x:auto; provide pinned first column if needed; keyboard accessible.                                            | Horizontal scroll remains inside table; body does not scroll sideways. |
| Drawer overlay                  | Use fixed stacking context with explicit z-index tokens; body scroll lock and focus trap.                                             | Escape closes; focus returns; no header over drawer.                   |
| Text contrast                   | WCAG 2.2 AA target; 4.5:1 normal text; 3:1 large text and meaningful UI boundaries.                                                   | Check all state, hover, disabled and tinted surfaces.                  |
| Touch targets                   | Minimum 44x44 CSS pixels and 8px spacing around controls.                                                                             | Touch test at 390px wide.                                              |
| Reduced motion                  | prefers-reduced-motion disables parallax, scroll smoothing and non-essential entrance movement.                                       | Test OS reduce motion on every route.                                  |
| Keyboard                        | Visible focus, logical tab order, skip link, semantic buttons and labels.                                                             | Complete critical flows using keyboard only.                           |
| Screen readers                  | Live region for async status; table headers; form labels; canvas companion list.                                                      | No essential information exists only inside canvas pixels.             |

# 13 / Source-level change map

| **File / area**                              | **Required changes**                                                                                                                                                                                                                |
|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| src/app/globals.css                          | Replace overlapping legacy token vocabularies with one semantic token system; canonical typography roles; spacing/radius/shadow tokens; button/form/table base components; map overlay tokens; responsive and reduced-motion rules. |
| src/app/layout.tsx                           | Load selected local font assets with next/font where possible; avoid blocking external Google Fonts stylesheet if local assets are committed; define global metadata/theme and body structure.                                      |
| src/components/layout/AppShell.tsx           | Desktop/mobile shell split; remove unsafe fixed w-screen dependency; set stable nav/header; content scroll ownership; skip link; consistent page frame.                                                                             |
| src/components/layout/Navbar.tsx             | Redesign brand, region selector, alert drawer, copilot trigger, environment status; correct status truth; accessible keyboard interactions.                                                                                         |
| src/components/layout/Sidebar.tsx            | Simplify labels, groups and badges; active route treatment; responsive icon rail/drawer; remove static decorative status chips.                                                                                                     |
| src/components/map/SentinelMap.tsx           | Map layer visual tokens; map control grouping; responsive overlays; label collision handling; accessible markers/companion list; use real data attribution and loading status.                                                      |
| src/components/satellite/SwipeComparison.tsx | Replace fixed 1400px drawing region; responsive image sources and image sizing; mobile touch drag; keyboard slider; visible sample-data state.                                                                                      |
| src/components/drone/DroneCanvas.tsx         | Separate demo scene from real uploaded image; object labels clamped to canvas; right-side inspector and companion detection list; upload and inference loading/error states.                                                        |
| src/components/assistant/CopilotDrawer.tsx   | Polish message hierarchy, streaming/loading states, contextual prompts, focus management and responsive drawer. Ensure shortcut respects current focus target.                                                                      |
| src/lib/store.tsx + api.ts                   | Centralize environment/status metadata; provide source/provenance with fallback data; differentiate local cache mutations from remote persistence; remove demo success claims.                                                      |
| src/app/reports/page.tsx                     | Extract HTML template and print styles; sanitize dynamic output; semantic report; page-break design and reliable download states.                                                                                                   |
| src/app/admin/page.tsx                       | Remove credential-like hardcoded defaults; secure server-backed settings; dirty state, reveal/copy/test/validation and unsaved changes bar.                                                                                         |
| All page.tsx routes                          | Adopt shared PageHeader, PageSection, KPI, StatusBadge, EmptyState, ErrorState and loading patterns; remove blanket text-xs page containers; standard page gutters.                                                                 |

# 14 / Recommended implementation order

1.  Freeze content and functional inventory. Record all links, headings, fields, handlers, status states, data dependencies and page routes before redesign. Do not remove functionality during visual refactor.

2.  Create the design token sheet and typography specimen. Decide font licenses and commit font files; implement CSS variables and a few canonical components.

3.  Rebuild global shell (Navbar, Sidebar, AppShell) and PageHeader. Validate 1440px and 390px first because every route inherits this work.

4.  Redesign the Command Centre as the representative operational page. Validate map, KPI hierarchy, side panel, alert interactions and status provenance.

5.  Redesign Map and Satellite/Drone specialist canvases. Treat map/canvas performance and overlay collision as critical acceptance criteria.

6.  Redesign Incident Matrix and Verification around data scanning, evidence provenance and truthful save states.

7.  Redesign Reports and Admin. Add print preview, security/secret handling and reliable test/save feedback.

8.  Redesign Home and Public Portal with editorial typography and selective scroll storytelling.

9.  Apply Analytics design with clear units/methodology; test charts with keyboard, tooltip and text alternatives.

10. Run route-wide visual and interaction QA at 1440, 1024, 768, 390 and 320 widths; run light/dark browser settings if theme support is intended; run reduced-motion and keyboard-only tests.

11. Capture side-by-side before/after screenshots and run a final Hallmark/Impeccable-style critique pass. Fix the top three visual defects in one batch; do not keep polishing details while foundational hierarchy remains broken.

# 15 / Acceptance checklist

- [ ] One cohesive brand and token vocabulary across all 11 routes.

- [ ] No blanket text-xs on route-level page container; body copy is comfortably readable.

- [ ] Three typography roles are used intentionally; mixed-family display headings only where composition benefits.

- [ ] All color is semantic and traceable to tokens; no random raw hex in page components except data visualization palette definitions.

- [ ] No unnecessary pill buttons; card/control radii follow the specified system.

- [ ] No horizontal page overflow at 320px; no text collisions at major breakpoints.

- [ ] Map zoom, attribution, legends, HUDs and inspector panels never overlap or cover one another.

- [ ] Every interactive control has hover, active, focus-visible, disabled, loading and error states as applicable.

- [ ] All status text distinguishes live backend, local demo, offline cache and simulated evidence.

- [ ] No simulated UI action is described as committed, verified or dispatched without server confirmation.

- [ ] No API tokens, DB passwords or webhook-like secrets are hardcoded into browser code.

- [ ] All charts have labels/units, legends, accessible color alternatives and a short textual interpretation.

- [ ] All image and canvas evidence identifies source and sample/demo status accurately.

- [ ] Reduced-motion preference disables unnecessary motion and scroll effects.

- [ ] No autoplay audio; any future sound alert is opt-in and has a mute control.

- [ ] Page transitions and drawers are keyboard accessible and restore focus correctly.

- [ ] Print/export dossier works across long reports without clipped content or bad page breaks.

- [ ] Final screenshots reviewed at desktop, tablet and mobile widths; no remaining major hierarchy, spacing or alignment issues.

# 16 / Agent handoff brief

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>IMPLEMENTATION BRIEF<br />
</strong>Redesign Aranya Sentinel using this specification as the source of truth. Preserve all existing page routes, functionality, data semantics and interactions. Do not modify backend architecture as part of the visual task unless needed to remove false status or insecure frontend credential behavior. Use the editorial field-atlas direction: Instrument Serif / Manrope / IBM Plex Mono, canopy / moss / paper / signal palette, consistent 8/12/16 radius system, 8px spacing rhythm, 44px controls, robust responsive layouts. Build shared primitives first, then refactor page by page. Use Framer Motion for restrained state transitions; GSAP ScrollTrigger only for editorial Home/Public storytelling; Lenis is optional only for long public pages; do not use Vanta on operational screens. Never let animation compensate for a weak static layout. Validate desktop/tablet/mobile, keyboard, reduced motion, map overlays, loading/error/empty states and truthful backend/demo provenance. Capture before/after screenshots and run Hallmark-style anti-pattern audit plus Impeccable-style craft review before completion.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 17 / Research and design references

- Hallmark: <u>https://github.com/BBTB2/hallmark-frontend-design</u>

- Hallmark project / current repo referenced in skill discovery: <u>https://github.com/nutlope/hallmark</u>

- Impeccable: <u>https://github.com/pbakaus/impeccable</u>

- Design Taste / Taste Skill: <u>https://github.com/Leonxlnx/taste-skill</u>

- Taste Skill documentation: <u>https://www.tasteskill.dev/docs</u>

- UI/UX Pro Max: <u>https://github.com/nextlevelbuilder/ui-ux-pro-max-skill</u>

- GSAP ScrollTrigger documentation: <u>https://gsap.com/docs/v3/Plugins/ScrollTrigger/</u>

- Lenis official site: <u>https://lenis.dev/</u>

- Vanta.js official site: <u>https://www.vantajs.com/</u>

- Supahero references: <u>https://www.uipedia.design/resources/resource/inspirations/Supahero</u>

- Best Free Fonts: <u>https://bestfreefonts.com/</u>

- Uppbeat: <u>https://uppbeat.io/</u>

- Log System / reference requested by user: <u>https://system.co/</u>

Note: links are reference starting points. Confirm that the requested Log System domain and any “Open Motion” resource refer to the intended site/library before using their assets. “Open Motion” was not uniquely identifiable from the prompt, so this spec treats it as motion-pattern inspiration rather than a verified package dependency.
