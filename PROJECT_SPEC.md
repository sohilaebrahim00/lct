# LCT Universal — Project Specification

**Status:** Phase 3 (production hardening) + Phase 4 (interior-page visual elevation) + pre-launch QC pass + Fleet conversion-flow pass + Three.js/GSAP 3D enhancement layer all complete — awaiting review  
**Primary business source of truth:** https://lctuniversal.com  
**Codebase:** `C:\Users\sohila\Downloads\LCT-Universal-Vite-Ready-v2\lct_migrate`  
**Last updated:** 2026-08-12  
**Next gate:** Client review of the Three.js/GSAP 3D enhancement layer (§1c-8); not deployed, DNS/old site/email untouched per standing instruction

This file is the permanent project context. Do not repeat the full rebuild brief in later phases — update this document instead.

---

## 1. Phase log

| Phase | Goal | Status |
|-------|------|--------|
| 1 | Full audit, old site review, `PROJECT_SPEC.md`, conflicts, image inventory, risks | **Complete** |
| 2 | Normalize site data + image map + design tokens + header/nav | **Complete** |
| 3 | Loader, hero, vehicle entrance, reveal system, horizontal/pinned, booking redesign | **Complete** |
| 4 | Value prop, services storytelling, horizontal/pinned scroll | Pending approval |
| 5 | Fleet showcase, corporate, airport, group | Pending |
| 6 | Chauffeur, booking process, reviews, final CTA, footer | Pending |
| 7 | Internal pages, forms/booking, SEO, a11y, performance, full QA | Pending |

---

## 1c. Phase 3 completion record (2026-07-30)

### Homepage rebuilt as cinematic journey
Mounted sections (in order):
1. Cinematic loader (`BrandLoader`) — session once, logo mask, champagne line, metallic sweep, vehicle enter, curtain open
2. Full-viewport hero (`CinematicHero`) — clip-path image reveal, right→left settle, line-by-line headline, CTAs last
3. Value editorial (`ValueEditorial`) — split layout + cockpit image mask reveal (not cards)
4. Horizontal journey (`HorizontalJourney`) — 6 pinned scrub slides (Sedan, SUV, Sprinter, Coach, Airport, Corporate)
5. Vehicle object (`VehicleObjectJourney`) — Escalade 2D scroll-linked travel with shadow/reflection/light sweep
6. Pinned stories (`PinnedStories`) — Airport Transfers / Corporate Transportation / Event Transportation / Group Transportation, one-at-a-time cinematic reveal (see §1c-1 hotfix, 2026-07-31)
7. Chauffeur (`ChauffeurSection`) — layered official portraits + door/interior stack
8. Booking experience (`BookingExperience`) — full-bleed split, vehicle list, bare form (Supabase preserved)
9. Final CTA (`FinalCta`) — large Escalade photography + Book Now

### Official images used on homepage
| Placement | Asset |
|-----------|--------|
| Loader + Hero | `hero-sclass-chauffeur.jpg` |
| Value / cockpit | `cockpit-highway.jpg` |
| Horizontal Sedan | `hero-sclass-chauffeur.jpg` |
| Horizontal SUV + object + final CTA | `fleet-escalade.jpg` |
| Horizontal Sprinter/Coach + Group story | `events-fleet-stadium.jpg` (stand-in until dedicated assets) |
| Airport story + slide | `airport-dfw-highway.jpg` |
| Corporate story + slide | `chauffeur-sclass-portrait.jpg` |
| Events story | `events-fleet-stadium.jpg` |
| Chauffeur main | `chauffeur-sclass-portrait.jpg` |
| Chauffeur stack | `chauffeur-door-service.jpg`, `chauffeur-interior.jpg` |
| Booking panel image | `chauffeur-door-service.jpg` |
| Also available | `rearview-highway.jpg` (mapped; reserved for later atmosphere) |

Official images compressed to web JPEGs (~100–400KB each).

### Motion systems
- `src/lib/motion.ts` — GSAP/ScrollTrigger register, reduced-motion + desktop motion helpers, refresh
- Loader GSAP timeline + curtain panels
- Hero entrance timeline + scrub parallax
- Horizontal `pin` + `scrub` + `containerAnimation` reveals
- Vehicle object pinned scrub travel
- Pinned story image clip-path swaps + progress bar
- Magnetic CTA (pointer fine only)
- `gsap.context` cleanup throughout

### Mobile fallback
- Horizontal → vertical full-bleed snap stack
- Pinned stories → vertical full-bleed chapters
- Vehicle object → static grounded composition (no pin)
- Loader shortened
- Reduced-motion skips heavy timelines

### Dead code removed
- Previous 1400+ line unused cinematic homepage in `index.tsx` replaced entirely
- GoldParticles no longer mounted on homepage

### Validation
- `tsc --noEmit` — pass
- `npm run build` — pass

### Remaining visual limitations
- Dedicated Sprinter photography still missing (events stand-in). Coach now has dedicated photography — see §1c-1 (2026-07-31).
- Logo wordmark still favicon-backed
- Large homepage JS chunk — acceptable for Phase 3; further split in Phase 7
- Browser visual QA should be confirmed by client on real devices
- `rearview-highway.jpg` not yet featured in a dedicated beat

---

## 1c-1. Signature Journeys hotfix (2026-07-31, pre-Phase-4)

**Not part of Phase 4.** The pinned "Signature Journeys" section (`PinnedStories`, mounted on the homepage between the vehicle-object journey and the chauffeur section) was visually broken in production: all four service numbers/titles/descriptions rendered on top of each other at partial opacity instead of one at a time. Client requested an immediate fix before any Phase 4 work.

### Root cause
`src/components/home/pinned-stories.tsx` set inactive panels to a non-existent inline CSS property (`autoAlpha`, a GSAP-only pseudo-prop with no CSS meaning), so the browser applied no opacity at all outside of GSAP. The GSAP timeline then only dimmed inactive panels to `autoAlpha: 0.25` (not `0`), and the effect never ran at all whenever `!isDesktopMotion()` (reduced motion, or a desktop-width coarse-pointer device) because the desktop markup was still shown via a pure Tailwind `lg:` breakpoint — independent of the JS motion check. Both paths left every panel simultaneously legible.

### Fix applied
- Rewrote `pinned-stories.tsx`. Desktop vs. stacked layout is now chosen by a single React state (`pinnedMode`, from `isDesktopMotion()`, re-evaluated on resize / reduced-motion change) instead of a CSS breakpoint disconnected from the JS motion check — eliminating the whole class of "CSS shows it, JS never animates it" bugs.
- Inactive panels are hidden with real `visibility: hidden` (removes from hit-testing/AT tree), not opacity dimming.
- Discrete GSAP timeline per transition: description fades/slides out → title clips upward (clip-path) → number fades + scales down → dark overlay pass → direction-aware clip-path image reveal (alternates vertical/horizontal wipe) → new number enters (scale + fade) → new title reveals via clip-path → new description fades in with a word-by-word stagger. Holds between transitions are weighted longer than the transitions themselves so each service stays readable.
- Added a 4-segment "stories" progress indicator (replaces the old single scrub bar) and a static champagne-gradient divider line between the copy and image columns.
- Retitled services to match the approved numbering: 01 Airport Transfers, 02 Corporate Transportation, 03 Event Transportation, 04 Group Transportation (was "Corporate Travel" / "Events").
- Mobile/reduced-motion/coarse-pointer fallback: one full-bleed service per block, no pin, staggered scroll-reveal, capped to a readable max-width — no longer a lg:-only CSS toggle.
- `refreshScrollTriggers()` wired to image `load`/`error` events (matches the pattern already used in `horizontal-journey.tsx`) so ScrollTrigger recalculates pin distance after the real image dimensions land.

### Group Transportation image — client decision (2026-07-31)
No genuine client-photographed bus/coach existed anywhere in the project. `chauffeur-coach-bus.jpg.asset.json` / `executive-coach.asset.json` were metadata stubs that resolved to `/assets/fleet-sprinter.jpg` (a rendered Sprinter van, not a bus). The only bus-shaped photo on disk was `src/assets/ChatGPT Image Feb 11, 2026, 06_41_20 PM.jpg`, which §8/Section C of this spec had flagged as AI-generated and off-limits for brand photography (its byte size, 96,774, exactly matches the size recorded in the original `chauffeur-coach-bus.jpg` asset record, corroborating it as that same client asset).

**Client explicitly approved this file for use and overrode the prior AI-flag warning.** Applied:
- Copied to `public/assets/official/group-coach-bus.jpg` (already ~95KB, no further compression needed).
- `src/lib/image-map.ts` → `fleetCoach` now points to `group-coach-bus.jpg` (was `events-fleet-stadium.jpg` stand-in). This is a shared image key, so the Coach card on `/fleet` and the "Executive Coach" slide in `HorizontalJourney` now also show the real bus instead of the stadium stand-in — same key, no component logic touched.
- Old mapping: `fleetCoach` → `/assets/official/events-fleet-stadium.jpg` (stand-in). New mapping: `fleetCoach` → `/assets/official/group-coach-bus.jpg` (approved client photo).

### Validation
- `npx tsc --noEmit` — pass
- `npm run build` — pass
- Playwright smoke pass across 375×812, 390×844, 430×932, 768×1024, 1024×768, 1440×900, 1920×1080: zero horizontal overflow, zero console/page errors, exactly one story legible at a time confirmed by scripted scroll + computed-style checks at every breakpoint.
- Verified `prefers-reduced-motion: reduce` forces the static stacked layout with no animation and no errors.
- Verified real (Lenis-driven) wheel-scroll traversal of all four stories and the transitions between them — no overlapping text at rest or mid-transition, correct image per service, progress segments fill in order, pin releases cleanly into the chauffeur section.

### Still true / unchanged by this hotfix
- Everything else in Phase 3 completion record below is unchanged.
- Phase 4 has **not** started.

---

## 1c-2. Sitewide cinematic motion elevation (2026-08-01, pre-Phase-4)

**Not part of Phase 4.** Client raised the visual/motion bar to Awwwards/Active Theory/Apple/Porsche/Mercedes/Genesis-tier across the **whole site**, not just the homepage, and asked for it in the same pass. This section extends the existing GSAP/ScrollTrigger architecture in place — no working component, animation, or integration was rebuilt from scratch; only the already-approved `PinnedStories` component received zero structural changes (edge-only handoff wiring).

### Hero image + copy change (permanent, not a one-off)
- `src/lib/image-map.ts` → `hero` key repointed from `hero-sclass-chauffeur.jpg` (S-Class) to `group-coach-bus.jpg` (the client-approved coach bus). This is the shared source every hero-consuming component reads (`CinematicHero`, the loader's old vehicle silhouette, the `index.tsx`/`__root.tsx` preload links), so the change is global by design — client directive: the hero must signal full-fleet capability (airport, corporate, events, group), not sedan-only.
- `CinematicHero` headline changed from "Executive Travel, Elevated." to "One Fleet, Every Occasion." with subcopy explicitly naming sedans/SUVs/sprinters/coach and airport/corporate/events/group.

### Image de-duplication (new mappings added to `image-map.ts`)
The bus photo now legitimately appears in 3 places (hero, `HorizontalJourney`'s Coach slide, `PinnedStories`' Group Transportation slide) — the one "unless absolutely necessary" repeat, each given a **distinct crop**:
| Key | Used by | Crop role |
|---|---|---|
| `hero` | Homepage hero | Wide atmospheric establishing shot |
| `fleetCoach` | `/fleet` Coach card (via `site-data.ts`) | Catalog crop |
| `fleetCoachJourney` (new) | `HorizontalJourney` Coach slide | Cinematic wide crop |
| `groupCoachStory` (new) | `PinnedStories` Group Transportation | Narrative mid-shot (unchanged from the approved Signature Journeys fix) |

Other de-dup fixes:
- `FinalCta` switched from `IMAGES.fleetSuv` (repeat of `VehicleObjectJourney`) to `IMAGES.rearview` — previously unused, documented as "reserved for later atmosphere."
- `reviews.tsx` switched from a raw `passenger-interior.asset.json` import (same collapsed low-res file `services.tsx` uses) to `IMAGES.cockpit` through the centralized map.
- `service-areas.tsx` switched from `IMAGES.airport` (already used 3× elsewhere) to `IMAGES.rearview`.
- New `aboutPortrait` key: same source as `chauffeurPortrait`/`corporate` (DSC01431) with a distinct tighter crop, so `about.tsx`'s portrait no longer shares an identical composition with the homepage `ChauffeurSection`.
- New `airportGateway` key: same source as `airport` (DSC01860) with a distinct crop for the `/airport` page hero, separate from the homepage's `HorizontalJourney`/`PinnedStories` airport beats.

### New shared primitives
- **GSAP plugins**: `ensureGsap()` in `src/lib/motion.ts` now also registers `SplitText`, `MotionPathPlugin`, and `DrawSVGPlugin` — all bundled free in the installed `gsap@3.15.0` (GreenSock made every Club plugin MIT-licensed in 2025; no separate install needed).
- **`src/lib/reveal.ts`** (new) — `revealLines` (SplitText line/word mask reveal), `revealClipImage` (clip-path wipe, `left`/`right`/`up`/`down`/`diagonal`), `revealStagger` (directional grid/list stagger, replaces the identical `y:48` fade-up previously copy-pasted in every section), `drawLine` (DrawSVGPlugin stroke draw for SVG route/line elements). All reduced-motion-safe by default.
- **`src/components/luxury/cursor.tsx`** (new) — desktop-only (`pointer:fine` + non-reduced-motion) custom cursor: precise dot + a magnetic ring that snaps to the center of any `data-cursor="view"|"book"|"explore"` element and shows its label. Mounted in `SiteLayout`, so every page inherits it. Adds `html.cursor-none` CSS rule in `styles.css`.
- **`src/components/route-transition.tsx`** (new) — sitewide animated page transitions: intercepts left-clicks on same-origin internal links, plays a dark-wipe cover, navigates, then reveals with the wipe continuing in the same direction. Browser back/forward is deliberately **not** intercepted (left to the router's native `scrollRestoration: true`). Mounted in `__root.tsx`.
- `ScrollProgress` (top gold bar) and `SectionProgress` (right-edge dot nav) — both already fully built and previously unmounted — are now wired in (`ScrollProgress` sitewide via `SiteLayout`; `SectionProgress` was left unmounted since its homepage-specific `sections` prop would need route-level wiring — noted as a follow-up, not required by this pass).

### Loader (`brand-loader.tsx`) — extended, not replaced
Existing shell (session-once gating, one `gsap.context`/timeline, mobile/reduced-motion branch, curtain-panel open) is untouched. Only the middle "vehicle" beat changed: the old raster hero-image slide-in is replaced with an origin pin → `DrawSVGPlugin` route-line draw → a minimal SVG vehicle marker traveling the exact drawn path via `MotionPathPlugin` → destination pin light-up (radial glow pulse) → existing curtain-open, retimed to follow. No longer depends on `IMAGES.hero` at all.

### Homepage — per-section additions (all additive to existing timelines)
- **`CinematicHero`**: char-stagger (`SplitText`) on "Every Occasion." only; desktop pointer-parallax tilt on the hero image (layered on top of the existing scroll parallax); hero's divider line fades and a dark-wipe overlay rises as the section scrolls out, into `ValueEditorial`.
- **`ValueEditorial`**: oversized faint "01" numeral behind the heading (parallaxed slower than the foreground); headline via `revealLines`; image reveal switched to `revealClipImage(edge:"diagonal")`; the 4 value items alternate left/right entry.
- **`HorizontalJourney`** (architecture unchanged — still the strongest existing system): the small "01/06" corner label replaced with a large background numeral per slide that parallaxes counter to the copy; capped scroll-velocity blur (~0–3px) on the track; dark-wipe handoff into `VehicleObjectJourney` in the last ~15% of the pin.
- **`VehicleObjectJourney`**: tail-light glow pulse as the vehicle crosses center; 2 thin light-streak sweeps during the scrub; dark-wipe handoff into `PinnedStories`.
- **`PinnedStories`**: no structural change (approved) — receives the incoming handoff via its existing entrance fade, which now overlaps `VehicleObjectJourney`'s new exit wipe.
- **`ChauffeurSection`**: the two stack images (door/interior) changed from a grid row below the text to floating cards overlapping the main image's corners (thin champagne borders, independent parallax rates each); added a large rotated low-opacity "CHAUFFEUR" watermark along the edge. *(Fixed during build: the top-right floating card's overlap amount initially bled into the neighboring text column, clipping the "C" in "CHAUFFEUR EXPERIENCE" — reduced the offset/width so it stays clear.)*
- **`BookingExperience`**: rebuilt into a real 3-step wizard (Trip details / Vehicle / Contact) using a new **additive, backward-compatible** extension to `LeadForm`/`FieldSpec` — optional `group`/`activeGroup`/`hideSubmit` props. Every other `LeadForm` caller (services/fleet/corporate/airport/events/contact pages) omits these and is behaviorally identical to before. Boarding-pass-style numbered-circle progress with a filling gold connector; Ken Burns drift (`image-drift`, an existing unused CSS utility) on the booking image; Back/Continue step navigation; the real submit button only renders on the last step (prevents validating off-screen required fields early). Supabase submit path, field-to-DB mapping, and validation logic are 100% unchanged.
- **`FinalCta`**: image already de-duped to `IMAGES.rearview` (above); headline via `revealLines`; a self-drawing gold line (`DrawSVGPlugin`) before the CTAs, echoing the loader's route-line and the hero's opening divider.

### Interior pages — shared-component leverage + per-page personality
`PageHero` (`site-layout.tsx`) and `SectionHeading` (`section-heading.tsx`) both gained real motion (eyebrow line-draw, `revealLines` title, `revealClipImage` image entrance) — since virtually every interior page uses one or both, this alone changed the opening moment of all ~10 pages from static to animated with two file edits. `PageHero` also gained an `imagePosition`/`imageEdge` prop (previously hard-coded `opacity-30`, no object-position control).

Per-page grid treatments (all additive, distinct per page so the identical underlying template doesn't feel copy-pasted):
| Page | Treatment |
|---|---|
| `services.tsx` | 2-col card grid alternates left/right stagger entry; existing CSS hover-lift/shimmer on `.service-card` kept as-is (already premium) |
| `fleet.tsx` | Per-row diagonal `revealClipImage` (alternating left/right) + directional text stagger, matching the existing alternating row layout |
| `corporate.tsx` | Deliberately restrained plain up-stagger on the list and card grid — no directional/diagonal flourish, matching "business-first" seriousness |
| `airport.tsx` | Cards drop in from above ("arrivals board" pacing) |
| `events.tsx` | Punchier `back.out` scale+pop entrance, faster stagger — energetic pacing |
| `about.tsx` | Portrait rises into place (`revealClipImage(edge:"up")`); 4-pillar grid stagger |
| `contact.tsx` | Form panel slides in as one block (not item-by-item); info-card column staggers from the right; a stylized dashed-route SVG motif (draw-in) added to the Location card in place of a literal embedded map — no verified street address or Maps API key exists in this project, so a live map was out of scope |
| `faq.tsx` | Gentle up-stagger only on accordion rows; native `<details>` behavior kept, no bespoke height animation |
| `service-areas.tsx`, `reviews.tsx` | Inherit the `PageHero`/`SectionHeading` upgrade only, plus the de-duped hero image above — no further bespoke work (thin content, deliberately calm for `reviews.tsx`'s honest "no testimonials yet" tone) |
| `privacy.tsx`, `terms.tsx` | No motion added beyond the inherited `PageHero` — legal text, restraint over spectacle |

### Validation
- `npx tsc --noEmit` — pass (checked after every file change during the build, not just at the end)
- `npm run build` — pass
- Playwright sweep across all 13 routes (`/`, `/services`, `/fleet`, `/corporate`, `/airport`, `/events`, `/about`, `/contact`, `/faq`, `/service-areas`, `/reviews`, `/privacy`, `/terms`): zero console/page errors, zero horizontal overflow.
- 7 required breakpoints (375×812, 390×844, 430×932, 768×1024, 1024×768, 1440×900, 1920×1080) re-checked against `/`, `/fleet`, `/about`: 21/21 clean.
- `prefers-reduced-motion: reduce` re-verified on `/`, `/services`, `/fleet` — no errors, no stuck states.
- 5 consecutive `RouteTransition` navigations (Fleet → Corporate → About → Contact → Home) — correct URL each time, no stuck overlay, no double-nav.
- Booking wizard walked through all 3 steps live in-browser: field visibility gates correctly per step, submit button only appears on step 3, Back/Continue work, progress connector fills correctly.
- Loader's new route/pin/vehicle sequence visually confirmed frame-by-frame (origin pin → drawn arc → vehicle mid-travel → destination glow) — plays correctly; note headless Chromium's unthrottled `requestAnimationFrame` compresses the wall-clock playback time in automated testing only, not a code defect (verified: `tl.duration()` reports the correct authored ~2.7s; no thrown errors; real browsers with vsync-locked rAF are unaffected).

### Known follow-ups (not required by this pass)
- `SectionProgress` (right-edge section dot nav) is built but not yet mounted — needs a per-route `sections` list; homepage-only wiring was out of scope for a sitewide pass.
- Dedicated Sprinter photography still missing (unchanged from the Signature Journeys hotfix note).
- A literal interactive map on `/contact` needs a verified street address and a client-provided Maps API key — intentionally not invented.

---

## 1c-3. Cinematic loader v2 + premium media pass (2026-08-01, pre-Phase-4)

**Not part of Phase 4.** Client asked for (1) a full loader replacement — a 7-step "opening shot of a luxury travel film" sequence — and (2) a video review/placement pass over `src/assets/*.mp4`, with an explicit instruction not to use every video and to reject anything with AI artifacts, poor stabilization, awkward framing, or visible compression. No integrations, booking flow, forms, or existing section animations were touched outside what's listed below.

### Video review — 3 candidates, 1 accepted

No `public/assets/videos/` directory existed yet; the 3 source clips lived in `src/assets/` with `SnapInsta.to_*.mp4` filenames (Instagram-downloader naming) and no `ffmpeg` was available on this machine to extract frames directly. Frames were instead pulled by serving each file through the Vite dev server and sampling `<video>.currentTime` via a headless-browser script (5–15 sample points per clip, plus a zoomed crop where needed).

| # | Content | Verdict | Reasoning |
|---|---|---|---|
| 1 | Interior POV, night drive through downtown Dallas, S-Class dash/wheel/nav display visible | **Accepted → Homepage Hero** | Single continuous real shot, no cuts, no baked-in graphics, genuine handheld motion, moody/premium lighting, ample dark negative space for headline text, no branding conflicts. Matches the brief's "Video 1: Luxury driving sequence." |
| 2 | Escalade close-up detail walkaround (grille/badge/headlight/hood ornament), LCT Universal plate visible | **Rejected** | Legitimately the client's own vehicle, but shaky handheld macro framing leaves no usable text space, and the clip ends with a baked-in "LCT UNIVERSAL" outro card spliced directly into the footage — can't loop or crop around it without re-editing the source file (no editing tooling available). |
| 3 | SUV driving solo, then joins a multi-vehicle highway convoy, then a baked-in LCT Universal outro card | **Rejected — flagged to client, confirmed reject** | Zooming into the rear-window decal on the convoy vehicles reads **"Platinum Chauffeur"** with a circular P logo — a different transportation company's branded fleet, not LCT Universal's. Publishing this on the client's own site would misrepresent whose vehicles these are. Raised explicitly via `AskUserQuestion`; client chose "reject it" over trimming to the solo segment or waiting on replacement footage. Also a multi-cut compilation (driveway → interior → exterior → outro) rather than one usable continuous shot, and shares the same baked-outro problem as #2. |

Net result: only 1 of 3 source videos was usable. Per the brief's own instruction ("Do NOT automatically use every video... reject videos with... awkward framing"), Fleet and Corporate — originally mapped to videos #2 and #3 — do **not** get video. Their page heroes instead receive the video brief's *presentation technique* (asymmetric mask / diagonal wipe) applied to their existing photography, so the visual language survives even though the source footage didn't clear the bar. Airport and Events were already correctly image-only per the brief and were left untouched.

Accepted asset: copied to `public/assets/videos/hero-night-drive.mp4` (1.4MB, 720×1280, ~11.6s) with a generated poster frame `hero-night-drive-poster.jpg` (a representative mid-clip frame, extracted the same headless-browser way in the absence of `ffmpeg`).

### Cinematic loader v2 (`brand-loader.tsx`) — full sequence replacement

The prior loader's shell (session-once `sessionStorage` gate, one `gsap.context`/timeline, mobile/reduced-motion branch, curtain-panel open) is kept — it already worked correctly. Everything the timeline actually plays was rebuilt to the client's 7-step spec:

1. A dark dotted "world map" fades in — a fine gold radial-dot CSS grid (no real geographic data used; a stylized abstract grid, vignette-masked via `mask-image`, with a handful of brighter "hub" dots) plus a champagne route stage.
2. An origin pin (Dallas–Fort Worth) scales in with a `back.out(2.6)` overshoot ("bounce") and two staggered expanding-and-fading ring circles ("soft pulse... expanding ripple").
3. A champagne route line draws itself via `DrawSVGPlugin` along a shallow arc.
4. A **hand-authored SVG sedan silhouette** (not an icon-font glyph, not a raster photo crop — no background-removal tooling was available to cleanly extract a vehicle from any of the official JPEGs, so the "realistic silhouette" requirement is satisfied with a proportioned, bespoke side-profile path in the same champagne-gold material language as the rest of the site) travels the drawn path via `MotionPathPlugin` with `autoRotate: true` (natural lean on the curve), a separate non-rotating shadow ellipse following the same path underneath, a clipped diagonal sheen sweeping across the body, and a blurred/pulsing headlight glow.
5. On arrival: the destination pin lights up, a fast radial "flash" burst (scale 0→2.8, fast fade), a settling glow, and two more expanding ripple rings.
6. Only after arrival: the existing logo mark fades/clip-reveals in, plus a new tagline line — **"Your Journey. Our Priority."** (this exact copy is used only inside the loader per the client's explicit instruction; it does not replace the `site-data.ts` company tagline used elsewhere).
7. A thin gold progress line fills, then the existing curtain-panel mechanic opens while the whole scene fades together — no hard cut.

Total authored duration ≈ 5.4s (desktop). The mobile/`prefers-reduced-motion` branch keeps the prior simple treatment (logo + tagline fade, quick panel wipe) — the map/pin/route/vehicle spectacle is desktop-only, matching the existing perf-gating convention used everywhere else in this codebase.

**Validation note (headless timing):** as with the loader/hero fixes earlier in this project, headless Chromium's unthrottled `requestAnimationFrame` compresses this timeline's wall-clock playback well below its authored ~5.4s in automated testing only. This was confirmed three independent ways — DOM-lifecycle timestamping, a `globalTimeline.timeScale()` slow-motion pass, and a deterministic `globalTimeline.time()` scrub — all consistent with the same known non-bug artifact already documented in §1c-2, not a defect in this code. The scrub pass confirmed the full sequence resolves correctly end-to-end (dot-map → pin/route/vehicle → arrival glow → wordmark/tagline/progress all rendered with correct styling and legibility); a temporary dev-only `window.__gsap` exposure used to drive that scrub was reverted after testing and is not part of the shipped code.

### Hero video presentation (`cinematic-hero.tsx`)

- Desktop/fine-pointer only (`isDesktopMotion()`, same gate used by the cursor and pointer-parallax elsewhere): renders a `<video muted autoPlay loop playsInline preload="metadata" poster=...>` in place of the static `<img>`. Mobile, tablet, and `prefers-reduced-motion` keep the existing approved daytime coach-bus hero image completely unchanged — the video is additive to desktop capability, not a replacement of the mobile hero identity.
- Both the `<img>` and `<video>` share one `.hero-media-visual` class so the existing scroll-parallax and pointer-parallax tweens (previously hardcoded to `.hero-media-img`) apply uniformly to whichever is mounted, without duplicating that logic.
- **Push-in**: a one-shot `gsap.fromTo(scale: 1.04 → 1.13, duration: 26s, ease:"none")` starting 1.6s in (after the existing entrance zoom settles) — a slow one-directional dolly-in distinct from the entrance animation, per "slow cinematic push."
- **Grain**: a low-opacity (`0.06`) tiled `feTurbulence` SVG data-URI overlay, `mix-blend-mode: overlay`, video-only.
- **Headlight glow**: a warm radial-gradient light source anchored to the bottom of the frame, layered above the existing ambient gradient.
- **Dark luxury overlay**: reused the hero's existing two-layer gradient (`radial + linear` dark grade, plus the pre-existing `heroLightSweep` animated sheen) unchanged — it already sat above the media layer for both image and video, so no new overlay was needed to satisfy this requirement.
- **Performance**: `preload="metadata"` (not `auto`) so the video never competes with FCP; an `IntersectionObserver` pauses playback whenever the hero scrolls out of view and resumes it on return, so it isn't decoding frames for the rest of the homepage scroll; `.play()` is wrapped so a rejected autoplay promise can't throw.

### Fleet / Corporate — presentation technique applied to photography instead

Since neither page kept its mapped video, their `PageHero` now uses two new genuinely-angled clip-path techniques added to `reveal.ts`'s `revealClipImage` (the previous `"diagonal"` option was a latent no-op bug — both leading-edge vertices animated in lockstep from identical start/end values, so it rendered as a plain vertical wipe, never an actual diagonal; fixed by giving the two vertices different travel distances over the same duration so a real, constant-angle slant persists throughout the tween, not just at rest):
- `fleet.tsx` → `imageEdge="diagonal-reverse"` (mirrored: sweeps right→left, top edge leads) — the "asymmetric reveal."
- `corporate.tsx` → `imageEdge="diagonal"` (sweeps left→right, bottom edge leads) — the "diagonal wipe."

### Validation
- `npx tsc --noEmit` — pass after every file change, and once more at the end with all changes together.
- Playwright pass across 1920×1080, 1600×900, 1440×900, 1366×768, an 820×1180 tablet, and a 390×844 mobile viewport on `/`: video mounts only on the 4 desktop sizes (`isVideo:true`, playing, no video errors, no failed requests), image-only fallback confirmed on tablet/mobile, zero horizontal overflow and zero console/page errors on all 6.
- `/fleet` and `/corporate` re-checked at 1440×900 after waiting out the loader: both diagonal reveals settle to a fully visible, correctly cropped hero image with zero console errors.
- `public/assets/videos/` confirmed to contain only the accepted asset (`hero-night-drive.mp4` + poster) — no leftover review copies of the two rejected clips.

### Known follow-ups (not required by this pass)
- If the client can supply verified, exclusively-LCT-Universal-branded exterior driving footage, Fleet and Corporate can be upgraded from the photography treatment to real video using the same push-in/grain/glow (hero) or mask/wipe (fleet/corporate) presentation patterns already built here.
- The loader's vehicle is a hand-drawn SVG silhouette rather than a pixel-extracted cutout from an official photo — no background-removal tool was available in this environment; revisit if the client provides a pre-cut vehicle asset.

---

## 1c-4. Production hardening pass (2026-08-02, pre-Phase-4)

**Not part of Phase 4.** Client reprioritized: finish production infrastructure (security, SEO, tracking, performance, Hostinger deployment) before any further visual/interior-page work. Full detail lives in the four dedicated documents this pass produced — `INTEGRATION_AUDIT.md`, `SECURITY_CHECKLIST.md`, `SEO_CHECKLIST.md`, `LAUNCH_CHECKLIST.md` — this section is the short version.

### The headline finding
**No MyLimoBiz/ORES integration existed anywhere in this codebase before this pass.** Every "Book Now"-shaped CTA opened a local Supabase quote-request form. Confirmed with the client before touching any CTA wiring; resolution: a new `/book` route embeds the real, live MyLimoBiz widget (verified working — renders the client's actual branded reservation form) and primary "Book Now" CTAs sitewide now point there, while the existing Supabase-backed quote/inquiry forms stay as their own honestly-labeled, separate path.

### The other headline finding
**`<HeadContent />` (TanStack Router) was never rendered anywhere in the app** — every route's `head()` metadata (title, description, canonical, Open Graph, structured data) had been completely inert since before this session; the browser only ever showed `index.html`'s static fallback. This predates this pass; it was not introduced by it. Fixed, and verified live across all 14 routes afterward. Two duplicate-tag bugs surfaced while verifying the fix (a root-vs-leaf canonical conflict, and a static-vs-dynamic title/description conflict from `index.html`) and were fixed alongside it.

### What was built
- **Booking**: `src/components/booking/mylimobiz-widget.tsx` (a persistent widget host mounted once in `__root.tsx`, using a React portal to move the *same* DOM node between an off-screen host and `/book`'s visible slot across SPA navigation — required because the real ORES `widget-loader.js` script does a one-shot synchronous DOM scan with no re-init API, verified by fetching and reading the actual script, not assumed); `src/routes/book.tsx` (premium framing, branded loading state, timeout/error fallback with a direct link).
- **Security**: `src/lib/forms/schema.ts` (Zod, previously installed but unused), SHA-256 submission-hash dedupe (the DB column existed but was never populated before), a `SECURITY DEFINER` Postgres rate-limit trigger (migration written, not yet applied to the live project — no CLI credentials in this environment), removed a raw-error `console.error`, deleted the one `dangerouslySetInnerHTML` usage in the app (dead shadcn `chart.tsx`).
- **SEO**: `src/lib/seo.ts` `pageMeta()` helper — every route now gets an absolute canonical/`og:url` (previously relative, which is invalid), full OG + Twitter Card tags, and no duplicates. `LocalBusiness`/`WebSite` JSON-LD sitewide, `Service` JSON-LD on `/services`/`/airport`/`/corporate` (each generated from the same array the page renders, not a separate list), `robots.txt`, `sitemap.xml`.
- **Tracking**: `src/lib/tracking.ts` + `src/components/analytics.tsx` — single `gtag.js` load serving Google Ads (`AW-17966850869`, real/verified), StatCounter (`13222021`/`abf8a3d5`, real/verified), SPA route-change `page_view`, delegated click tracking for booking CTAs/phone/email/WhatsApp (reusing the `data-cursor="book"` attribute already on every booking CTA from the Phase 2 pass) and lead-submit-success. **GA4 was requested but no real Measurement ID was ever provided** — wired to activate automatically via `VITE_GA4_MEASUREMENT_ID` the moment one exists, not fabricated.
- **Deployment**: `public/.htaccess` — HTTPS enforcement, SPA rewrite fallback (direct loads of `/fleet` etc. no longer 404), full security header set including a hand-built CSP with zero wildcards and no `unsafe-eval`/script `unsafe-inline` (verified there is no inline script or eval anywhere in the app), compression, cache rules. `nginx.conf.example` as a reference mirror.
- **Performance fixes**: found and fixed the site's logo/favicon — a 790KB, 1264×848 PNG rendered at ~44–96px in the header on every page — resized to 93.5KB (88% smaller), verified visually identical; found and fixed the router eagerly preloading other pages' hero images on initial homepage load (`defaultPreload: "intent"`); found and fixed `index.html` loading an entirely unused font family (Inter — the site actually uses Manrope) as a duplicate, later-arriving fetch alongside the correct one.

### Performance measurement caveat
Lighthouse was run against the real production build (`vite preview`, not dev server) but the absolute performance score is not trustworthy — this development machine had heavy concurrent load during the run (confirmed via process inspection), and Lighthouse's CPU-throttled timing is highly sensitive to that. Non-timing metrics are trustworthy and good: CLS 0–0.006, SEO 100/100, Accessibility 91/100. Best Practices sits at 79 only because of third-party cookies StatCounter/Google Ads set themselves — inherent to the tracking the client asked for, confirmed via Chrome's own issue log, not a defect. Recommend re-running Lighthouse/PageSpeed Insights against the real deployed domain post-launch.

### Validation
- `npx tsc --noEmit` clean after every change.
- `npm run build` clean, route-level code splitting confirmed working in the output.
- Playwright verification of the booking widget: exactly 1 script tag, exactly 1 iframe, unchanged after navigating away and back (proves the persistent-portal architecture works, not just compiles).
- Playwright sweep of all 14 routes: unique title/description on every route, exactly one canonical/`og:url` each, zero console errors, single tracking-script injection confirmed unchanged across navigation.
- `npm audit`: 2 findings, both dev-server-only (Vite/esbuild, not present in the production static build), fix requires a forced out-of-range version bump — documented, not blindly applied.

### Known follow-ups (blocking launch, not this pass)
1. Apply `supabase/migrations/20260802010000_form_submission_hardening.sql` to the live Supabase project.
2. Old-site URL list still needed from the client for 301 redirects.
3. Add `.env` to `.gitignore` before any git remote is connected.
4. Decide on GA4 (needs a real Measurement ID).

---

## 1c-5. Interior page visual elevation — Phase 4 (2026-08-02)

Full-page rebuild of every interior page's primary content section, following the client's explicit direction: production hardening (§1c-4) had to be complete first, and every page needed a **distinct signature interaction** — no two consecutive pages sharing the same visual mechanic, no repeated large-numeral treatments, no generic card grids. The cursor (already the champagne-gold 2.5D location-pin from an earlier pass) and the `/book` page (already restrained/compliant from §1c-4) needed no changes and were left untouched.

### Signature interaction per page

| Page | Old pattern | New signature interaction |
|---|---|---|
| Services | Flat 12-item card grid | **Vertical active-service index** — sticky cross-fading media panel + an animated gold progress rail (not a numeral system), 6 consolidated services (Airport/Corporate/Event/Group/Private/Family) each with a destination-specific CTA |
| Fleet | 4 identical image-left/text-right rows | **4 distinct vehicle chapters** — Sedan (full-bleed panoramic reveal), SUV (split spec panel + one-shot light sweep), Sprinter (asymmetric inset with oversized watermark type), Coach (wide panoramic banner with slow horizontal drift) |
| Airport | 6-card feature grid | **Arrival → Meet → Assist → Depart** journey — animated connector line drawn behind circular terminal-style markers |
| Corporate | Bullet list + 4 cards | **Animated vertical itinerary** — an illustrative day's schedule with a scroll-filling gold timeline; use-case cards shrunk to a quiet supporting strip |
| Events | 4-card grid | **Native horizontal drag filmstrip** (`data-cursor="drag"`, real touch/scroll, not GSAP scroll-jacked) — large image-forward moment cards |
| About | Mission/Vision/Values card grid (explicitly disallowed) | **Editorial portrait + typography handoff**; values became an inline typographic row (icon + word + line), not cards |
| Contact | Small route doodle buried in one InfoCard | **Enlarged custom pin + route motif** as its own section, reusing the cursor's pin material language (champagne-gold metal, onyx core) |
| Service Areas | One static card + CTA | **Stylized DFW diagram** — 4 verified locations (Dallas, Fort Worth, DFW Airport, Grapevine) as custom pins connected by animated route lines, explicitly abstract, not a literal map |
| FAQ | Flat 12-item list | Same calm accordion, now with **category grouping** (Reservations / Airport / Fleet & Groups / Corporate & Policies) — kept deliberately restrained per the brief |
| Reviews | Honest empty-state card | Same honest empty-state, **added a short "what to expect" service-standards paragraph** — still no invented testimonials |
| Book | — | Verified already compliant (restrained motion, clear fallback); no changes |

### Copy reduction

Services cut from 12 verbose service cards to 6 (matching the client's named list); Fleet, Airport, and Corporate hero descriptions shortened to one sentence each (previously 2–3); Corporate's 6-item advantages list reframed as a concrete illustrative itinerary instead of abstract bullets.

### Image-to-text matching

No image is reused with an identical crop within the same page. Fleet's hero was moved off `fleetSedan` (previously double-used on that page — hero backdrop *and* the Sedan chapter) onto `fleetCoachJourney`. Services' 6 chapter images were assigned by service meaning (Airport→highway signage, Corporate→door service, Event→stadium district, Group→Sprinter, Private→S-Class portrait, Family→Escalade) with per-chapter `object-position` overrides so none crop into faces, grilles, or logos.

### Bugs found and fixed during this pass

1. **Pre-existing, not introduced this pass**: `/contact`'s two-column grid had no explicit mobile column count (`grid` + `lg:grid-cols-[...]` with nothing for the base breakpoint) — CSS Grid's default auto-placement puts items side-by-side in one row instead of stacking, causing horizontal overflow on mobile. Fixed with an explicit `grid-cols-1` base.
2. **Introduced then fixed within this pass**: the Airport route-connector was originally an absolutely-positioned SVG line sized off a percentage-height calc that didn't land on the marker centers. Replaced with a plain `div` pinned to the marker's exact half-height (`top-7`), which is simpler and reliably correct.
3. **Pre-existing, not introduced this pass**: the Airport page's "Book Airport Transfer" button (added in §1c-4, unchanged since) rendered as a blank gold bar with invisible text — a stacking issue caused by its `-mt-8` negative margin overlapping the hero section without an explicit stacking context. Fixed with `relative z-[5]` on its wrapper. Found only because this pass did full-page screenshot QA rather than DOM-only checks.
4. A GSAP `revealStagger(..., {from:"right"})` pre-animation offset (`x:44`) on Contact's InfoCard stack technically extended `document.body.scrollWidth` on mobile even while the cards were still invisible/below the fold. Fixed with a local `overflow-x-hidden` on that specific wrapper (not applied sitewide, to avoid breaking the new Services sticky-media panel's positioning context).

### Validation

- `npx tsc --noEmit` — clean after every page and after the final fix round.
- `npm run build` — clean, route-level code splitting intact (each rewritten page still ships its own small chunk).
- Playwright sweep: 10 rebuilt pages × 3 breakpoints (1440/768/390) — zero console errors, exactly one `<h1>` per page, zero horizontal overflow after the fixes above (two real overflow bugs found and fixed, both documented above).
- Regression check after all page rewrites: MyLimoBiz widget still exactly 1 script/1 iframe and functional, Fleet's SEO metadata (title/canonical/tracking scripts) still correct and unique, Services page's 4 `/book` links all resolve correctly.
- Full-page visual screenshots reviewed for every rebuilt page at desktop width; two real rendering bugs found this way that DOM-only checks had missed (see above).

### Known follow-ups (not blocking, noted for a future pass)
- The other 8 breakpoints from the client's full validation matrix (1920×1080, 1600×900, 1366×768, 1024×768, 430×932, 375×812) were not individually screenshot-checked this pass — 1440/768/390 covered desktop/tablet/mobile representatively, but the full matrix would need a dedicated QA pass before final launch sign-off.
- Reduced-motion and keyboard-only navigation were not re-verified specifically against the new page layouts this pass (the underlying `prefersReducedMotion()` gating pattern was reused unchanged from already-verified components, but a fresh pass would be prudent before launch).

---

## 1c-6. Pre-launch quality-control pass (2026-08-02)

One focused QC pass across cursor interaction, image inventory, CTA clarity, responsive/keyboard/reduced-motion QA, and integration regression — approved scope was fixes only, no new sections and no redesign of approved page concepts. Found and fixed one **critical, launch-blocking regression** in the MyLimoBiz widget (below) that would not have surfaced without an explicit navigate-away-and-back test.

### 1. Custom cursor — responsiveness and click accuracy

**Root cause of the reported "laggy/disconnected" feel**: the magnetic-hover behavior snapped the visible pin to the exact geometric **center** of *any* `[data-cursor]` target, including large ones — the horizontal filmstrip drag zones (`HorizontalJourney`, Events) and full-width CTA rows. On a target spanning most of the viewport, "snap to center" could put the rendered pin tens or hundreds of pixels from the real pointer, which is exactly what "cursor feels disconnected from the pointer" looks like.

Fixes (`src/components/luxury/cursor.tsx`):
- Primary pin follow duration cut from 0.15s → **0.09s** (within the requested 0.06–0.12s band); shadow/trail layers tightened proportionally (0.2s/0.26s → 0.14s/0.2s).
- Magnetic pull is now a **capped hint, not a snap**: at most **10px** of pull toward a target's center, and only for `view`/`book`/`explore`/`play` modes on targets ≤220px in either dimension. `drag` targets (the filmstrips) and anything larger get **zero** magnetism — the pin tracks the raw pointer.
- Measured (Playwright, real synthetic pointer moves, not estimated): pull distance on a small nav CTA = **9.26px** (at the cap); pull distance on the Events drag filmstrip = **0.36px** (correctly near-zero).

### 2. Native cursor flashes

Root cause: `html.cursor-none * { cursor: none !important; }` had no exceptions — it forced `cursor: none` on text inputs, textareas, and iframes too, which is wrong (those need their native cursor, per the brief).

Fixes:
- `src/styles.css`: added an unlayered exception rule restoring `cursor: auto` on `input`/`textarea`/`select`/`[contenteditable="true"]`/`iframe` (checkboxes/radios/range excluded from the exception since those still want the custom pointer treatment).
- `src/components/luxury/cursor.tsx`: the whole cursor visual group now fades to `autoAlpha: 0` (opacity **and** visibility) whenever the pointer enters one of those same elements, so the decorative pin never visually overlaps the native text caret.
- Measured (Playwright): pin `isVisible()` = `true` → `false` while hovering a form input → `true` again after leaving it; native `cursor` CSS on the input = `"auto"` throughout. Third-party iframes (including the MyLimoBiz widget) are unaffected by any of this — they're a separate browsing context, so the parent's `cursor: none` never reaches inside them regardless.

### 3. Location-pin visual quality

Audited against the brief (champagne-gold metal, onyx core, bevel, grounded shadow, restrained tilt, no neon/spin/bounce, VIEW/BOOK/EXPLORE/DRAG/PLAY labels). No visual changes were needed — already compliant from the earlier pass; only the *motion* (item 1) and the *native-cursor exceptions* (item 2) needed fixing.

### 4–5. Image inventory and same-page repetition

Full inventory: **10 real client (DSC-origin) photos** in `public/assets/official/`, mapped through 17 named crops in `src/lib/image-map.ts` (each repeat of a source photo gets its own `object-position`, alt text, and storytelling role — this convention already existed and is preserved). Two additional files in `src/assets/` (`male-chauffeur-...utc (1).jpg`, `middle-aged-woman-...utc (1).jpg`) carry stock-photography filename conventions and are **not referenced anywhere in the app** — left alone, not promoted to brand imagery, since ownership/licensing isn't verified (same standard applied to video in §8 below). `ChatGPT Image Feb 14, 2026...png` and `5.png` are likewise unreferenced and untouched.

Re-auditing every route (including, critically, the **homepage as one page** — its 8 sections share one scroll, so a repeat between any two of them is a same-page repeat) against the hard "no repeated photo within the same page" rule found real violations, all fixed:

| Page | Violation found | Fix |
|---|---|---|
| Homepage | `HorizontalJourney` had grown two extra "Service" slides (Airport, Corporate) that duplicated `PinnedStories`' Airport and Corporate chapters — same titles, same source photos, both sections on the same page | Removed the 2 duplicate slides from `HorizontalJourney`; it's now a clean 4-vehicle fleet catalog (its own labels were already "01–04 — Fleet"), and the service narrative lives only in `PinnedStories`. This also removed the `airport`/`corporate` cross-page photo collisions, not just the content duplication. |
| Homepage | `PinnedStories`' Corporate chapter and `ChauffeurSection`'s main portrait — adjacent sections — both used `chauffeur-sclass-portrait.jpg` | `PinnedStories`' Corporate chapter now uses `cockpit-highway.jpg` (already used once, 3 sections away — not adjacent) |
| Homepage | `ChauffeurSection`'s door image and `BookingExperience`'s panel image — adjacent sections — both used `chauffeur-door-service.jpg` | `BookingExperience` now uses `fleetSedan` (`hero-sclass-chauffeur.jpg`), which otherwise only appears in `HorizontalJourney`'s Sedan slide, 4 sections earlier |
| `/fleet` | Page hero (`fleetCoachJourney`) and the Coach chapter (`fleetCoach`) both used `group-coach-bus.jpg` | Added a new crop, `fleetHero` (`chauffeur-interior.jpg`, distinct object-position from the existing `chauffeurInterior`/`about` crops of the same source), for the page hero |
| `/services` | "Event Transportation" and "Group Transportation" chapters, one after another, both used `events-fleet-stadium.jpg` | "Group Transportation" now uses `fleetCoach` (`group-coach-bus.jpg`) — thematically a stronger fit for "Sprinters and coaches" anyway |
| `/events` | Hero image and the "Weddings" filmstrip card both used `events-fleet-stadium.jpg`; "Galas" and "Multi-Day" cards both used `group-coach-bus.jpg` | Reassigned all 4 filmstrip cards to sources not used elsewhere on the page: Weddings→`chauffeur-door-service.jpg`, Galas→`chauffeur-sclass-portrait.jpg`, Corporate Events→`group-coach-bus.jpg`, Multi-Day→`cockpit-highway.jpg`; also gave each card real, distinct alt text (previously `alt={m.t}` duplicated the visible heading, which is a real if minor accessibility miss — alt text should describe the image, not repeat what's already announced) |

**Deliberate, documented exceptions** (repeats that remain, on purpose, because the underlying photo pool has exactly one shot of that subject): `group-coach-bus.jpg` still appears 3× on the homepage (hero, Fleet catalog's Coach slide, PinnedStories' Group Transportation chapter) — this is the one bus photo that exists, each instance already has a materially distinct crop/scale/purpose (documented in `image-map.ts`), and the hero crop was a specific client directive from 2026-07-31 (§1c-1) that this pass did not revisit. `fleet-escalade.jpg` still appears 2× on the homepage, adjacent (`HorizontalJourney`'s SUV catalog slide, immediately followed by `VehicleObjectJourney`'s dedicated "The Escalade, on your schedule" spotlight) — `VehicleObjectJourney`'s headline/pricing copy is specific to that vehicle, so swapping the photo would mean rewriting approved copy, which is out of this pass's scope; the two treatments are visually distinct (`object-cover` catalog crop vs. `object-contain` full-vehicle spotlight with reflection and headlight glow).

**Structural note for the client**: the site now has ~16 homepage image placements and ~25 interior-page placements drawing from only 10 distinct source photographs. Every *same-page* repeat has been eliminated except the two documented exceptions above; *cross-page* reuse (a photo appearing once each on two different pages, always with a different crop) remains common and is unavoidable at the current photo count. The single highest-leverage thing that would improve this further is more original photography — specifically a dedicated Sprinter/van shot (currently standing in with the stadium-district photo) and a second bus/coach angle.

### 6–7. Image/copy matching, quality, performance

Re-checked text-over-image placements sitewide for the forbidden list (faces, grilles, headlights, wheels, logos) — no violations found; existing gradient-overlay + `object-position` conventions already keep text in negative space. No stretched/enlarged low-res images found. Confirmed via a real network-request capture (Playwright) that scrolling the full homepage triggers **exactly 10 image requests, zero duplicates** — every lazy-loaded image downloads exactly once.

### 8. Video policy

No changes. The existing hero video (`hero-night-drive.mp4`, 1.4MB, `hero-night-drive-poster.jpg` poster) was re-audited against the full checklist: muted/autoplay/loop/playsInline/`preload="metadata"`, desktop-only (gated by `isDesktopMotion()`), paused via `IntersectionObserver` when scrolled out of view, mobile and reduced-motion get the static hero photo instead, 1-year immutable cache headers already configured in `.htaccess`. No second video was added, per the explicit instruction. The two stock-photo-named files noted in §4–5 were evaluated the same way this section evaluates video ownership — unverified origin, not promoted to use.

### 9. Hero video QA

No problems found; no changes made (see §8).

### 10–11. Interior-page standard and CTA clarity

Re-checked every interior page for regression after the image swaps — none found (signature interactions, copy, motion untouched by this pass; only which photo fills an existing slot changed). CTA audit found and fixed a real gap: **Contact, About, FAQ, Corporate, and Events had no path to instant `/book` booking at all** — only a Supabase quote/inquiry form. Fixes:
- **Contact**: added a "Book Your Ride" → `/book` action above the message form; softened the form's own `submitLabel` from "Send Reservation Request" to "Send Message" and its description to point back to the instant-booking option, so the honestly-secondary quote form no longer reads like a confirmed reservation.
- **Corporate**: added "Book Corporate Transportation" → `/book` above the itinerary section (opening a formal account, via the existing form, remains the separate long-lead-time path).
- **Events**: added "Book Your Ride" → `/book` above the filmstrip (the coordinated multi-vehicle request form remains for larger programs).
- **About**: had no conversion action of any kind. Added a single understated text-link CTA ("Reserve your ride →") at the page's close — deliberately not a gold button, to match the page's restrained editorial tone.
- **FAQ**: same gap, same fix (a calm, low-emphasis "Reserve your ride" link at the end of the accordion list, per the brief's instruction to keep this page restrained).

`BookingExperience` and `FinalCta` (the homepage's own quote-wizard-then-Book-Now sequence) were reviewed and left as-is — `FinalCta` immediately follows with a clear, correctly-labeled `/book` link, so the pairing already satisfies the primary/secondary CTA requirement without a redundant third link.

### 12–14. Responsive, keyboard, and reduced-motion QA

Automated (Playwright) sweeps, not manual spot-checks:

- **Responsive**: 15 routes (all 12 pages + `/privacy`, `/terms`, and a deliberately-invalid path for the 404) × 9 breakpoints (1920×1080 down to 320×568) = **135 combinations, 0 problems** (no horizontal overflow beyond a 2px tolerance, no console/page errors, exactly one `<h1>` per page throughout).
- **Keyboard**: opening the mobile nav moves focus to the first link; **Tab now correctly traps inside the open menu** (see bug below); Escape closes it and returns focus to the trigger button; the FAQ accordion opens via <kbd>Enter</kbd> (native `<details>`/`<summary>`, no custom JS needed); form labels are now programmatically associated with their inputs (see bug below) — clicking a label correctly focuses its field; no duplicate `id` attributes found on a representative page.
- **Reduced motion**: 12 routes checked under `prefers-reduced-motion: reduce` — custom cursor disabled on all of them, no autoplaying video, no stuck `clip-path` reveals, substantial visible body text on every page (nothing left permanently hidden), zero console/page errors.

**Two real accessibility bugs found and fixed** (both pre-existing, not introduced by Phase 4):

1. **Mobile nav had no focus trap.** The overlay is visually opaque (full-screen, blurred, `z-40`), but nothing stopped `Tab` from moving focus past the last menu link into `<main>` content sitting behind it — a keyboard user's focus would silently disappear onto something they couldn't see. Fixed in `src/components/site-nav.tsx`: the existing `Escape` key-handler now also intercepts `Tab`/`Shift+Tab` and cycles focus between the first and last focusable element inside the open panel.
2. **Every `LeadForm` field was an unlabeled form control.** `<label>` and `<input>`/`<textarea>`/`<select>` had no `id`/`htmlFor` pairing at all (siblings, not `label`-wraps-`input`) — a screen reader had no way to announce which label belongs to which field, on every lead form sitewide (Contact, Airport, Corporate, Events, Fleet, Services, the homepage booking wizard). Fixed in `src/components/lead-form.tsx`: each field now gets a stable `id` (`${formType}-${fieldName}`), the label gets a matching `htmlFor`, and each control also gained a `name` attribute (previously absent — weakens autofill/semantics) plus `aria-invalid`/`aria-describedby` wired to its error message.

### 15. Integration regression — critical bug found and fixed

Routine regression testing (direct `/book` load → SPA-navigate away → SPA-navigate back → hard refresh) surfaced a **severe, launch-blocking bug in the MyLimoBiz widget** that would not have been caught without this exact sequence:

**Symptom**: on first visit to `/book`, the widget correctly initialized (1 script, 1 live iframe). After navigating to any other page and back to `/book` via the site's own `<Link>` navigation, **the iframe was gone** — the slot showed the raw, un-upgraded `<a data-ores-widget>` anchor instead, meaning a returning visitor would see a dead link where the booking form should be.

**Root cause**: `MyLimoBizWidgetHost` (`src/components/booking/mylimobiz-widget.tsx`) kept the widget's anchor as a React-owned JSX element and moved it between an off-screen host and the `/book` slot with `createPortal`. The third-party `widget-loader.js` script replaces that anchor with an iframe using plain DOM mutation (`replaceWith`), entirely outside React's knowledge — React's fiber for that element still references the original, now-detached anchor object. The instant anything makes React reconcile that subtree again (in this case, moving the portal to a different target when the route changes), React re-inserts *its own stale reference* into the DOM, silently undoing the third party's work. This is a fundamental incompatibility between "React owns and re-renders this subtree" and "a third-party script mutates this subtree outside React" — no amount of memoization or stable keys fixes it, because the problem isn't *what* React renders, it's that React ever touches the subtree again at all after handoff.

**Fix**: rewrote the component to manage the widget's DOM with plain `document.createElement`/`appendChild` calls, created exactly once, and moved between the hidden host and the `/book` slot imperatively in a `useEffect` — the component itself renders `null`. React never owns or reconciles the anchor/iframe again after the first commit, so it can never revert whatever the third-party script has done to it.

**Verified fixed** (Playwright, exact scripted repro of the bug): iframe count = 1 on direct `/book` load, 1 after SPA-navigate-away-and-back, 1 after hard refresh — previously 1 / **0** / 1. Also confirmed: exactly 1 `widget-loader.js` script tag in all cases (the third-party's own companion `iframeResizer.min.js` script is separate and expected, not a duplicate); Google Ads and StatCounter scripts remain exactly 1 each throughout; zero console errors, zero CSP violations logged during the whole sequence.

### 16. Performance regression

- No cursor-caused re-render loop: pointer tracking uses `gsap.quickTo` (direct DOM transform writes), not React state, for anything that fires on `mousemove`; state only updates on hover-target *changes* (not continuously).
- `Analytics` (click tracking) and `Cursor` each use exactly one delegated listener at the document/window level — confirmed by code review, no per-element listeners anywhere.
- No duplicate image downloads (§6–7).
- CLS on the homepage: **0.007** (Lighthouse, real metric — an earlier synthetic "scroll the whole page in 1 second" test produced a misleadingly high number, which is an artifact of forcing multiple pinned-section transitions through faster than any real user could scroll, not a real layout-shift problem).
- Lighthouse Performance score itself (26) is **not trustworthy in this environment** — the same caveat documented in §1c-4 recurred: `Get-Process` showed `msedgewebview2`/`firefox`/other tooling consuming 18,000+ cumulative CPU-seconds on this shared machine while the audit ran, and Lighthouse's CPU-throttled timing metrics (LCP 16.2s, TBT 7.8s) are implausible for a ~505KB main bundle with route-level code splitting and lazy-loaded images. Accessibility (96/100, up from 91 — the two form/focus-trap fixes above), SEO (100/100), and CLS aren't CPU-timing-dependent and are treated as trustworthy. The two Best Practices flags (`third-party-cookies`, one `color-contrast` hit on the `aria-hidden` decorative background numeral) are both expected/reviewed, not real bugs — see below.
- Bundle sizes unchanged from Phase 4 (main vendor chunk 505.90kB / 171.55kB gzip; every route still its own small code-split chunk).

### 17. Final validation

- `npx tsc --noEmit` — clean.
- `npm run build` — clean, 45s, route-level code splitting intact.
- `npm audit` — same 2 pre-existing advisories as before (esbuild, vite — both dev-server-only, not exploitable in the production static build; documented in `LAUNCH_CHECKLIST.md`, deliberately not force-upgraded outside the pinned range without explicit approval). No new advisories introduced.
- Browser console QA — zero errors across every sweep above (135 responsive combinations, 12 reduced-motion routes, the full MyLimoBiz regression sequence).
- Responsive screenshot/DOM QA, keyboard-only QA, reduced-motion QA, cursor click-accuracy QA, MyLimoBiz regression QA — all above, all passing after fixes.
- Representative Lighthouse run — see §16 (Accessibility 96, SEO 100, CLS 0.007 trustworthy; Performance score not trustworthy on this shared machine).

### Remaining launch blockers

None found in this pass that weren't already fixed. Carried forward from earlier phases (unchanged by this pass, still open):
- The pending Supabase rate-limit migration (`supabase/migrations/20260802010000_form_submission_hardening.sql`) still needs to be applied to the live project — no CLI credentials in this environment.
- GA4 measurement ID was never provided; GA4 remains deliberately not installed.
- Old-site URL list for redirects has not been provided yet.
- The full 12-breakpoint × 15-route matrix was covered by automated overflow/console checks, not manual visual screenshot review of every combination — the 9-breakpoint automated sweep in this pass is a meaningfully broader safety net than Phase 4's 3-breakpoint one, but a final human visual pass before go-live is still worthwhile.

### Stop-conditions respected
Nothing deployed. DNS untouched. Old Clienity site and Namecheap email untouched. No paid MyLimoBiz booking submitted (widget regression testing only confirmed the iframe/script were present — no form inside it was completed). MyLimoBiz's persistent-widget *architecture* is unchanged in intent (still one script, one long-lived DOM node, one iframe) — only its internal implementation mechanism changed, to actually deliver on that architecture's own documented guarantee. No SEO/security/tracking/Supabase/routing/validation work was weakened; the CSP, security headers, canonical/JSON-LD metadata, and rate-limiting code from §1c-4 are all unchanged and were re-verified intact during this pass.

---

## 1c-7. Fleet page conversion-flow pass (2026-08-02)

Focused, additive pass on `/fleet` only, per explicit client direction: the page looked premium but had no clear per-vehicle conversion action, and relied on the navbar's generic "Book Now" alone. No visual redesign — only CTA hierarchy and conversion-path work, layered onto the existing 4-chapter structure from §1c-5.

### 1–3. Per-vehicle CTAs

Every vehicle chapter now has a visible, vehicle-specific primary action next to its capacity/pricing block, using the exact approved copy (not a generic template):

| Vehicle | Status | Primary CTA | Destination |
|---|---|---|---|
| Executive Sedan (S-Class) | Bookable | **Book This Vehicle** | `/book` (MyLimoBiz) |
| Executive SUV (Escalade) | Bookable | **Book This Vehicle** | `/book` (MyLimoBiz) |
| Executive Sprinter | Quote-only | **Request a Sprinter Quote** | Scrolls to and prefills the page's own Fleet Inquiry form |
| Executive Coach | Quote-only | **Request a Coach Quote** + secondary **Call Dispatch** | Same form prefill + `tel:` link to the verified business number |

**Data change**: `FLEET_VEHICLES` in `src/lib/site-data.ts` — Sprinter's `status` reclassified from `bookable` to `quote_only`, per explicit client direction in this pass ("coach and sprinter remain quote-only"). Its verified `$200/hour` rate is still displayed; only the booking *mechanism* changed, not the pricing data.

**Quote-only CTAs don't navigate away.** Rather than sending the user to `/contact` (a different form, without vehicle context), clicking "Request a Sprinter/Coach Quote" now smooth-scrolls to the page's own existing Fleet Inquiry section (`#fleet-inquiry`, already a Supabase `formType="fleet"` form with a "Vehicle of Interest" select) and prefills that field with the clicked vehicle's name. This keeps the user on-page and preserves context, which is a stronger conversion path than a redirect — verified via Playwright: click → scroll lands on the form → `vehiclePreference` select shows the correct vehicle.

Bookable CTAs (`data-cursor="book"`) route straight to `/book`; quote CTAs (`data-cursor="explore"`) never claim to be direct booking.

### 4. Sticky Fleet conversion bar

New `FleetConversionBar`, rendered only on `/fleet`, fixed at the bottom on **both desktop and mobile** (the brief's own example showed a 3-line layout; implemented as a single-row, space-efficient bar: vehicle name + capacity/price on the left, one compact CTA on the right — "Book This Vehicle" or "Request a Quote"). Tracks the vehicle currently in view via `IntersectionObserver` (functional, so it runs the same regardless of reduced-motion, unlike the page's decorative GSAP reveals) and updates instantly — verified showing "Executive Sedan" at the top of the page and "Executive Coach" once scrolled to that chapter.

**No stacked/duplicate bottom bars**: the sitewide `MobileBookBar` (mobile-only, generic "Book Now") now also steps aside on `/fleet` specifically (it already did on `/book`), since showing a generic bar alongside a vehicle-specific one would be exactly the CTA clutter the brief asked to avoid. `FloatingActions` (WhatsApp/phone FABs) is now route-aware too — it lifts its bottom offset on `/fleet` on *both* breakpoints (previously it only adjusted for the mobile-only `MobileBookBar`) so it never sits on top of the new bar. Verified via Playwright at 390×844: FAB bounding box does not intersect the sticky bar's bounding box.

### 5. Conversion copy

Added/replaced short one-line descriptions under each vehicle name with the exact approved copy — Sedan (previously had none), SUV, Sprinter (both previously had different, unapproved wording), and Coach (previously reused a feature bullet as filler text, replaced with real copy). No paragraphs added; existing feature-bullet lists were left untouched.

### 6. Mobile

Verified at 320×568 and 390×844: zero horizontal overflow, sticky bar CTA label not clipped, FAB stack clear of the bar. The sticky bar's fixed 64px height is taller than the sitewide `MobileBookBar` it replaces on this page (52px) — accepted as-is rather than modifying the global `SiteLayout` padding system for one page's bar; the bottom-most section (Fleet Inquiry) already has 96px of its own bottom padding, comfortably clearing the bar without covering any interactive content. As with `MobileBookBar` sitewide already, the sticky bar does sit over the tail of the footer at maximum scroll depth on `/fleet` — a pre-existing, accepted sitewide tradeoff, not new to this pass.

### 7. Tracking

Added `fleet_vehicle_book_click`, `fleet_vehicle_quote_click`, `fleet_call_dispatch_click` to `src/lib/tracking.ts`, each carrying the vehicle id. None fire a conversion/purchase event — click-intent signals only, matching the existing pattern (`reach_booking_page` etc.) documented as the honest limit of what this site can verify without a MyLimoBiz confirmation webhook.

**Bug found and fixed while wiring this up**: TanStack Router's `<Link>` composes a caller-supplied `onClick` with its own internal navigation handler (`composeHandlers([onClick, handleClick])`, confirmed in the installed package source and in the shipped production bundle) — but empirically, verified with a repeatable Playwright repro on this exact page, that composed handler never actually invoked the passed-in `onClick`, on two separate `<Link>` instances (the in-chapter CTA and the sticky bar's CTA), while a plain `<button>`'s and a plain `<a href="tel:">`'s `onClick` on the same page fired normally. Root cause not fully isolated (ruled out: `data-cursor` attributes, console-log stripping, Playwright-specific interaction quirks — confirmed via a native `element.click()` and a manually dispatched `MouseEvent` from within the page, and via direct inspection of the React fiber's composed handler). Practical fix: `onMouseDown` is not part of Link's composed prop set at all (confirmed in source), so it passes straight through to the underlying anchor untouched — used instead of `onClick` for the two bookable-vehicle tracking calls, verified firing reliably. Every other CTA on this page (quote buttons, the Call Dispatch link) uses plain elements and was unaffected.

### 8. QA

- Every vehicle chapter has exactly one primary action, matching the approved label/destination table above — verified via Playwright.
- Sedan/SUV route to `/book`; Sprinter/Coach have no `/book` link at all, only the quote-scroll button — verified.
- Coach has a `tel:` Call Dispatch link; no other chapter does — verified.
- MyLimoBiz regression: reached `/book` via the new Fleet CTA, widget still initializes to exactly 1 script / 1 iframe — verified.
- Fleet Inquiry form: client-side validation (empty-submit shows "Please enter your full name" / "Please enter a valid email") still works, `vehiclePreference` prefill confirmed — verified.
- Reduced-motion: sticky bar remains visible and its active-vehicle tracking still updates correctly on scroll (it's functional, not gated on motion preference, unlike the page's decorative GSAP reveals) — verified.
- Responsive: 126 route×breakpoint combinations swept (14 routes × 9 breakpoints) — 0 problems outside two expected `/book`-only `networkidle` timeouts (that page's live third-party iframe never goes fully idle; separately verified `/book` loads and the widget initializes correctly using a fixed wait instead).
- Keyboard/focus: CTAs use the sitewide global `:focus-visible` outline rule (same mechanism verified in the pre-launch QC pass, §1c-6) — real focus ring confirmed via actual Tab navigation, not just class-name inspection.
- `npx tsc --noEmit` and `npm run build` — both clean.

### Stop-conditions respected
No redesign — same 4-chapter structure, same signature interactions, same images from §1c-5/§1c-6, purely additive CTA/copy/tracking work. Nothing deployed, DNS/old site/email untouched, no paid booking submitted. MyLimoBiz architecture and all SEO/security/tracking/Supabase work from prior passes re-verified intact, not weakened.

---

## 1c-8. Three.js + GSAP restrained 3D enhancement layer (2026-08-02)

Added a decorative WebGL layer to four approved surfaces — the loader, Contact, Fleet, and Service Areas — using `three` + `@react-three/fiber` + `@react-three/drei` (all already present in `package.json`/`node_modules`) plus `@gsap/react`'s `useGSAP` (newly installed). No redesign: every existing layout, the MyLimoBiz integration, Supabase forms, SEO/CSP/security headers, tracking, route transitions, and responsive/keyboard behavior are all unchanged and re-verified intact.

### Architecture

- `src/lib/three/capability.ts` — `shouldUse3D()`: the same desktop-motion bar used everywhere else on the site (`isDesktopMotion()` — min-width 1024px, fine pointer, no reduced-motion) plus a real `canvas.getContext("webgl")` support check. This is the single gate every scene uses; nothing 3D ever renders outside it.
- `src/lib/three/Scene3D.tsx` — the shared entry point for Contact/Fleet/Service Areas. Deliberately contains **zero** `three`/`@react-three/fiber` imports itself, so merely referencing it never pulls Three.js into a route's bundle. It re-checks `shouldUse3D()` on resize/reduced-motion-change, mounts an `IntersectionObserver` to lazily render (and fully unmount, not just pause) its children only while scrolled into view, and always requires a `fallback` prop.
- Each page's actual Canvas content lives in its own small file with a **default export** (`contact/pin-canvas.tsx`, `fleet/wheel-canvas.tsx`, `service-areas/map-canvas.tsx`, `luxury/loader-scene-canvas.tsx`), imported via `React.lazy(() => import(...))` from the route file — this is what makes Three.js a genuine route-level dynamic import rather than part of the main bundle.
- `src/lib/three/SceneCanvas.tsx` — shared `<Canvas>` defaults: `frameloop="demand"`, `dpr={[1, 1.5]}` (capped, not device-native on high-DPI screens), `gl={{ powerPreference: "low-power" }}`.
- Shared, reused primitives (built once as this pass's "shared reusable scene system"): `GoldPin` (a `LatheGeometry` revolved from the same teardrop profile as the 2D cursor pin's SVG path — used on Contact, both loader pins, and all 4 Service Areas markers), `GoldVehicle` (a small primitive-built sedan silhouette for the loader), `GoldWheel` (Fleet's rim, spokes rendered via a single `InstancedMesh` rather than 6 separate meshes), `DrawnLine` (a gold route line that draws itself via an imperative `setProgress(0..1)` ref handle), and `materials.ts` (the exact champagne-gold/onyx hex palette already established by `cursor.tsx`/`brand-loader.tsx`'s SVGs — hex, not `oklch()`, since Three.js materials need literal JS values).
- **GSAP owns every transform**: entrances, idle loops, pointer-tilt, route-draw progress, vehicle position/rotation along its curve, and camera moves are all `gsap`/`useGSAP` tweens mutating Three.js objects directly (never React state on every frame) — each `onUpdate` calls R3F's `invalidate()` to render exactly one frame under `frameloop="demand"`. `useGSAP` (from `@gsap/react`) handles cleanup/revert everywhere, matching this project's existing `gsap.context()` convention.
- No post-processing library was added (no bloom/EffectComposer) — the "premium reflection" look comes from `MeshPhysicalMaterial`'s `clearcoat`/`clearcoatRoughness` plus 2–3 positioned lights, not an environment map or extra render passes, keeping the bundle to exactly what three/fiber/drei themselves cost.
- No model files (no `.glb`/`.gltf`), no textures, no HDR — every shape is procedural geometry (`LatheGeometry`, `TorusGeometry`, `RoundedBox`, primitives), so there's nothing to Draco/Meshopt-compress and no new asset domain to add to CSP.

### Scene 1 — Loader

Upgrades the existing session-gated cinematic loader's STEP 2–5 "route stage" (previously an SVG + DrawSVGPlugin + MotionPathPlugin sequence) with a 3D equivalent: a small `GoldPin` appears at the origin, a `DrawnLine` route draws itself, a `GoldVehicle` travels the curve oriented to its tangent, the destination `GoldPin` activates with a soft glow, and the camera performs a subtle push-in (`z: 3.4 → 2.7`) — then the scene fades and the existing wordmark/tagline/progress-bar/curtain-dissolve tail (STEP 6–7, completely unchanged) takes over.

**This was the highest-risk item in this pass** (first-impression, session-gated, hard to iterate against) and was handled conservatively:
- The reduced-motion/mobile branch is **completely untouched** — it never even evaluates `shouldUse3D()`, so it stays exactly as fast and WebGL-free as before.
- The full-motion desktop path now branches on `shouldUse3D()`: capable visitors get the 3D route stage; everyone else gets the **exact original SVG sequence**, unchanged.
- The 3D route-stage chunk is prefetched the instant the branch is chosen (in parallel with the ~0.6s map fade-in that plays either way), and its `Suspense fallback` is `null` rather than a loading spinner — worst case on a very slow connection, the map background is briefly empty before the pin appears; the sequence is never stuck waiting.
- The outer timeline was split into "Phase A" (route stage — either the original SVG timeline or the 3D scene's self-contained `useGSAP` timeline) and a shared "Phase B" (wordmark → progress → curtain, extracted verbatim from the original timeline's tail, just re-based to start at 0) — the 3D scene calls `onDone` when its sequence finishes, which triggers Phase B, so both paths converge on the identical closing beats.

**Bug found and fixed during testing**: the first working version left the 3D route-stage `<div>` at full opacity through Phase B, so the wordmark could appear while the gold pin/route were still visible underneath (the original SVG path explicitly fades `.loader-route` out first — the 3D path was missing the equivalent). Fixed by fading `.loader-route-3d` out as part of the `onDone` handoff, immediately before Phase B starts. Verified via a rapid-poll Playwright script (checked loader state every 150ms through a full play-through): the 3D canvas does render mid-sequence, and no frame shows both the route stage and the wordmark visible together.

### Scene 2 — Contact page pin

Replaces the flat SVG pin (built in the pre-launch QC pass, §1c-6) with a 3D `GoldPin`: champagne-gold `MeshPhysicalMaterial` body, dark onyx emblem sphere, a bright glint highlight, continuous gentle idle bob/sway (GSAP infinite yoyo timeline), and a subtle pointer-reactive tilt (`gsap.quickTo` on rotation, tracking real `pointermove` events against the canvas's bounding rect — capped at ~9°, never a spin). The **exact original SVG markup** is preserved verbatim as the `Scene3D` fallback, so non-qualifying visitors see precisely the same experience as before this pass.

### Scene 3 — Fleet page wheel accent

One lightweight accent, per the brief — an abstract rotating alloy rim (`GoldWheel`: torus rim + cylinder hub + 6 instanced spokes) placed in a small 96–112px slot between the hero and the vehicle chapters. Slow continuous rotation (~26s per revolution — reads as "idling," not spinning). Photography in the 4 vehicle chapters is completely unchanged and remains the primary content; this never substitutes for it. Fallback is a static SVG using the same gold-gradient rim/spoke motif.

**Bug found and fixed during testing**: the first version had the rim geometry rotated to view it edge-on (like a coin from the side) instead of face-on (the actual product-shot angle for a wheel/rim) — a torus's default orientation already faces the camera, and an extra 90° rotation (copied from the hub cylinder, which genuinely needs it) tipped it the wrong way. Caught via screenshot review, fixed by removing the rim's rotation while keeping the hub's.

### Scene 4 — Service Areas route visualization

Replaces the flat SVG diagram (§1c-6) with a 3D scene using the same 4 verified locations and route pairs: a simplified dark plane (no imagery, no map tiles), a `GoldPin` at each location, `DrawnLine` routes between them that draw in on entrance, and a slightly elevated/angled camera for genuine depth. Hovering a 3D pin (R3F's built-in pointer-event raycasting) highlights it and also cross-highlights the matching entry in the **always-visible DOM location list** next to it — verified via Playwright (hovered the correct screen coordinates for 2 of the 4 markers, confirmed the matching list item gained the highlight class both times). No unsupported cities were added; positions remain stylized, not surveyed, matching the existing note. Fallback is the exact original SVG diagram, with the hover-highlight behavior preserved (the fallback pins scale up slightly on the corresponding hover index too).

### Accessibility

- Every scene's outer wrapper carries `aria-hidden="true"` (`Scene3D`'s default) — verified present on all three page-level scenes via DOM ancestor walk.
- All canvases have `tabIndex: -1` (not keyboard-focusable) — verified via Playwright; no keyboard trap is possible.
- No essential information lives only in a 3D scene: Contact's address text, Fleet's vehicle names/pricing/photography, and Service Areas' location names/notes are all real, always-present DOM content, identical whether or not the 3D scene renders. The Service Areas hover-highlight is a bonus cross-reference for mouse users, not a gate on any information a keyboard/AT user can't already get from the static list.
- Canvases are `pointer-events: auto` only where interaction is meaningful (Service Areas' hover raycasting); Contact and Fleet's scenes are purely decorative and don't need to receive pointer events at all beyond the page-level `pointermove` listener Contact's tilt effect reads. None of the three sit anywhere near the MyLimoBiz iframe, forms, or nav links — confirmed no overlap and re-verified all forms/links/the widget still function after this pass.
- Reduced-motion and touch/coarse-pointer devices never see or fetch any 3D content anywhere (loader included) — confirmed via network-request interception (zero Three.js-related requests) on both the homepage and all three page scenes under `reducedMotion: "reduce"` and mobile emulation.

### Bundle impact

Every scene's Canvas content is a separate dynamic import; Rollup automatically de-duplicates the shared `three`/`@react-three/fiber`/`@react-three/drei` dependency graph into one chunk (confirmed by chunk size staying ~889.8kB / 239.7kB gzip whether 1, 2, or 3 scenes had been built at the time — it's fetched once per session, shared across every 3D surface, not once per page). Per-scene wrapper chunks are tiny: `pin-canvas` 1.7kB, `wheel-canvas` 1.5kB, `map-canvas` 2.0kB, `loader-scene-canvas` 5.7kB (all gzip). The shared `DrawnLine` component (used by the loader and Service Areas) is its own 20.5kB/6.4kB-gzip chunk. The main, always-loaded app bundle grew by **~1.8kB** (505.9kB → 507.4kB) — confirming Three.js itself never entered the critical path; only the capability-check module and lazy-import wiring did.

### Performance results

- **Memory**: 15 repeated navigation cycles through Fleet → Service Areas → Contact (45 mount/unmount cycles of 3D scenes total) showed **identical** JS heap size before and after (12.8MB → 12.8MB) — no measurable leak.
- **Canvas/context accumulation**: repeated navigation through the same 3 pages 7 times in a row never left more than 1 `<canvas>` element in the DOM at once — each scene's WebGL context is released on unmount (full unmount on scroll-out/route-change, not just a paused flag) before or as the next one mounts.
- **Frame rate**: ~59.3 FPS measured via `requestAnimationFrame` counting while the Contact pin's continuous idle animation was running — no collapse.
- **DPR**: capped at 1.5 sitewide via `SceneCanvas`, regardless of the visiting device's actual pixel ratio.
- **Lighthouse** (Contact page, representative): Accessibility 95/100, SEO 100/100, CLS 0.001 (trustworthy — not CPU-timing-dependent). The Performance score itself (31) is **not trustworthy in this environment** — the same documented caveat from the pre-launch QC pass (§1c-6) recurred: `Get-Process` showed `msedgewebview2` alone consuming 23,000+ cumulative CPU-seconds on this shared machine during the run.
- **CSP**: zero violations logged across every page tested, including `/book` (MyLimoBiz iframe) — no new external domain was added, since every asset is procedural/local.
- **MyLimoBiz regression**: re-verified exactly 1 script / 1 iframe on direct `/book` load and after navigating through the Contact page's new 3D scene and back — unaffected by this pass.

### Mobile fallbacks

All four scenes fall back to static content below the `min-width: 1024px` / fine-pointer bar: the loader's existing SVG sequence (already mobile's default path, untouched), Contact's original SVG pin, Fleet's static SVG rim graphic, and Service Areas' original SVG diagram (with its hover-highlight logic preserved via a plain `activeIndex` prop instead of 3D raycasting). Confirmed via mobile emulation (390×844, touch, `isMobile`) on all three page routes: 0 canvases, 0 Three.js-related network requests, 0 horizontal overflow.

### Validation performed

- `npx tsc --noEmit` — clean.
- `npm run build` — clean; chunk breakdown confirms correct code-splitting (above).
- `npm audit` — same 2 pre-existing dev-server-only advisories as every prior pass (esbuild, vite); no new advisories from `@gsap/react` or the already-installed three/fiber/drei.
- Responsive sweep: **98 combinations** (14 routes × 7 breakpoints: 1920×1080, 1440×900, 1024×768, 768×1024, 430×932, 390×844, 375×812) — 1 flagged result, a transient `net::ERR_CONNECTION_RESET` on `/book` at 1024×768 from MyLimoBiz's live external iframe (not this project's code; consistent with previously-documented `/book`-specific test flakiness) — otherwise 0 problems, 0 overflow, exactly one `<h1>` per page throughout.
- Canvas-count-by-breakpoint check confirmed all three page scenes mount only at ≥1024px width and never below.
- Full accessibility, memory, canvas-accumulation, frame-rate, CSP, and MyLimoBiz regression checks — all above, all passing.

### Known limitations

- The loader's 3D route stage depends on a ~240kB-gzip chunk fetching within roughly the first ~2.4s of the sequence (the map fade-in plus prefetch head start) to be visible at all for a *first-ever* session on a given device; on an unusually slow connection, that one-time play-through would show an empty route-stage area rather than the pin/route/vehicle, then proceed straight to the wordmark — never stuck, just less content for that one visitor. All subsequent sessions benefit from browser caching of the same shared chunk (also used by Contact/Fleet/Service Areas).
- Environment-level Lighthouse Performance scores remain unreliable on this specific shared dev machine, as documented in every prior pass — CLS, accessibility, and SEO scores are the trustworthy signals here.
- No new automated test coverage was added for the GSAP↔Three.js timing choreography itself (i.e., no unit tests asserting exact tween values) — verification was via Playwright DOM/visual/network inspection, consistent with this project's existing QA approach throughout.

---

## 1c-9. Three.js correction pass — loader, Contact map, Fleet, Hero video (2026-08-02)

§1c-8's 3D layer shipped visually sound but with real regressions: the loader could hang indefinitely, the Contact pin floated with no map context and read too dark, the Fleet wheel ran a needless continuous WebGL loop, and the Hero video was a low-resolution, likely-unlicensed upscale. This pass is a correction, not a new feature: **no new visual effects were added**; the changes are fixes, simplifications, and one content-quality swap (Hero media). Nothing about MyLimoBiz, Supabase, SEO, tracking, CSP/security headers, forms, or routing/business logic changed. Not deployed.

### 1. Loader root cause

The loader's page-unlock path for 3D-capable visitors depended on a single `onDone` callback from a lazily-loaded, WebGL-dependent scene (`loader-scene.tsx`), with **no timeout anywhere in that path**. Two independent ways this could hang forever, both real: (a) any failure in the lazy `import()`, WebGL context creation, or an unhandled exception inside the scene's render/GSAP code had nothing to catch it — the loader's `overflow: hidden` scroll lock and full-screen overlay would simply never clear; (b) `loader-scene.tsx` itself had an early-return guard (`if (!origin || !dest || !vehicle || !destGlow) return;`) that skipped calling `onDone()` entirely when any ref wasn't ready on first render — a silent hang, not a crash, so it produced no error to notice.

### 2. Loader fix

- `hardFinish()` in `brand-loader.tsx`: an idempotent finish function (guarded by a `finished` flag) that clears all pending timers, unconditionally resets `document.body.style.overflow = ""`, and fades/dismisses the loader. Called from every exit path.
- An absolute **3.5s watchdog** (`HARD_WATCHDOG_MS`) set unconditionally at the top of the loader's effect — the page is guaranteed usable by then no matter what else happens.
- A **300ms race** (`THREE_D_RACE_MS`) between the 3D scene's dynamic-import prefetch and a timeout: if the chunk isn't ready in 300ms, the loader commits immediately to the original SVG/DrawSVG/MotionPath sequence (`startSvgPhaseA()`) instead of waiting. If the 3D chunk resolves first, it's used; if it rejects (network failure, WebGL init failure), the SVG path is used instead — either way the decision is made once and is never blocking.
- A new `LoaderSceneBoundary` (class component, `getDerivedStateFromError`/`componentDidCatch`) wraps the lazy 3D scene so a render-time throw inside it can't hang or crash the parent — it falls through to the SVG tail instead.
- Fixed `loader-scene.tsx`'s early-return bug to call `onDone()` before returning.
- The shared closing sequence (wordmark/tagline/progress/curtain) and the SVG route sequence both got `timeScale` applied (1.8 and 2.6 respectively) to bring total duration into the ~2.5–3s budget on a normal connection, without re-timing every individual offset by hand.
- The reduced-motion/mobile branch was already fast (~1.2s) and is functionally unchanged.

**Verified empirically** (Playwright, normal preview server unless noted): normal visit ~928ms; 3D chunk network-aborted ~982ms; WebGL fully blocked ~1089ms; 3D chunk artificially delayed 2s ~1045ms (proves the race commits to the fallback rather than waiting); simulated slow-3G ~5.6s (this one is dominated by the initial bundle fetch itself under extreme throttling, not loader logic — the ~2.5–3s budget was scoped to normal connections, per the brief). No repeated full loader on internal route navigation — the full loader is session-gated (`sessionStorage`) exactly as before; internal SPA nav does not re-trigger it.

### 3. Contact map implementation

Added `src/components/contact/map-backdrop.tsx` (`ContactMapBackdrop`) — a pure, static SVG (no Three.js, no map SDK, no screenshot), viewBox `0 0 400 240`, layered behind the pin: a near-black charcoal surface, restrained warm-gray primary roads and low-opacity silver secondary roads, one subtle gold-gradient route connecting a DFW Airport reference marker to the Grapevine intersection where the pin sits, and a radial vignette keeping the pin the focal point. "Grapevine, Texas 76051" and all service-area/contact info remain real, always-present semantic HTML — the map is decorative context only, exactly as scoped.

**Bug found and fixed during this pass**: the first version placed the "GRAPEVINE" label directly behind the pin's lower body (found via screenshot review); moved it clear of the pin's tip (y=168 → y=222), reconfirmed via a second screenshot.

### 4. Pin color/material change

- `materials.ts`: `GOLD_PHYSICAL_PROPS.color` changed `GOLD_MID` → `GOLD_SOFT` (brighter face), `roughness` 0.28 → 0.22 (sharper highlight); `clearcoat`/`clearcoatRoughness` removed entirely (see performance fix, point 6).
- Contact's light rig (`pin-scene.tsx`) rebuilt: a bright `GOLD_GLINT`-colored front key light, a dim `GOLD_SOFT` fill, and a `GOLD_DEEP`-tinted rear rim light — this is what produces the "brighter gold front / darker bronze sides" look the brief asked for; it comes from lighting, not a second material.
- Net effect: brighter metallic gold face, clear highlight, dark onyx center retained, no muddy brown, no added bloom/glow. Confirmed via screenshot against the rebuilt map backdrop — pin reads clearly at standard brightness.

### 5. Logo size (before/after)

Contact page signature logo: `h-24 md:h-28 lg:h-32` → `h-14 md:h-16 lg:h-20` (roughly 40–42% smaller across breakpoints), wrapper margin `mb-12` → `mb-16` for more breathing room. Aspect ratio preserved (height-only class change, `w-auto` unchanged). The header logo (global nav) was not touched and remains at its original size — confirmed by grep, no shared class between the two.

### 6. Three.js performance changes

- **Capability gating** (`capability.ts`) extended beyond pointer type: `shouldUse3D()` now also returns `false` for `navigator.deviceMemory < 4`, `navigator.hardwareConcurrency < 4`, `connection.saveData`, or `connection.effectiveType` matching `slow-2g|2g|3g` (all guarded with `typeof` checks, since these Navigator APIs are non-standard/not universally supported). Added `isHighCapabilityDevice()` (memory ≥ 8 **and** cores ≥ 8) feeding a new `dprRange()` — `[1, 1.25]` normally, `[1, 1.5]` only on high-capability devices — replacing the previous flat `[1, 1.5]` used everywhere.
- **Page-visibility gating**: `Scene3D` now tracks `document.visibilitychange` in addition to its existing `IntersectionObserver`; a scene only renders while both in-view **and** the tab is visible, and fully unmounts (not just pauses) otherwise — verified via Playwright tab-hide/show simulation.
- **Fleet wheel removed.** Deleted `fleet/wheel-canvas.tsx`, `fleet/wheel-scene.tsx`, and `lib/three/GoldWheel.tsx` (confirmed unused elsewhere via grep first). Per the brief's explicit framing — "non-essential," "do not retain Three.js purely because it has already been built" — the accent is now a static SVG rim (same gold-gradient motif as the old fallback) spun via a single CSS `@keyframes spin` (`motion-safe:animate-[spin_26s_linear_infinite]`), gated by the same `motion-safe:` Tailwind variant used sitewide for reduced-motion. Zero JS render loop, zero WebGL context, same visual result.
- **Contact/Service Areas retained** — both already used `frameloop="demand"` with GSAP `onUpdate` → `invalidate()` (no continuous 60fps loop for idle motion, confirmed present since §1c-8), so no render-loop architecture change was needed there; the fix needed was the material regression below.
- **Critical FPS regression found and fixed.** Final QA measured 11.9 FPS on the Contact page during its idle pin animation (a controlled same-load comparison against `/faq`, zero Three.js, showed a clean 60.4 FPS under identical background CPU contention — proving this was a real Three.js-specific regression, not shared-machine noise). CDP profiling showed negligible script/layout/style cost, pointing to GPU/shader cost. Root cause: `GOLD_PHYSICAL_PROPS` used `THREE.MeshPhysicalMaterial` with `clearcoat`/`clearcoatRoughness` set — an expensive per-pixel PBR shading layer, applied to a mesh that idle-animates continuously. Fixed in two steps: removed `clearcoat`/`clearcoatRoughness` from the shared props, and switched `GoldPin.tsx`'s material from `THREE.MeshPhysicalMaterial` to the cheaper `THREE.MeshStandardMaterial` (which doesn't carry `MeshPhysicalMaterial`'s baseline extra shader cost even with clearcoat zeroed). **Re-measured clean after the fix: Contact 60.6/60.3 FPS across two runs, Service Areas 59.3 FPS** (shares the same `GoldPin` material) — both now in line with the 60.6 FPS `/faq` baseline. Re-screenshotted the Contact pin post-fix to confirm the material-class change didn't degrade its look — it reads the same: bright gold face, dark onyx center, clear highlight.
- DPR remains capped (now `dprRange()`-driven, above); no real-time shadows, no post-processing anywhere (unchanged from §1c-8); max 1 active WebGL canvas confirmed via the responsive re-sweep (below).

### 7. Hero video — technical audit

Inspected via HTML5 `<video>` `loadedmetadata` (Playwright; no `ffprobe` available in this environment, so a temporary local static file server was used to work around a `file://`-URL video-loading limitation). Result: the production hero video's true source is natively **720×1280 (portrait)**, ~1 Mbps bitrate. Rendering it full-bleed across a landscape desktop hero required a 2.0–2.667× upscale via `object-fit: cover`, compounded by the existing GSAP zoom/parallax animation enlarging it further — this, not a CSS bug or a codec problem, is why it looked soft/low quality. All three candidate source files in `src/assets/` (`SnapInsta.to_*.mp4`) share this same native resolution — there is no higher-resolution original anywhere in the project. Additionally, the `SnapInsta.to_*` filename pattern strongly indicates the footage was downloaded from Instagram rather than licensed — a separate, more serious problem independent of resolution.

### 8. Hero video — decision

No AI upscaling was used (per the brief's explicit caution against warped vehicles/fake reflections from upscaling a video this soft). Since no better original exists and the likely-unlicensed source made restoring the video inadvisable regardless of resolution, the video was **removed** and replaced with the already-approved, verified-license `group-coach-bus.jpg` (1536×1024, confirmed via manual JPEG header parse) as the sole hero treatment across all viewports. `cinematic-hero.tsx` was simplified accordingly: removed the `<video>` element, its play/pause `IntersectionObserver` effect, the continuous push-in zoom effect, and all related state/refs/constants (`videoEnabled`, `videoRef`, `HERO_VIDEO_SRC`, `HERO_VIDEO_POSTER`, `GRAIN_DATA_URI`) — confirmed zero leftover references via grep. The original video/poster files remain on disk, unreferenced, per this project's non-destructive-cleanup convention. **This is a content-quality decision, not a business-logic change** — no routing, form, or booking behavior was touched.

**Remaining blocker**: if the client wants video back on the Hero, a genuinely licensed, landscape-native (or at least higher-resolution) source file is required — this project has no such asset today.

### 9. Performance results

- **FPS**: Contact 60.3–60.6, Service Areas 59.3, `/faq` baseline 60.6 (all clean, post-fix, same-load comparison methodology).
- **Bundle**: main always-loaded JS chunk unchanged in shape from §1c-8 (Three.js still never enters the critical path); shared `three`/`@react-three/fiber`/`@react-three/drei` chunk (`GoldPin-*.js`) still ~890.7kB/240.0kB gzip, fetched once, deduplicated across every remaining 3D surface (Contact, Service Areas, loader) — confirmed unchanged in size after the Fleet wheel's removal, since the shared chunk's size is dependency-graph-driven, not scene-count-driven.
- **WebGL canvases**: confirmed max 1 active at any time across the full 98-combination responsive sweep (14 routes × 7 breakpoints); canvases mount only at ≥1024px width for Contact/Service Areas and never for Fleet (now zero Three.js).
- **Loader duration**: ~928ms–1089ms typical (normal connection, all paths); ~5.6s under simulated slow-3G (bundle-fetch-bound, not loader-logic-bound).
- **Hero image**: 96,774 bytes, 1536×1024, immediate `fetchPriority="high"` load — no video decode/network cost on the critical path at all now.
- **Lighthouse**: re-run clean (previous run was contaminated by concurrent background load, same caveat documented in §1c-6/§1c-8). A fresh same-load comparison between `/` and `/faq` (zero Three.js) showed nearly identical Performance scores (31 vs. 35, mobile-simulated) and TBT — confirming, the same way the FPS test did, that the depressed absolute score reflects this shared dev machine's background CPU contention (`Get-Process` reconfirmed `msedgewebview2`/`firefox`/`Antigravity` carrying tens of thousands of cumulative CPU-seconds), not a Three.js-specific or app-specific regression. A desktop-preset run scored somewhat better (Performance 36, FCP 3.3s, LCP 3.6s, CLS 0.001) but is still depressed by the same environment. **Honest assessment**: this local Lighthouse Performance score is not a trustworthy absolute number on this machine right now; CLS (0/0.001), Accessibility (95–96), and SEO (100) remain trustworthy since they aren't CPU-timing-dependent, and the FPS/CDP/network evidence above is the more reliable performance signal for this pass.
- **CSP/console/memory**: full 98-combination sweep (route × breakpoint) re-run after all fixes — 0 console errors, 0 CSP violations, 0 page errors, 1 `<h1>` per page throughout, 0 horizontal overflow, 0 stray `<video>` elements anywhere.

### 10. Remaining blockers

- **Hero video**: no licensed, higher-resolution source exists in this project; recommend the client supply one if video is wanted back on the Hero (see point 8).
- Local Lighthouse Performance *scores* remain environment-unreliable on this shared machine (see point 9) — recommend re-running on a dedicated CI runner or unshared hardware before treating any absolute Lighthouse Performance number as ground truth.
- Everything else requested in this correction pass (loader hang, Contact map/pin/logo, Three.js performance policy, Fleet wheel removal, Hero video quality/licensing) is resolved and verified above. Not deployed, per the brief.

---

## 1c-10. Sourced video accents — Hero letterform, Book Now, 24/7 section (2026-08-02)

Client asked for 5 distinct, original video placements (Hero title, Book Now button, 24/7 section, Contact location, Fleet section), sourced only from videos already in the project, never repeating a clip, images as fallback where no distinct clip exists. No new external footage was introduced.

### Asset audit

Only **3 unique video files** exist anywhere in the project (`src/assets/SnapInsta.to_*.mp4`; `public/assets/videos/hero-night-drive.mp4` is a byte-identical duplicate of one of them, confirmed by matching size and `loadedmetadata` duration). All three are 720×1280 portrait. Frame-by-frame inspection (browser `<video>` `loadedmetadata`/`seeked` events via a temporary local static server, since this environment has no `ffprobe`) found:

- **Clip A** (12.6s): a black Cadillac Escalade — parked wheel/side detail, then a highway approach shot, a chauffeur's hand on the wheel, a wheel-spin close-up, and a side glide-by. Ends with an **"LCT Universal Executive Transports"** branded card showing the client's real phone number — this is the client's own footage.
- **Clip B** (28.4s): a fleet lineup (SUVs + a Mercedes S-Class) outside a building, then a macro close-up of the Mercedes hood ornament/grille. Also ends with the same **LCT Universal** branded card.
- **Clip C** (11.6s, = `hero-night-drive.mp4`): a night interior shot driving through a downtown skyline. Ends with a **different company's** branded card, "LuxLane Transports." Flagged to the client; `image-map.ts` already documents "Luxlane" plates/stickers appearing in other client-approved official photos in this project, indicating an existing brand association rather than unrelated third-party content — client reviewed and approved using this clip, trimmed to end before its branded card.

With 3 legitimate clips for 5 requested placements, the client chose: Clip A → Hero, Clip B → Book Now, Clip C → 24/7 section (its night-driving theme is the best fit for "always available"), and Contact/Fleet use existing premium photography rather than repeating a clip — matching the brief's own stated fallback rule.

### Trimming and optimization

No `ffmpeg`/`ffprobe` exists in this environment; `ffmpeg-static` was installed into an isolated scratch npm project (not added to this project's `package.json`/lockfile) purely as a one-time asset-processing tool. Clean, watermark-free 3–6s windows were located by dense per-second frame sampling, then cut and compressed:

| Placement | Source | Trim | Output | Size |
|---|---|---|---|---|
| Hero (in the "O") | Clip A | 1.0s–6.0s | `hero-driving.mp4` | 474KB |
| Book Now button | Clip B | 19.5s–23.5s | `booknow-detail.mp4` | 458KB |
| 24/7 section | Clip C | 0.0s–4.3s (before the LuxLane card, which starts ~4.8s in) | `service-nightdrive.mp4` | 194KB |

All three: scaled to 480px width, H.264 `main` profile, CRF 26, audio stripped (`-an`, since every placement is muted anyway), `+faststart` for immediate playback start. Output copied to `src/assets/video/`.

### Implementation

- `src/components/media/loop-video.tsx` (new) — shared `<LoopVideo>`: muted/loop/playsInline, `eager` prop (Hero only, per the brief's explicit "lazy-load every video except the Hero media"), otherwise `IntersectionObserver`-gated mount with `preload="none"` until near-viewport. Renders `null` entirely under `prefers-reduced-motion` — no element, no network request, since every placement is pure decoration over real text/CTA content. Pauses on `visibilitychange` (tab hidden).
- **Hero title** (`cinematic-hero.tsx`): the literal "O" character in "One Fleet," is replaced with a small circular masked video slot (sized in `em` so it scales with the heading's fluid `clamp()` type), gold-ring border, gold radial-gradient fallback fill visible whenever the video isn't rendered (reduced motion) so it never reads as an empty hole — it reads as a deliberate gold orb standing in for the letter. Screen-reader text is preserved via a `sr-only "O"` so the heading still reads "One Fleet, Every Occasion." to assistive tech and search engines.
- **Book Now** (`cinematic-hero.tsx`): a small circular video badge placed beside — not inside — the primary "Book Your Ride" CTA. Deliberately not applied as the button's own background: the button's solid gold fill and text needed to stay untouched for legibility/conversion (this project's own established priority order ranks Conversion above visual enhancement). Hidden below `sm` to keep the mobile CTA row uncluttered.
- **24/7 section** (`src/components/home/service-availability.tsx`, new, mounted in `index.tsx` between `ValueEditorial` and `HorizontalJourney`): a slim trust band — circular night-drive video (with a static `chauffeurInterior` image underneath as the reduced-motion fallback, so the frame is never empty) beside a headline and three short, always-present text points ("Always on call," "Airport-ready," "Same-night availability"). The video is the visual cue; the actual "24/7" claim lives in real text, matching this project's consistent pattern of never putting essential information only in decorative media.
- **Contact page location element**: unchanged — the existing 3D pin + `ContactMapBackdrop` (§1c-9) already fills this role; no distinct 4th video clip existed to add here without repeating one already used elsewhere.
- **Fleet section**: unchanged — `HorizontalJourney` and `/fleet` already assign a distinct, correctly-matched image per vehicle (`fleetSedan`, `fleetSuv`, `fleetSprinter`, `fleetCoachJourney`/`fleetCoach`), which already satisfies "unique, vehicle-specific" per the brief's own image-fallback rule.

### Validation

- `npx tsc --noEmit` and `npm run build` — clean; all three clips emitted as ordinary static assets (`dist/assets/hero-driving-*.mp4` etc.), no CSP change needed (`media-src 'self'` in `public/.htaccess` already covers same-origin media).
- Playwright sweep, 7 breakpoints (1920×1080 → 375×812), homepage: 0 horizontal overflow, 0 console errors, 0 CSP violations at every size. Video count is 2 on desktop/tablet (Hero + whichever of Book Now/24-7 has scrolled near-view) down to 1 on the smallest phones (Book Now badge is hidden below `sm`) — confirms lazy-mounting is working, not just present-but-hidden.
- Reduced-motion re-check: 0 `<video>` elements render anywhere; Hero's "O" shows its gold-gradient fallback (not an empty circle), Book Now's badge simply doesn't appear (no orphaned empty ring), 24/7 section shows the static `chauffeurInterior` photo.

---

## 1c-11. "localhost:3000" production-redirect report — investigation and Netlify config gap (2026-08-02)

Client reported the deployed Netlify site redirecting/linking to `http://localhost:3000` and asked for an exhaustive repo search (localhost, `127.0.0.1`, hard-coded dev URLs, `VITE_SITE_URL`/`SITE_URL`/`BASE_URL`, redirect/canonical/callback URLs, `window.location` assignments, anchor hrefs) plus verification of the Netlify SPA redirect rule.

### Finding: no such reference exists in this codebase

Every category was searched across `src/`, `.env`, `vite.config.ts`, `index.html`, `public/robots.txt`, `public/sitemap.xml`, `supabase/config.toml`, `router.tsx`, `main.tsx`, `site-data.ts`, `seo.ts`, `tracking.ts`, `analytics.tsx`, and `mylimobiz-widget.tsx`. Result:

- **Zero** literal `"localhost"` strings anywhere in `src/`.
- `CONTACT.siteUrl` (the single source for every canonical/og:url/JSON-LD URL, via `pageMeta()` in `seo.ts`) is already `"https://lctuniversal.com"` — correct.
- No code anywhere reads `VITE_SITE_URL`, `SITE_URL`, or `BASE_URL` — these env vars aren't used by this project at all.
- Every internal link sitewide is a relative TanStack Router `<Link to="/...">` (verified: 32–38 anchors per route across all 14 routes, checking the literal `href` attribute in the rendered DOM, not the browser-resolved absolute URL) — none hard-code an origin, so each resolves against whatever domain actually serves the page.
- `robots.txt`/`sitemap.xml` both correctly reference `https://lctuniversal.com`.
- `BOOKING.url`/`widgetScriptSrc` (MyLimoBiz) and `supabase/config.toml` are clean; the latter has no `[auth]`/`site_url` section at all (this project doesn't use Supabase Auth, only anonymous inserts via the publishable key), so the common "Supabase CLI scaffold defaults `site_url` to `localhost:3000`" failure mode doesn't apply here.
- The **only** two `"localhost"` occurrences anywhere in the production bundle are inert third-party library internals, confirmed by reading the surrounding minified code directly: Supabase `auth-js`'s unused default `GOTRUE_URL` fallback constant (`"http://localhost:9999"`, never reached since this app always passes an explicit `SUPABASE_URL`) and its hostname-classification helper that special-cases `localhost`/`127.0.0.1`/`[::1]` for cookie-domain scoping; and TanStack Router's defensive fallback for `window.origin === "null"` (a sandboxed-iframe edge case). Neither executes a redirect or navigation, and neither is reachable in a normal browser tab on a real domain.
- Verified empirically, not just by reading source: served the production build with a Netlify-equivalent SPA-fallback rule and swept all 14 routes via Playwright — 0 requests to port 3000 anywhere, 0 literal `localhost`/`127.0.0.1` hrefs in any rendered page, 0 console errors. Also drove real flows: header nav click → `/fleet`, "Book Now" click → `/book`, MyLimoBiz widget script/iframe mounts correctly, Contact form renders its 9 fields with a JS-driven (not `action=`) submit.

**Conclusion**: there is no hard-coded `localhost:3000` reference — or any redirect mechanism that could produce one — anywhere in this project's source or build output.

### Real gap found and fixed: no Netlify SPA/security config existed at all

`public/.htaccess` (Apache) is explicitly Hostinger-only — Netlify never reads it. Before this pass, **no `netlify.toml`, `_redirects`, or `_headers` existed anywhere in the project**, meaning on Netlify: (a) a direct load or refresh of any route other than `/` (e.g. `/fleet`, `/book`) would hit Netlify's default 404 instead of the SPA's `index.html` — this is likely what the client actually observed and reasonably described as "redirecting" — and (b) none of this project's CSP/security headers were active on the Netlify deployment at all.

Fixed with two layers, since the client's chosen deploy method (manually uploading the `dist/` folder to Netlify, not a Git-connected or CLI deploy from the project root) only honors config files that ship *inside* the published folder:

- **`netlify.toml`** (project root) — `[build]` command/publish dir, `[[redirects]] /* -> /index.html 200`, and the full header set, for if/when this project moves to a Git-connected or CLI-based deploy.
- **`public/_redirects`** and **`public/_headers`** (Netlify's plain-file format) — copied into `dist/` automatically by Vite (everything in `public/` ships as-is), so they take effect on a plain drag-and-drop deploy too. Both mirror `public/.htaccess`'s policy exactly: `/* /index.html 200`, and the identical CSP/HSTS/`X-Frame-Options`/etc. header set, plus the same asset-immutable / `index.html`-revalidate caching split.

### Validation

- `npx tsc --noEmit`, `npm run build` — clean; confirmed `dist/_redirects` and `dist/_headers` are both present in the build output.
- Rebuilt-and-reserved the production `dist/` output behind a plain Node static server configured to apply the exact same `/* -> /index.html 200` fallback Netlify's `_redirects` will apply, then re-ran the full 14-route Playwright sweep against it: every route 200s on a direct/fresh load (simulating "refresh on every route"), 0 console errors, 0 CSP violations, 0 requests to port 3000, 0 literal localhost hrefs.
- Confirmed via `curl` that direct loads of `/`, `/fleet`, and `/contact` all return 200 under the SPA-fallback rule (would 404 without it).

### Deployment status

This project has no `.git` (not a git repository) and no `.netlify` site link, so there is no existing path from this environment to the live Netlify site. Presented three options to the client (install Netlify CLI + interactive login, set up git + Netlify's Git integration, or the client deploys `dist/` themselves); **client chose to deploy the rebuilt `dist/` folder themselves.** The build is current and ready in `dist/` as of this pass — **not deployed by this session**; the client will upload it.

### Remaining note

Because this correction pass changes only `netlify.toml` / `public/_redirects` / `public/_headers` (new files) and does not touch any route, form, tracking, or business-logic code, no other section of the site was affected — confirmed by the identical 0-console-error / 0-CSP-violation result across every route before and after.

---

## 1c-12. Visual & UX refinement pass — media, overlays, transitions, CTAs (2026-08-06)

A polish pass, not a redesign: the architecture, animations, integrations, SEO, security headers, Three.js layer, GSAP timelines, MyLimoBiz booking, and responsive layouts were all explicitly out of scope. This covered visual storytelling, media quality, readability, and section-to-section flow. Not deployed.

### 1. Media re-audit — scoped by what actually exists

The brief said new professional photography would be added to the assets folder for this pass. It hadn't been — `public/assets/official/` still held the same 10 photos from 2026-07-30/31, and the `.asset.json` files under `src/assets/lct*/` are empty Lovable-import reference stubs, not real images. This was confirmed by directory listing before any reassignment work started, and is documented prominently in `MEDIA_REGISTRY.md` so it isn't missed later. The re-audit proceeded anyway, using the existing 10-photo library — every current `image-map.ts` assignment was reviewed against its adjacent copy, one clear mismatch was fixed (below), and every unresolvable gap (chiefly: no Sprinter photo exists at all) is now explicitly documented in `MEDIA_REGISTRY.md` §"Known gaps" rather than papered over with a misleading crop.

**Fixed**: `PinnedStories`' "Corporate Transportation" story used `cockpit` — a highway dashboard/GPS photo that doesn't depict anything corporate. Replaced with a new `corporateStory` key (a wider, building-forward crop of the same `chauffeur-sclass-portrait.jpg` used three other places, distinct from all of them) so the image now actually supports the copy next to it.

**Not fixed (genuine content gaps, not oversights)**: `fleetSprinter` still uses the stadium/event stand-in (no photo of an actual Sprinter van exists anywhere in the project); `/services`' Family Transportation chapter still uses the standard Escalade shot (no child-seat/family-specific photo exists); Airport-related placements still use highway signage rather than a literal pickup/meet-and-greet shot. All three are ranked and described in `MEDIA_REGISTRY.md`.

### 2. Image repetition

No new repetition was introduced. The already-established pattern from the 2026-08-02 pass (same source photo, always a genuinely distinct crop/composition/role when reuse is unavoidable) was extended for the two new placements added this pass (`chauffeurAvailability`, `corporateStory`) — both documented in `image-map.ts` with an explicit note on how their crop differs from every other use of the same source photo.

### 3. Second video removed

The prior pass had landed 3 video placements (Hero "O", a Book Now button badge, a homepage "Always Available" band). Per "keep only one premium media experience," two were removed:
- **Book Now button badge** — removed outright, no replacement image. It was a small decorative accent next to the CTA, not content with a gap to fill; removing it also reduces visual clutter right next to the site's most important button.
- **"Always Available" band** — now uses the new `chauffeurAvailability` still image (a tighter, centered crop of the same chauffeur-at-the-wheel photo used elsewhere on the page, with a distinct crop so it doesn't repeat identically).

Both now-unused video files (`booknow-detail.mp4`, `service-nightdrive.mp4`) were deleted from `src/assets/video/`; only `hero-driving.mp4` remains, confirmed via grep that nothing still references the deleted files before removing them.

### 4–5. Text readability and dark overlays

The dominant problem, found via full sitewide inventory (every `IMAGES.*` call site, its nearby heading/copy, and its overlay classes) rather than spot-checking: a small number of overlay patterns were reused everywhere and were tuned far darker than necessary, in some cases making the photography almost invisible.

- **`PageHero`** (`site-layout.tsx`, shared by 9 of the 14 routes) was the single highest-leverage fix: every interior-page hero photo rendered at **`opacity-30`** under a **`bg-gradient-to-b from-background/70 via-background/85 to-background`** — a near-solid panel that made the photography barely perceptible. Replaced with `opacity-70` plus a **localized radial "spotlight"** centered on the text column (dark enough for legibility there) that fades out toward the edges (where the photo's actual subject usually sits), plus a much lighter top/bottom fade to blend into the nav and next section instead of a flat panel. Added a soft `text-shadow` on the title/eyebrow/description (inert on the image-less PageHero pages) as a second, more surgical legibility guarantee — this meant the spotlight itself didn't need to be pushed to an aggressive darkness just to cover the single busiest photo in the library (airport highway signage, all-signage with no clean negative space anywhere in frame).
- **`HorizontalJourney`** (homepage fleet slides, both desktop and mobile): image was at `opacity-55`/`opacity-50` **and** covered by two stacked black gradients (horizontal + vertical). Now full-opacity image with one lighter, more localized gradient (dark only where the copy column sits).
- **`PinnedStories`** mobile stacked fallback: same pattern (`opacity-45` + `from-black via-black/60 to-black/30`), same fix.
- **`FinalCta`**: `from-black via-black/70 to-black/40` (never below 40% darkening anywhere in the image) → `from-black/90 via-black/35 to-transparent`.
- **`/fleet` Sedan and Coach banners, `/events` filmstrip cards**: 85–90% black at one edge, softened to 70–75% — these are seam-blend gradients into an adjacent copy panel (not text-over-image), so the fix here was about smoother, less abrupt transitions rather than legibility.
- **Real bug found and fixed**: `BookingExperience`'s media panel had a horizontal-only darkening gradient, but its "Request your private quote" text is bottom-anchored — meaning the text had no guaranteed contrast against whatever the image showed directly behind it (a genuine readability risk, not just a style preference). Added a second, localized bottom-fade gradient specifically to protect that text block.
- Reviewed but left unchanged: `ValueEditorial`'s and `ChauffeurSection`'s bottom-edge fades (`from-black/50-55 via-transparent to-transparent`) were already light, localized, and not covering text — an example of the pattern already being done right elsewhere, confirming this wasn't a blanket "darken everything less" pass but a targeted fix of the specific offenders.

### 6. Section-to-section transitions

Audited the DOM-order background-color sequence of every page. The homepage alternated `surface-black` → `onyx` five times top-to-bottom (a visible "striping" effect scrolling past sections that are otherwise visually similar); consolidated to two intentional bands by matching `ServiceAvailability`'s background to its immediate neighbors instead of standing out on its own. `/fleet` had three consecutive `onyx`/`surface-black` flips across its four vehicle chapters — the Sprinter chapter's `onyx` was the sole outlier versus its Sedan/SUV/Coach siblings (all `surface-black`); removed it to match. `/service-areas`'s closing section was the one page whose closing band didn't use `bg-onyx` like every sibling interior page's closing section — added for consistency. No new cross-fade/wipe animation machinery was built for this; the existing homepage handoff-wipe mechanism (`.hero-handoff`, `.journey-handoff`, `.vehicle-handoff`, from the earlier cinematic-motion pass) was left as-is and is unaffected.

### 7. Visual storytelling

Reviewed every section with a heading+copy+CTA structure but no image (FAQ, legal pages, LeadForm sections, the "Coming Soon" reviews card, etc.) — all of these are content types that don't call for photography (forms, accordions, legal prose), not instances of the "image + random paragraph" anti-pattern the brief warned against. No changes made here; flagging that this was checked, not skipped.

### 8. CTA hierarchy

Reviewed every section flagged as having multiple CTAs in close proximity. Findings: the Hero's phone/quote utility row and primary Book/Explore buttons are already visually tiered (button-styled primary actions vs. smaller text-link secondary ones) — no change needed beyond removing the video badge (which itself reduced clutter next to the primary CTA). The persistent mobile chrome (WhatsApp FAB, phone FAB, full-width Book Now bar) was reviewed and found to already be deliberately tiered by design (see the existing code comment in `mobile-book-bar.tsx`) — a bold full-width primary action plus two small secondary utility icons, non-overlapping by explicit bottom-offset math. No forced consolidation applied; this was already correct.

### 9. Mobile composition — real bug found and fixed

Found via bounding-box measurement (not just visual inspection): on mobile, the Hero's "Request a Quote" link was physically covered by the fixed phone FAB — confirmed 38px of horizontal overlap at 390×844. Root cause: the hero's bottom utility row had no right-side clearance reserved for the fixed FAB column. Fixed with a `pr-20 lg:pr-0` reserve on that row; re-measured after the fix — 0px overlap, text now wraps cleanly onto two lines instead of running underneath the FAB.

A full independent mobile-crop rebuild across all ~20 `image-map.ts` entries was not undertaken this pass (out of proportion to the effort budget given every crop already carries an explicit, separately-tuned `objectPositionMobile` value from prior passes) — instead, mobile renders were spot-verified via screenshots (homepage hero, scrolled homepage, `/corporate`) and the one real defect found (the FAB overlap above) was fixed.

### 10. App preparation

`MEDIA_REGISTRY.md` gained a "Mobile app readiness" section: every image already carries independent desktop/mobile crop intent and a declared aspect ratio in one central file (the natural manifest for picking marketing/app-store screenshot sources later), source photos are full-resolution originals, and the one remaining video is flagged as web-optimized-only (not suitable for app-marketing reuse without re-exporting from a higher-resolution source).

### 11. Final QA

- `npx tsc --noEmit` — clean.
- `npm run build` — clean.
- Full Playwright sweep (14 routes) — see results below.
- MyLimoBiz — not touched by this pass; script tag, widget slot, and `/book` flow re-verified functioning identically before/after.
- SEO — not touched; `pageMeta()`/canonical/OG generation untouched.
- Three.js — not touched; Contact pin, Service Areas scene, and their capability-gating are unaffected by this pass's CSS/media changes.
- Performance — no new render loops, no new heavy assets (one video file removed net of what was added last pass; two video files deleted this pass).

---

## 1c-13. Final Art Direction pass — new media library, radius-token bug, verification (2026-08-07)

The client added a large batch of new professional photos and videos to `/public/assets` mid-request, superseding the "no new images" constraint from §1c-12. This pass re-audited the entire assets folder from scratch and rebuilt the media registry, plus completed the remaining art-direction review (composition, CTA focus, micro-details) requested for final pre-launch polish. No integrations, routing, booking flow, SEO, security, GSAP architecture, or Three.js architecture were touched — confirmed by the same before/after QA sweep used in every prior pass.

### 1. Complete media re-audit

31 new raw files were added directly to `/public/assets` (not `/official/`): a mix of iPhone HEIC photos, JPEG/PNG screenshots, and 16 MOV/MP4 video clips. Every one was inspected manually before any assignment:

- **HEIC files** (5) aren't viewable by any tool in this environment or by any non-Safari browser — converted to JPEG via `heic-convert` (a `libheif`-based decoder) before inspection or use.
- **Videos** (16) were frame-sampled via `ffmpeg` (a one-time scratch install, not added to the project's own dependencies) at 1 frame/2s for the higher-resolution ones and spot-checked for the rest, rather than guessed from filenames or file size alone.
- Full inventory, including everything inspected but *not* selected (and why), is in `MEDIA_REGISTRY.md` §1.

**The headline result**: this batch included the first-ever real photos of the actual Mercedes-Benz Sprinter (exterior + interior) — resolving the #1 gap flagged in §1c-12, where `fleetSprinter` had been pointing at unrelated stadium photography with no van visible at all. It also included sharper, higher-resolution replacements for the Sedan, SUV, Coach, chauffeur-portrait, chauffeur-door-service, and Events photos already in use, plus two genuinely-recognizable DFW Airport monument-sign photos (replacing generic highway signage) and an authentic in-cabin passenger POV shot now used to give `/book` its first-ever image (previously the page had none).

12 new images were processed (resized from originals as large as 8MB/6000×4000 down to 1600–2000px long edge, re-compressed to 50KB–780KB) into `public/assets/official/`, and `image-map.ts` was rebuilt: every changed/added key, its new source, and the reasoning is in `MEDIA_REGISTRY.md` §2. Two new keys were added (`sprinterInterior`, `bookExperience`); both fill an existing conditional image slot (the `/fleet` Sprinter chapter's single image, and a new small circular accent on `/book` reusing the exact pattern already established by the homepage's "Always Available" badge) rather than introducing new layout.

Old, now-unreferenced official photos (`hero-sclass-chauffeur.jpg`, `fleet-escalade.jpg`, `events-fleet-stadium.jpg`, `chauffeur-door-service.jpg`, `chauffeur-sclass-portrait.jpg`) were left on disk, per this project's established non-destructive convention — not deleted, just superseded.

### 2. Hero video upgraded

Per "Hero O video remains — if there are better clips in /assets, choose the strongest ones": the placement is unchanged (Hero, inside the "O" of "One Fleet"), but the clip itself was replaced. The previous trim was a generic highway-driving montage; the new one (`IMG_8718.MP4`, trimmed 1.0s–5.5s) is a chauffeur in white gloves opening the rear door of an S-Class against a sharp downtown Dallas high-rise backdrop — a more specific, more premium, better-branded moment. Same encode conventions as before (400px wide, H.264, no audio, `+faststart`), 398KB (smaller than the 474KB it replaced despite the richer scene, due to slightly tighter compression).

No other video placements were added. Per "use videos only where they actually improve the experience — do not use video just because it exists," the strongest additional candidates found (genuine airport-tarmac/private-jet footage, several downtown in-cabin driving POVs) are documented in `MEDIA_REGISTRY.md` as available for a future pass rather than wired in now — the tarmac footage in particular is uniquely valuable content but shot at only 464×832/848×480, below this project's bar for a premium placement.

### 3. Real bug found and fixed: the `--radius-sm` design token was broken sitewide

While auditing "radius consistency" (per the Micro Details checklist), found that `--radius-sm: calc(var(--radius) - 4px)` — with this project's deliberately tiny `--radius: 0.2rem` (3.2px) base — evaluates to `-0.8px`, an invalid negative `calc()`. Confirmed via a real browser (`getComputedStyle`): the custom property resolved to an **empty string**, and every element using Tailwind's `rounded-sm` utility (57 occurrences sitewide — the single most common radius class in the codebase, covering most buttons and cards) was silently rendering with a hard **0px square corner** instead of the intended soft micro-rounding. `--radius-md` happened to still compute positive (1.2px) and was unaffected.

This was never visually obvious as "wrong" on its own (a sharp corner reads as a deliberate minimal aesthetic) — it only became apparent as an inconsistency once looked at as a system: `rounded-md`/`rounded-lg`/`rounded-xl` elements right next to `rounded-sm` ones were subtly rounded while the `rounded-sm` ones were dead square, with no design intent behind the difference.

**Fixed** by switching the scale from subtractive to proportional (`--radius-sm: calc(var(--radius) * 0.5)`, `-md: * 0.75`, `-lg: var(--radius)` unchanged, `-xl: * 1.5`, `-2xl: * 2`) — every step now stays positive and visibly distinct while remaining within the same sharp, architectural aesthetic (nothing exceeds ~6.4px). Verified: `rounded-sm` on the primary "Book Your Ride"/"Book Now" buttons now computes `1.6px` instead of `0px` — confirmed via both computed-style inspection and screenshot (soft pill/rounded corners now visible where they were square before).

### 4. Art direction review

Walked the homepage and a representative sample of interior pages against the "would this look intentional in a luxury transportation magazine" standard:

- **Image/copy relationship**: with the new media in place, several sections now pass this test noticeably better than before without any layout change — e.g. the `/airport` hero's giant "DFW" monument-sign photo makes the section's subject legible before reading a single word; the `/fleet` Sprinter chapter's new interior photo visually explains "Conference seating / USB & power outlets / High headroom" directly.
- **CTA focus**: re-confirmed the findings from §1c-12's review still hold — the Hero's primary/secondary CTA tiering and the persistent mobile chrome (WhatsApp/phone FABs vs. the full-width Book Now bar) are both already deliberately tiered, not cluttered. No forced consolidation applied here, consistent with "no unnecessary changes."
- **Scroll continuity**: the background-striping and overlay-darkness fixes from §1c-12 remain in place and unaffected by this pass's media swap (same components, only their image `src`/crop values changed).
- **Typography**: reviewed for excess copy; no section was found carrying paragraph-length text that doesn't support conversion (the existing "one headline / one supporting line / one CTA" discipline established in earlier passes already holds sitewide) — no cuts made, since cutting working, already-tight copy to manufacture a change would violate "no unnecessary changes."

### 5. Validation

- `npx tsc --noEmit` — clean.
- `npm run build` — clean.
- Full Playwright sweep, 98 combinations (14 routes × 7 breakpoints: 1920×1080 → 375×812) — 0 problems (0 overflow, 0 console errors, 0 page errors, 0 CSP violations, 1 `<h1>` per page throughout, 0 broken/failed-to-decode `<img>` elements across every rendered image on the site).
- Video count: exactly 1 (the upgraded Hero clip) on every homepage breakpoint, 0 on every other route — confirms no new video placements were accidentally introduced.
- MyLimoBiz — not touched; re-verified functioning on `/book`.
- SEO — not touched.
- Three.js — not touched; Contact pin and Service Areas scene unaffected (this pass never touches `src/lib/three/**`).
- Radius fix verified both via computed-style inspection (`rounded-sm` → `1.6px`, was `0px`) and visual screenshot comparison.

### 6. Remaining media gaps

Unchanged from what genuinely can't be resolved without more photography — see `MEDIA_REGISTRY.md` §4 for the full list. The Sprinter gap (the most severe one) is now closed. The next-highest-value addition would be a higher-resolution re-shoot of the airport-tarmac/private-jet footage already supplied at low resolution.

---

## 1c-21. Trust strip redesign — static centered composition (2026-08-08)

Follow-up correction to §1c-20: the marquee read as "cheap and sparse" and NLA was barely readable. Removed the marquee entirely (`.trust-marquee-track`/`@keyframes trustMarquee` deleted from `styles.css`, no duplicated-track DOM). `trust-strip.tsx` rewritten as a permanently centered, static composition inside a `max-w-[900px]` column: BBB · GNET · NLA in one row with thin muted-gold separators on desktop/tablet, BBB-row-then-GNET+NLA-row on mobile. Sizes tuned to hit the requested visual targets (BBB ~178px wide, GNET/NLA ~118px wide) — this required deliberately *taller* height boxes than intuition suggested, since GNET/NLA are near-square and the max-width cap only becomes the binding constraint (vs. the height) once the height is generous enough; verified by measuring actual rendered widths, not assumed from the Tailwind classes. Section padding trimmed (`py-5 md:py-6`) to bring total height from an initial 231px down to a verified 215px, inside the requested 170–220px band. The only remaining motion is a slow (~7.5s), few-pixel vertical float per badge with staggered per-badge delays (`.trust-mark`/`@keyframes trustFloat`) — disabled under `prefers-reduced-motion: reduce` (verified via Playwright's `reducedMotion: "reduce"` context: computed `animation-name` and `transform` both resolve to `none`) and, critically, only applied on the homepage — `BadgeMark`'s `floatDelay` prop is `undefined` for the About/footer static usages, so they don't inherit motion meant for a different context.

NLA contrast fix went through three iterations, each checked against a real rendered screenshot before moving on, not assumed correct from code: (1) a large (`inset-[-22%]`), high-opacity (`0.94`), `blur-lg` backing plate — too strong, read as a bright spotlight; (2) a wide (`inset-[-55%]`) radial-gradient falloff — softer edges, but the gradient's own partial opacity at the *center* weakened contrast exactly where the thin dark linework needs it most; (3) final: a plate sized close to the badge's own bounds (`inset-[-6%]`, which matters here since the real NLA artwork is already a tight circular design, not a small mark floating in a lot of empty canvas), high opacity (`0.90`), and only a short `blur-[6px]` to feather the very edge — crisp text, reads as an authentic circular medallion rather than a glow effect, extracted into the shared `BadgeMark` component (`trust-badges.tsx`) so About/footer get the identical, already-verified fix rather than a second copy.

Verified: 0px overflow at all 7 required breakpoints; section height 215px desktop / 259px mobile (2-row layout); widths measured directly from rendered `getBoundingClientRect()` at each breakpoint, not computed from source; `npx tsc --noEmit` and `npm run build` clean; full 187-combination sweep re-run clean.

Files changed: `src/components/home/trust-strip.tsx` (rewritten), `src/components/trust-badges.tsx` (`BadgeMark` extracted, NLA fix), `src/styles.css` (marquee keyframes removed, float keyframes added).

---

## 1c-22. Trust strip redesign — one-shot reveal, edgeless NLA fix, flanking hairlines (2026-08-08)

Third and fourth correction round on §1c-21: client called the continuous idle float "an afterthought" and the NLA backing "washed out / glowing." Two changes, each verified against real rendered screenshots before moving on:

**Motion.** Removed `.trust-mark`/`@keyframes trustFloat` entirely (no continuous idle motion anywhere in the section now). `trust-strip.tsx` uses the same one-shot `revealStagger` GSAP ScrollTrigger entrance every other homepage section already uses — every animated node tagged `.trust-item` (eyebrow+hairlines row, each separator, each badge). `revealStagger` (`src/lib/reveal.ts`) gained an optional `distance` param (default `44`, unchanged for all other call sites) so this section could use an 10px lift instead of the default 44px — matches the client's "8–12px" ask without touching the shared default. Tuned to `duration: 0.6, amount: 0.07` to land the whole sequence at ~500–800ms total. Confirmed via Playwright: opacity resolves to `1` post-scroll, and to `1` immediately (no scroll needed) under `reducedMotion: "reduce"`, since `revealStagger` no-ops entirely under reduced motion (`prefersReducedMotion()` early-return) — the element simply keeps its default visible CSS state.

**NLA fix — final.** Four prior attempts at a per-logo backing shape (opaque cream plate, wide cream gradient, tight opaque circle, warm-stone blurred oval, then a soft radial-gradient falloff) all still read as a visible glow/halo behind that one logo once seen at real size against black — each rejected. Per the client's explicit final instruction, removed the per-logo backing entirely; `BadgeMark` no longer special-cases NLA at all. Direct on-black pixel inspection of the existing transparent derivative (`badge-nla-transparent.png`, background canvas already removed in §1c-20, artwork itself never redrawn) confirmed the ring and "PROUD MEMBER" text read clearly on their own; the chrome "NLA" wordmark is real supplied artwork, kept as-is. Screenshotted close-up at real render size (128px) to confirm: no white halo, no glow blob, legible.

**Other changes this round:** added thin flanking gold hairlines either side of "TRUSTED AFFILIATIONS" (new wrapping row, `.trust-item`, two `h-px` spans). Hover changed from `scale-[1.03]` to the client's requested `scale-[1.02]` + `brightness-110` + a very low-opacity gold `drop-shadow` (ambient highlight, not a permanent glow — only active on `:hover`). Evaluated the optional "Recognized affiliations..." micro-copy line; kept it out — the section already reads clean at the verified 214px height and the client's own instruction was to add it only if it improves the composition.

Desktop logo row measures ~61% of the 1440px viewport / ~92% of the section's 960px inner container — above the client's suggested "45–55% of content width" guideline. Deliberate: hitting 50% at these logo counts/gaps would require shrinking the badges below the explicitly-requested per-logo pixel targets from the prior round (BBB 160–190px, GNET/NLA 110–135px) confirmed in this same session as the "significantly clearer and larger" fix for the original "too small" complaint — prioritized the explicit pixel targets over the rougher percentage guideline. Flagged here rather than silently resolved.

Verified via real-scroll Playwright, not assumed: section height 214px at 1920×1080/1440×900/1024×768/768×1024 (all within the 180–220px target), 286px at 430×932/390×844/375×812 (2-row mobile stack, BBB row 1 / GNET+NLA row 2, thin separator between GNET/NLA only); 0px horizontal overflow at all 7 breakpoints; 0 console/page errors; rendered widths BBB 190px / GNET 132px / NLA 128px (desktop); `npx tsc --noEmit` and `npm run build` both clean.

Files changed: `src/components/home/trust-strip.tsx`, `src/components/trust-badges.tsx`, `src/lib/reveal.ts` (`distance` param added to `revealStagger`).

---

## 1c-23. Trust strip — full art-direction reversal to a light "credentials band" (2026-08-08)

Every prior round (§1c-20 through §1c-22) kept this section as a dark, on-black composition and iterated size/motion/NLA-contrast within that constraint. This round rejects the dark treatment entirely: the client wants a premium warm-ivory institutional credentials band — a deliberate editorial contrast against the black Hero, matching how luxury hospitality/aviation/financial brands present accreditation marks, not a continuation of the site's dark styling.

`trust-strip.tsx` rewritten from scratch (bespoke markup, no longer built on the shared `BadgeMark`, which stays exactly as-is for the About page and footer — both remain dark-context and correctly keep the transparent NLA derivative). New structure: warm-ivory section background (`#F6F3EA`, chosen between the client's two suggested hex values), dark-charcoal "TRUST & ACCREDITATIONS" eyebrow with a centered gold accent line, three editorial credential columns (logo + bold label + descriptor, e.g. "BBB · Accredited Business") separated by short 1px muted-gold dividers sized to the logo area rather than full-column-height table rules. No cards, no boxes, no shadows, no glow anywhere. A solid 1px gold hairline sits at the section's own top and bottom edges — the seam against the black Hero above and the next dark section below — rather than the fade-to-transparent gradient hairline used in the dark-background versions (a solid line reads correctly against two *different*-colored neighbors; a fade-to-transparent one, tuned for black-on-black, would not).

**NLA — reversed the whole approach.** Every earlier round (§1c-20 through §1c-22) worked to strip NLA's white canvas or defeat it with a backing treatment, because the section itself was dark. On an ivory section that constraint disappears: this round uses `badge-nla.png`, the ORIGINAL opaque file (never the `-transparent` derivative), on the explicit client instruction that this logo should keep its real, designed-for-white appearance. Its native canvas (verified by raw pixel sample: `255,255,255`, pure white) sits close enough to the section's warm-ivory background that a hard edge would still be faintly visible at real contrast, so per the client's specific fallback instruction it's given a minimal white "credential plate" (`rounded-md bg-white`, small internal padding, no border, no shadow) — confirmed via a close-up screenshot to read as an intentional institutional plate, not a card or halo.

Sizing tuned by real measurement, not assumption: initial pass came in at 256px section height (over the 180–230px target) with GNET/NLA visibly smaller than BBB; reduced section padding (`py-9/py-11` → `py-7/py-8`) and internal gaps, and raised NLA to match GNET's height for equal perceived weight. Final measured: BBB 163×64px, GNET 78×72px, NLA 72×72px — GNET and NLA's rendered widths (78px, 72px) fall under the client's 100–130px *starting* target because both badges' real artwork is naturally near-square/compact; matching them to BBB's width would have required a much taller box than the 55–75px target allows. Held height parity (all three ~64–72px) over forcing the width target, per the client's own instruction to balance by visual weight rather than fixed dimensions — noted here rather than silently resolved.

Motion: same one-shot `revealStagger` GSAP entrance pattern as every other homepage section (not reinvented for this redesign) — 8px lift, ~100ms stagger, 0.6s duration, nothing continues after entrance. Verified via Playwright: `.trust-item` opacity is `0` before the section scrolls into view and `1` after: the animation genuinely fires on scroll, not just present in code. Confirmed `1` immediately under `reducedMotion: "reduce"` with no scroll at all (the shared `revealStagger` no-ops under reduced motion sitewide, unchanged).

One test-methodology note, not a product bug: an initial mobile check using an aggressive scripted wheel-scroll + `scrollIntoViewIfNeeded()` landed the section flush at the very top of the viewport, putting the heading visually behind the fixed nav header. Re-tested with a native `scrollIntoView({block:"center"})` (representative of how a real user actually encounters the section mid-scroll, rather than a worst-case snap-to-edge) and the heading, hairline, and full composition render correctly with no overlap at every breakpoint tested — this was purely a test-harness artifact of over-scrolling a heavily-animated page, not a fix applied to the site.

Verified at 1920×1080 / 1440×900 / 1024×768 / 768×1024 (identical 228.6px section height, 0 overflow, 0 console/page errors at all four) and 430×932 / 390×844 / 375×812 (stacked one-credential-per-row mobile layout, 445.8px height, 0 overflow, 0 errors at all three). `npx tsc --noEmit` and `npm run build` both clean.

Files changed: `src/components/home/trust-strip.tsx` (full rewrite). `src/components/trust-badges.tsx`, `src/lib/reveal.ts`, and `TRUST_BADGES` in `src/lib/site-data.ts` are unchanged — this section no longer consumes the shared `BadgeMark`.

---

## 1c-24. Trust strip — premium motion refinement (2026-08-08)

Follow-up to §1c-23: same ivory credentials band, larger marks with more presence and independent idle motion instead of sitting perfectly static. Desktop logo heights raised to 88–96px (from 64–72px) — BBB 224×88, GNET 104×96, NLA 96×96. NLA's white "credential plate" (added in §1c-23 because its native canvas is a few RGB points off the section's ivory tone) is removed entirely per this round's explicit instruction — it now uses the same flood-fill transparent derivative (`badge-nla-transparent.png`) the dark-context `BadgeMark` already used, confirmed clean on ivory via a close-up render check.

Entrance: one GSAP timeline (heading fade → gold accent `scaleX` draw → 3 logos fade+rise, 120ms stagger) whose `onComplete` starts a per-badge idle drift (independent amplitude/duration/phase per logo — BBB y:4/x:2/6.4s, GNET y:-5/x:3/7.2s, NLA y:3/x:-3/5.6s — so the three never move in visible sync), so there's no seam between "arriving" and "settling." `revealStagger` (`src/lib/reveal.ts`) gained an optional `distance` param (default unchanged) to support the smaller 8px lift this section needed. Hover: hover-hidden pause on that logo's drift tween (verified live via transform sampling, not assumed) + a 1.035 `scale` (note: Tailwind v4 compiles `hover:scale-*` to the standalone CSS `scale` property, not `transform` — a first verification pass checked the wrong computed-style property and wrongly read as broken; corrected by checking `getComputedStyle().scale`). All motion transform/opacity only; `prefers-reduced-motion` confirmed fully static (opacity 1, transform none, no drift, no hover motion via `motion-safe:`).

Verified: 255px section height at 1920×1080/1440×900/1024×768, 269px at 768×1024, 489px stacked at 430×932/390×844/375×812; 0 overflow, 0 console errors at all 7; `npx tsc --noEmit` and `npm run build` both clean.

Files changed: `src/components/home/trust-strip.tsx` (rewritten again for this round), `src/lib/reveal.ts` (`distance` param).

---

## 1c-25. Fleet + pricing source-of-truth audit vs. live MyLimoBiz screenshot (2026-08-08)

Client supplied a screenshot of the live MyLimoBiz booking system's displayed vehicle classes/capacities/pricing and asked for a full sitewide reconciliation. Audited via a dedicated research pass across `site-data.ts`, `image-map.ts`, every route, and JSON-LD before editing anything.

**Findings before editing:** `FLEET_VEHICLES` only published 5 of the 7 live classes (missing Luxury SUV and First Class Sedan — both already flagged as unresolved in `FLEET_REVIEW_ITEMS` from an earlier pass); every price field sitewide was already deliberately scrubbed to "See live rate"/"Quote only" placeholders per an earlier correction — except one stray, never-verified hardcoded `From $120/hour` at `vehicle-object.tsx:194` (a real bug, not a placeholder); Sprinter's capacity in `FLEET_VEHICLES` ("12–14"/"12+") disagreed with the already-verified live figure (14/10) sitting in the same file; vehicle-preference `<select>` options were defined independently in 3 places (`fleet.tsx`, `events.tsx`, `BOOKING_VEHICLE_OPTIONS`) with inconsistent naming ("Sprinter" vs "Executive Sprinter", "Executive SUV" vs "Luxury SUV" used interchangeably).

**Asset-integrity check, flagged before proceeding:** direct visual inspection of the actual fleet photos (not trusting filenames) found visible third-party branding — a "LUXLANE TRANSPORTS" QR decal on the Escalade (`suv-escalade-corporate.jpg`, `fleet-escalade.jpg`) and a "LEGEND" windshield decal on the Sprinter (`sprinter-exterior.jpg`). Flagged to the client rather than silently continuing (per the standing "no unverified assets" rule) — client confirmed these are authorized/licensed (consistent with `BOOKING.alias = "luxlanetransports"`, the real MyLimoBiz account this site already integrates with) and to proceed using them.

**Changes:**
- `site-data.ts`: `FLEET_VEHICLES` gained `firstClassSedan` (2 pax/2 bags, From $140) and `luxurySuv` (6 pax/6 bags, From $130), inserted adjacent to their sibling class; `sedan` and `suv` gained real `priceFrom`/`priceLabel` (From $95 / From $110); Sprinter capacity corrected to 14 pax/10 bags. `BOOKING_VEHICLE_OPTIONS` is now derived directly from `FLEET_VEHICLES` (was a hand-maintained, independently-drifting array) so it can't fall out of sync again. `VERIFIED_LIVE_VEHICLE_CLASSES` (used by `/rates`) gained a `priceLabel` per class. `RATES` gained a `pricingCaveat` field with the client's exact requested disclaimer. `FLEET_REVIEW_ITEMS` trimmed to only the two still-genuinely-unresolved entries (Mercedes V-Class, Limousine) now that Luxury SUV/First Class Sedan are resolved and published.
- `image-map.ts`: two new entries — `fleetLuxurySuv` (activates the previously-unreferenced `fleet-escalade.jpg`, a real rear-3/4 photo of the same verified Escalade, distinct from `fleetSuv`'s front-3/4 crop) and `fleetFirstClassSedan` (activates the previously-unreferenced `chauffeur-sclass-portrait.jpg`, same verified S-Class as `fleetSedan` but a distinct chauffeur-forward portrait crop) — per instruction #15, no two classes ever render the identical photo.
- **`fleet.tsx`**: converted `FLEET_VEHICLES[0..4]` positional-index access to `.find(v => v.id === ...)` lookups — the array grew from 5 to 7 entries and reordered, so positional access would have silently pulled the wrong vehicle's data into the wrong chapter (caught and fixed before it could ship). Added two new chapters reusing the page's own established templates rather than inventing a new visual language: **First Class Sedan** reuses the Sedan chapter's full-bleed layout (mirrored diagonal wipe direction so the adjacent pair doesn't read as identical), **Luxury SUV** reuses the SUV chapter's split-panel layout with the image/copy columns swapped. `vehiclePreference` select (fed by `FLEET_VEHICLES.map`) now offers all 7 automatically.
- **`horizontal-journey.tsx`**: same positional-index bug fixed (`FLEET_VEHICLES[0..3]` → `.find()` by id) — this one would have broken silently and immediately given the array reorder, not just been a future risk.
- **`vehicle-object.tsx`**: the stray `From $120/hour` replaced with the real `FLEET_VEHICLES` SUV data (`From $110`), sourced live rather than hardcoded a second time.
- **`rates.tsx`**: cards now show each class's real `priceLabel` (was a static "See live rate at booking" line on every card regardless of class) plus the new pricing-caveat disclaimer beneath the grid.
- **`events.tsx`**: vehicle-preference select renamed "Sprinter" → "Executive Sprinter" and expanded to include SUV/Luxury SUV/Mini Coach/Motor Coach alongside the existing event-specific "Mixed Fleet" option, aligning naming with the canonical taxonomy without removing the event-specific extras.
- **JSON-LD** (`__root.tsx`): reviewed, not changed — the existing symbolic `priceRange: "$$$"` remains accurate now that real per-class pricing exists; a literal `Vehicle`/`Offer` schema was not added since the client didn't request it and "from" starting rates don't map cleanly onto schema.org's fixed-price `Offer` semantics without inventing claims.

**Verified**, not assumed: real-scroll/DOM checks (with the first-visit brand loader explicitly skipped via its own `sessionStorage` session key, matching a returning visitor) confirmed all 7 rates cards show correct capacity+price, all 7 fleet chapters render in the correct order with correct data (`data-vehicle-chapter` attributes: sedan, firstClassSedan, suv, luxurySuv, sprinter, coachMini, coachLarge), the homepage `VehicleObjectJourney` caption now reads "Executive SUV · 6 passengers · From $110", and the `/airport` + `/events` vehicle-preference selects list the corrected names. 0 console/page errors, 0 horizontal overflow at 430×932/390×844/375×812 on `/fleet` and `/rates`. `npx tsc --noEmit` and `npm run build` both clean.

Files changed: `src/lib/site-data.ts`, `src/lib/image-map.ts`, `src/routes/fleet.tsx`, `src/routes/rates.tsx`, `src/routes/events.tsx`, `src/components/home/horizontal-journey.tsx`, `src/components/home/vehicle-object.tsx`.

---

## 1c-26. Final booking + fleet cleanup + mobile production pass (2026-08-08)

**Sedan image** — `sedan-virgin-hotels.jpg` (the previously-live Sedan photo) had a second, differently-colored S-Class visible in the same frame, ambiguous about which car was being advertised; flagged and replaced. Two real alternatives were tried and rejected before landing on the final fix: a tight rectangular re-crop of just the black car excluded the second vehicle but, at the Fleet page's ultra-wide 21:9 full-bleed chapter container, a source that narrow has to scale up so much to cover the container width that only ~18% of its height ever renders — reducing the shot to an extreme grille close-up that no longer clearly read as "a sedan." Switching the source entirely to `hero-sclass-chauffeur.jpg` (same verified S-Class, wider 3/4-angle photo) traded that problem for a new one — a seated bystander at the frame's far-left edge that the same container math can never crop away via `objectPosition` alone (the container always needs this image's full width, confirmed by computing the actual `cover` scale factor, not assumed). Final fix: a real rectangular crop of `hero-sclass-chauffeur.jpg` (`sedan-chauffeur-crop.jpg`, `sharp .extract({left:220,width:1780})`) that excludes the bystander while staying wide enough to avoid the over-zoom problem — verified both by the container-math calculation and by direct visual inspection of the rendered chapter before finalizing.

**Fleet image audit** — re-verified all 7 published classes (Sedan, First Class Sedan, SUV, Luxury SUV, Executive Sprinter, Mini Coach, Motor Coach) against real, category-correct, non-duplicated photos; no changes needed beyond Sedan (§1c-25 had already resolved the other 6).

**Booking architecture audit** — searched the whole project for duplicate/competing booking forms per explicit client concern. Found the site already correctly consolidated: the homepage's old quote-wizard `BookingExperience` component was already removed in an earlier pass (its pickup/dropoff fields had no real address autocomplete, duplicating the real MyLimoBiz flow — documented in the component's own file header). The 6 remaining `LeadForm` instances (contact, corporate, fleet inquiry, services, airport flight-details, events multi-day/multi-stop) each serve a genuinely distinct, non-booking purpose and already self-disambiguate from `/book` in their own description copy. One wording fix made: the airport page's flight-detail-request form was headed "Reserve your airport transfer," which read as competing with the real reservation system even though the form itself never claimed to be one — retitled to "Send your flight details." Every "Book Now"/"Book Your Ride"/"Reserve Your Ride"/"Check Live Rates" CTA sitewide was traced to its actual link target (not just its label) and confirmed to route to `/book`.

**Footer trust badges removed** — `FooterTrustBadges` (rendered `<TrustBadges size="compact" />` in a bordered wrapper right before the copyright bar) deleted cleanly along with its now-unused import; the copyright bar's own existing `border-t`/`mt-16` spacing closes the footer correctly on its own, no leftover gap or separator. The homepage's main "Trust & Accreditations" section (§1c-24) is untouched.

**Mobile production pass** — ran a scripted sweep across all 17 routes × 4 breakpoints (430×932/390×844/375×812/360×800, 68 combinations): 0 horizontal overflow, 0 console/page errors at every single one. A second pass checked actual image HTTP response codes (not DOM `.complete`, which false-positives on below-fold `loading="lazy"` images that simply haven't entered viewport yet) across 13 routes with full-page scroll to force every lazy image to load — 0 failed image requests. Visual spot-checks: mobile menu (compact, all sections present, no overflow with menu open), `/fleet` chapters (vehicle clearly visible, no aggressive crop, name/capacity/price/CTA all readable), `/book`'s MyLimoBiz iframe (loads full-width with no clipping once the third-party widget finishes initializing — an initial screenshot taken too early showed a large black gap that fully resolved by ~8s, a load-timing artifact, not a bug), footer (no phantom badge row, clean ending).

One real mobile bug found and fixed: at 390px width the footer's copyright line wrapped wide enough that its lower-right corner sat directly under the fixed WhatsApp FAB (confirmed via exact bounding-box overlap measurement — copyright text `y:696-712` vs. WhatsApp FAB `y:656-712`, `x:318-374`, a genuine ~47×16px overlap, not a visual illusion from a screenshot). Fixed with mobile-only bottom padding (`pb-24 md:pb-0`) on the copyright bar specifically, re-measured after the fix to confirm a clean ~40px gap.

One test-methodology note: an early footer screenshot used Playwright's `fullPage: true`, which produced the same fixed-position "phantom duplicate" artifact documented earlier this session (the sticky header and sticky mobile Book-Now bar appeared to repeat mid-page) — re-verified with real-scroll, viewport-only screenshots instead and confirmed the actual footer has no such duplication.

Verified: `npx tsc --noEmit` and `npm run build` both clean; final full-sweep re-run (all 17 routes × 4 breakpoints) after every fix — 0 overflow, 0 errors.

Files changed: `src/lib/image-map.ts` (Sedan image), `src/components/site-footer.tsx` (trust badges removed, FAB-clearance padding added), `src/routes/airport.tsx` (form heading wording).

---

## 1c-27. Mobile-first UI/UX production pass (2026-08-08, partial — see scope note)

Client asked for mobile to feel "more impressive than desktop," specifically art-directed for phones rather than a responsive shrink. Given the scope (34 numbered sections spanning every route, image, video, typography, spacing, animation, and performance dimension), this pass focused on the highest-leverage, verifiable fixes rather than attempting exhaustive coverage of all 34 items in one sitting — flagged honestly below rather than claiming full completion.

**Root-cause finding — the real bug behind most mobile crop complaints:** `image-map.ts` has authored `objectPositionMobile` values for every image, but grep confirmed only 2 of the ~15 components that render images (`horizontal-journey.tsx`, `pinned-stories.tsx`) ever actually read that field — every other usage (the homepage Hero, and `PageHero`, used by 14 interior routes) only ever applied `objectPositionDesktop`, regardless of viewport. Mobile visitors have been seeing the desktop crop sitewide since these fields were first authored. Fixed at the source: `PageHero` (`site-layout.tsx`) now accepts `imagePosition`/`imagePositionMobile` and applies them responsively via CSS custom properties (`[object-position:var(--x)] md:[object-position:var(--y)]` — inline styles can't do breakpoints directly, so the values are piped through as CSS vars and the responsive switch happens in the Tailwind arbitrary-property classes). All 14 `PageHero` call sites updated: `fleet.tsx`/`reviews.tsx` already passed a desktop position and gained a mobile one; `airport.tsx`/`events.tsx`/`about.tsx`/`contact.tsx`/`service-areas.tsx`/`corporate.tsx` previously passed no position at all (default browser center-crop) and now pass both. The homepage Hero (`cinematic-hero.tsx`) got the same CSS-var treatment.

**Hero mobile art direction — real crop, not just repositioning:** the desktop Hero source (`hero-fleet-lineup.jpg`, a wide 5-vehicle lineup, 1535×1024) is height-bound under `object-fit: cover` on a portrait mobile viewport (verified via the actual cover-scale-factor math: at 390×844, `max(390/1535, 844/1024) = 0.824`, height-bound) — meaning the FULL vertical extent of the source, including its top third of empty sky, always renders on mobile no matter what `objectPosition` value is set; there's no vertical crop headroom to shift with a position value alone. A real screenshot confirmed this: adjusting `objectPositionMobile` had visibly zero effect on the sky-to-vehicle ratio. Fixed with a genuine mobile-specific derivative (`hero-fleet-lineup-mobile.jpg`, a real `sharp` crop trimming almost all the sky and tightening onto 4 of the 5 vehicles + the branded coach), swapped in via a `<picture><source media="(max-width: 767px)">` element — the first genuine "different image, not just repositioned" mobile art direction on this site. The route-level image preload (`index.tsx`) was split by the same breakpoint so mobile no longer force-downloads the desktop image it will never display.

**Second real crop bug found and fixed:** `airportGateway` (the DFW monument-sign photo) had a mobile position value that was a near-duplicate of its desktop value ("50% 40%" vs "50% 45%") despite the "DFW" lettering sitting in the right ~35% of the source frame, not centered — on the mobile `PageHero` container (also height-bound, same math as above) this centered the crop on plain building/grass and left only a sliver of one letter visible, confirmed via an actual mobile screenshot before fixing. Corrected to `"82% 42%"` so the full "DFW" lettering — the entire point of the photo — is in frame.

**Stale performance bug found and fixed:** a sitewide `rel="preload"` in `__root.tsx` was hardcoded to `group-coach-bus.jpg` — the Hero image *before* an earlier 2026-08-07 swap to `hero-fleet-lineup.jpg`, never updated when the swap happened. Every one of the 17 routes was force-fetching a large image at high priority even on the 16 routes that never render it. Removed.

**Footer mobile FAB-clearance fix carried forward from the prior pass (§1c-26)** was re-verified still correct after this round's changes.

**Verified, not assumed:** full 68-combination overflow/console-error sweep (17 routes × 4 breakpoints: 430×932/390×844/375×812/360×800) re-run after every change — 0 problems throughout. Real before/after mobile screenshots taken for the Hero and `/airport` fixes specifically (not just code review) — the before screenshots are what surfaced both real bugs in the first place. `npx tsc --noEmit` and `npm run build` both clean.

**Scope note — what this pass did NOT cover**, flagged explicitly rather than silently: a genuine mobile-specific derivative + `<picture>` swap was only built for the Hero (the highest-impact single image); the other ~24 images in `image-map.ts` got the responsive-position wiring fix (a real, verified improvement — no longer stuck on desktop crops) but were not individually re-evaluated for whether their existing `objectPositionMobile` *values* need the same "real crop, not just repositioning" treatment the Hero and `airportGateway` needed — most looked like genuine (if modest) intentional adjustments on inspection, but a full per-image audit at the scale of items #4–5 in the request, plus a full typography-scale rebuild (#6), spacing-rhythm system (#7), video/CLS/INP performance audit under real network throttling (#5, #20, #29), and a complete iOS/Android device matrix (#17–18, #27) were not attempted in this pass — each is a substantial standalone effort. Recommend scoping those as explicit follow-up passes rather than claiming them done here.

Files changed: `src/components/site-layout.tsx` (`PageHero` responsive position), `src/components/home/cinematic-hero.tsx` (`<picture>` mobile source), `src/lib/image-map.ts` (`heroMobile` key, `airportGateway` mobile position fix), `src/routes/index.tsx` (split preload), `src/routes/__root.tsx` (stale preload removed), `src/routes/{airport,events,about,contact,service-areas,corporate,fleet,reviews}.tsx` (PageHero position props wired).

---

## 1c-28. Client-verified correction — First Class Sedan pricing (2026-08-08)

Client provided a direct correction: First Class Sedan is 2 passengers / 2 luggage / **$150/hour** — explicitly confirmed hourly this time (unlike the earlier $140 figure, sourced from a single non-submitted per-trip quote, which was never confirmed as the class's actual rate). Per the client's explicit pricing-source hierarchy (direct client confirmation > live booking system > project docs > old site), the new figure supersedes it.

**Investigated before changing anything** (per explicit "do not blindly rename" instruction): confirmed via this session's own earlier live MyLimoBiz check that Sedan (3 pax, $95) and First Class Sedan (2 pax, now $150/hour) are genuinely separate booking classes, not a naming variant of the same one — the homepage's "Executive Sedan" fleet slide (`horizontal-journey.tsx`, 3 pax/$95) represents the *Sedan* class, not First Class Sedan, and was correctly left unchanged. Only the actual `firstClassSedan` entry (already published in an earlier pass — §1c-25/§1c-26) was corrected.

Changed: `FLEET_VEHICLES.firstClassSedan.priceFrom` ("140"→"150") and `.priceLabel` ("From $140"→"$150/hour", since this is now a confirmed hourly rate, not a generic "from" display figure); `VERIFIED_LIVE_VEHICLE_CLASSES`'s First Class Sedan entry (same change) — this single edit propagates automatically to every consumer (`/rates` cards, the `/fleet` First Class Sedan chapter, its sticky conversion bar) since none of them hardcode the price separately. Grepped the whole `src/` tree for `$140`/`$95`/`$150` and "First Class Sedan" — no other hardcoded references existed anywhere (FAQ, Services, Corporate, Airport, Events, Contact, JSON-LD all confirmed clean). Image unchanged (`chauffeur-sclass-portrait.jpg`, already the correct real S-Class photo, not SUV/crossover/AI/third-party-branded).

Verified live: `/rates` and `/fleet` both now show "First Class Sedan · 2 passengers · 2 bags · $150/hour"; Sedan/Executive Sedan unchanged at "3 passengers · 2 bags · From $95." `npx tsc --noEmit` and `npm run build` both clean.

Files changed: `src/lib/site-data.ts` only.

---

## 1c-29. Image rollback — First Class Sedan (2026-08-09)

Client asked to revert First Class Sedan's vehicle image to "the exact image used immediately before the most recent sedan-image change," keeping the new $150/hour data. Git history couldn't resolve which image that was (the repo's only commits pre-date this entire session — nothing from any earlier round in this conversation was ever committed, so `git diff`/`git log` show one big undifferentiated diff, not the intermediate states). Investigated from session context instead: the First Class Sedan chapter's image (`chauffeur-sclass-portrait.jpg`) had never actually been changed since that class was first published (§1c-25) — the image that *did* change multiple times this session was the separate Sedan/Executive Sedan chapter's (`sedan-virgin-hotels.jpg` → `hero-sclass-chauffeur.jpg` → `sedan-chauffeur-crop.jpg`, §1c-26). Given the real ambiguity (which of those three the client meant, and for which chapter), asked via `AskUserQuestion` rather than guess — confirmed: `sedan-virgin-hotels.jpg`, for the First Class Sedan chapter specifically.

Restored `fleetFirstClassSedan` in `image-map.ts` to `sedan-virgin-hotels.jpg` with the *exact* `objectPosition` values that image used when it was last live (`"50% 45%"` desktop / `"50% 40%"` mobile) — not re-tuned, per the client's explicit "do not change the crop unless needed to reproduce the previous approved rendering." `fleetSedan` itself was left untouched (still `sedan-chauffeur-crop.jpg`) — the two sedan classes still render different photos of the same verified S-Class.

While restoring the mobile crop, found the Fleet chapters (`fleet.tsx`) never actually applied `objectPositionMobile` at all — only `objectPositionDesktop`, unconditionally, the same class of bug fixed sitewide for `PageHero`/the Hero in §1c-27 but which that pass didn't reach (the fleet chapters use their own inline `<img>` markup, not `PageHero`). Fixed for the First Class Sedan chapter specifically (same CSS-custom-property responsive pattern as §1c-27) so the restored crop's mobile value is genuinely applied, not silently ignored. The other 6 fleet chapters have the same latent gap — not fixed here (out of scope for an image-only rollback), flagged for a follow-up pass.

Verified live at desktop (1440), tablet (768), and mobile (390): correct image loads at all three (`sedan-virgin-hotels.jpg`, confirmed via `img.src` + `naturalWidth`), sharp, properly cropped, text fully readable, data confirmed unchanged (First Class Sedan · 2 passengers · 2 luggage · $150/hour), Sedan chapter confirmed untouched (`sedan-chauffeur-crop.jpg`, 3 passengers · From $95). Full 68-combination overflow/error sweep re-run clean. `npx tsc --noEmit` and `npm run build` both clean.

Files changed: `src/lib/image-map.ts` (`fleetFirstClassSedan`), `src/routes/fleet.tsx` (responsive mobile crop for that one chapter's image).

---

## 1c-30. First Class Sedan — final client-supplied image + sitewide mobile object-position (2026-08-09)

Two related asks landed in sequence. First: the client rejected the §1c-29 rollback too and specified precisely what they wanted instead — a front-facing shot with the grille/hood/emblem dominant, not a chauffeur portrait or a wide establishing shot. Visually inspected every Mercedes/sedan asset in the project before creating anything new: `public/assets`, `public/assets/official`, and `src/assets` (including its `lct/`/`lct-real/` `.asset.json` sidecars, all of which resolved back to a single `/assets/fleet-sedan.jpg` — a studio-lit, black-backdrop, gold-aftermarket-wheel image, rejected outright as a stock/rendered photo, not a real client photo, regardless of how well its framing matched the brief). No existing derivative fit cleanly — the one from the previous rollback investigation (`sedan-virgin-hotels-single.jpg`) turned out to be asymmetric, missing the car's own left headlight, because its crop boundary had only ever been chosen to exclude a second car in the background, not to frame the primary vehicle symmetrically. Built a new, properly centered crop straight from the original source (`sedan-front-grille.jpg`) and shipped it after visually confirming both headlights, full grille, and hood emblem were in frame with the second car fully excluded.

That still wasn't the final answer: the client then attached the exact photo they wanted directly in chat. This surfaced a real capability gap, stated plainly rather than worked around: there is no tool available that can take image bytes shown inline in a chat message and persist them to disk — vision input isn't reversible to file output through anything in this toolset. Said so directly instead of pretending to save it. The client then reported saving the file to disk themselves three times before it actually resolved; each of the first two "it's saved" reports was checked with three independent methods (`ls`, a `sharp` metadata read, and the `Read` tool) before responding, and each time it genuinely wasn't there — including a search across all three LCT project copies that exist on this machine and the full user profile, specifically to rule out a location mix-up before reporting back. The actual blocker was a one-character extension mismatch: the file existed as `first-class-sedan.jpeg`, not `.jpg`. Confirmed via `sharp` metadata (1560×878 after EXIF auto-orientation) and a direct visual read that it matched the attached photo exactly before touching any code.

Wired in as supplied — no new derivative crop this time, per explicit client instruction to art-direct via `objectPosition` only. The source's ~16:9 aspect happens to closely match this chapter's own mobile container aspect, so mobile needs almost no cropping in either dimension (confirmed by computing the actual `cover` scale factors); at the wider desktop aspect the source is width-bound (full width always renders, horizontal position is moot there) with a real vertical crop window, tuned to `56%` to keep the grille/headlight band centered — confirmed by rendering the actual scaled crop before choosing the value, not by eyeballing the source photo.

**Second ask, addressed in the same round:** fix the sitewide gap flagged-but-not-fixed in §1c-29 — all 7 Fleet chapters (not just First Class Sedan) now apply real `objectPositionMobile` values via the same CSS-custom-property responsive pattern used elsewhere this session, instead of only ever applying the desktop position regardless of viewport.

Verified live, not assumed: all 7 Fleet chapters' image `src` and text content checked directly (only `firstClassSedan`'s image changed; Sedan/SUV/Luxury SUV/Sprinter/Mini Coach/Motor Coach all confirmed byte-identical to before); `/rates` re-checked (First Class Sedan: 2 passengers · 2 bags · $150/hour, all other classes unchanged); `/book` re-checked (exactly 1 iframe, 0 errors — MyLimoBiz untouched all session). Full 7-breakpoint screenshot QA (1920×1080 down to 375×812) plus a settled (post-entrance-animation) desktop screenshot. `npx tsc --noEmit` and `npm run build` both clean.

Files changed: `src/lib/image-map.ts` (`fleetFirstClassSedan` final image + position), `src/routes/fleet.tsx` (mobile `objectPosition` for the remaining 6 chapters).

---

## 1c-31. Approved-asset-folder audit + a real dist/ staleness bug caught (2026-08-10)

Client asked that all vehicle/fleet image assignments be sourced only from `dist/assets/official` going forward. Important nuance surfaced and explained rather than followed blindly: `dist/` is Vite's build output — it is generated *from* `public/assets/official` on every `npm run build`, not the other way around, and gets fully overwritten by the very build this task ends with. Confirmed via `comm` diff that `dist/assets/official` contained zero files not already in `public/assets/official` — no separate/curated pool existed to discover, so no image reassignment was actually needed; every `src` in `image-map.ts` already traced back to a real, previously-inspected client photo, never a stock/AI image.

That diff also surfaced a genuine, currently-live bug: `dist/assets/official` was stale, missing two files that ARE actively referenced in current source (`sedan-chauffeur-crop.jpg` — Sedan chapter, and `chauffeur-corporate-portrait-v2.jpg` — used in 4 placements including the /corporate hero). Confirmed live, not assumed: screenshotted `/corporate` before touching anything and its hero rendered with no image at all — genuinely broken in the then-current preview, not hypothetical. Root cause: `dist/` reflected a build from before those two files were added, and nothing had rebuilt it since. Fixed by rebuilding (`npm run build`, which is a strict resync of `dist/` from `public/`), then re-screenshotted `/corporate` to confirm the chauffeur portrait now renders correctly.

Re-verified after the rebuild: `/corporate` hero, Services → Group Transportation (real full-size motorcoach, correctly labeled), `/airport` hero (DFW monument sign), and Fleet's Sedan + First Class Sedan chapters (both correct, First Class Sedan still `first-class-sedan.jpeg` / 2 passengers / 2 luggage / $150/hour, unchanged). All 7 Fleet chapters' image `src` + text re-confirmed unchanged except where already noted. `/rates` and `/book` (exactly 1 MyLimoBiz iframe) re-confirmed unaffected. Grepped all of `src/` for `C:\Users` / `C:/Users` — zero matches, confirming no Windows filesystem path has ever been placed in application code (every reference is the web-relative `/assets/official/...` form). Full 17-route × 4-breakpoint (360/375/390/430) overflow/console-error sweep: 0 overflow, 0 errors. A separate HTTP-status-based check (distinct from the DOM-`complete`-based check, which flags below-the-fold lazy images as false positives — a known artifact from earlier this session) across 10 key routes confirmed 0 real broken image responses. `npx tsc --noEmit` and `npm run build` both clean.

No files changed this round — the only "fix" was rebuilding to resync `dist/` with the already-correct `public/` source, which the task's own final step (`npm run build`) would have done regardless. Documented here because the staleness was a real, currently-observable bug at the moment it was checked, not a false alarm.

---

## 1c-32. Service Areas SEO rebuild + rejected-image replacement + Join Our Team feature (2026-08-11)

Three-part client revision, implemented without any redesign of the approved black/gold identity, nav, Fleet, booking/MyLimoBiz, Rates, FAQ, or Policies.

**Service Areas.** `service-areas.tsx` rebuilt around a new `SERVICE_AREA_GROUPS` export in `site-data.ts` — 57 unique cities in 3 client-supplied groups (Dallas & Surrounding Communities / Fort Worth & Southwest Metro / Mid-Cities & North DFW), editorial multi-column lists, not card spam. "Lake Worth" appeared in both the client's Fort Worth and Mid-Cities lists; kept once, in Fort Worth & Southwest Metro (the geographically accurate fit — Lake Worth, TX sits directly northwest of Fort Worth), removed from Mid-Cities. Added a disclaimer that LCT Universal dispatches from Grapevine and does not operate branch offices in every listed city (no fabricated local addresses). New `Service` JSON-LD with `areaServed` listing all 57 cities plus a `BreadcrumbList`; the sitewide `LocalBusiness` schema in `__root.tsx` also switched `areaServed` from a single free-text string to the same 57-city `City` array. Existing `Scene3D`/`ServiceAreasMapCanvas` 4-hub diagram kept unchanged. Genuine internal links added to Airport/Corporate/Fleet/Rates/Book in a new "Every Trip, Every Community" section — not forced onto individual city names. City landing pages intentionally not built this pass (one authoritative page only, per client instruction); noted here as a documented future option, not started.

**Rejected image.** The chauffeur-legs/wet-pavement/awkward-crop image (`coach-airport-arrival.jpg`) is fully removed from the Fleet Executive Mini Coach chapter — no re-crop, no reuse anywhere. Replaced with `coach-sideprofile-day.jpg` (real client asset, branded "LCT UNIVERSAL EXECUTIVE TRANSPORTS" bus body clearly dominant), `objectPositionDesktop:"20% 50%"` / `objectPositionMobile:"15% 48%"`, tuned against this chapter's existing `xPercent:-6` scroll-scrub parallax and re-verified via real-scroll (not instant-jump) screenshots on desktop and mobile. The same source photo is also used, unchanged, as `fleetCoachJourney` on the homepage; given a distinct `objectPosition` (`"38% 45%"` / `"35% 42%"`) so the two placements don't read as an identical repeat.

**Join Our Team.** New route `/join-our-team`, added to the header's Company dropdown (also drives mobile accordion, same `NAV_ENTRIES` array) and the footer's Explore column; added to `sitemap.xml`. Three pathway cards (Driver Application, Company Partner, Referral Partner) open the corresponding form below on selection. Field lists were built from a direct audit of the old production site's 3 forms at lctuniversal.com, reproduced in the new premium design system (multi-section layout, inline validation, 16px+ mobile inputs, honeypot). Backend: 3 new Supabase tables (`driver_applications`, `company_partner_applications`, `referral_partner_applications`, migration `20260811200635_join_our_team_applications.sql`), fully separate from `form_submissions`/MyLimoBiz, each with RLS insert-only policies and a shared parameterized rate-limit trigger; a new private `applications` Storage bucket holds driver license/headshot and company compliance-document uploads. **This migration has not been applied to the live database** — this environment has no authenticated Supabase CLI session (`npx supabase projects list` still returns `LegacyPlatformAuthRequiredError`, re-confirmed this round); the SQL is correct and ready but inert until run via `supabase db push` or the Supabase SQL editor by someone with dashboard access. As with every other form on this site, there is no email/SMS notification mechanism anywhere in the codebase (confirmed absent, not newly removed) — applications persist to Supabase only, matching existing site-wide behavior. The 2 Referral Partner affiliate-agreement checkbox legal texts were reconstructed rather than copied verbatim, since the old-site fetch truncated that content — flagged for client review, not presented as guaranteed word-for-word parity. New images: `joinTeamDriver` (`chauffeur-sclass-portrait.jpg`, previously unused), `joinTeamPartner` (`hero-sclass-chauffeur.jpg`), `joinTeamReferral` (a 4th distinct crop of `chauffeur-corporate-portrait-v2.jpg`, the only remaining suitable real "professional relationship" photo) — each real client media, each with its own crop.

**Validation.** `npx tsc --noEmit` clean. `npm run build` clean, `join-our-team` and `service-areas` confirmed as separate auto-generated code-split chunks (TanStack Router's Vite plugin regenerates `routeTree.gen.ts` on new route files — no manual edit made or needed). `npm audit`: same 2 pre-existing dev-server-only vulnerabilities as prior rounds (Vite 7.0.0-7.3.3, esbuild 0.27.3-0.28.0), not auto-fixed (`--force` would move Vite outside its stated range without explicit instruction). Responsive sweep across 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 412×915, 393×852, 390×844, 375×812, 360×800 on `/`, `/service-areas`, `/join-our-team`, `/fleet`: 0 horizontal overflow, 0 console/page errors. Not deployed — stopped for local client review per explicit instruction.

---

## 1c-33. Join Our Team production-readiness pass — migration audit + recovered legal copy (2026-08-11)

Follow-up to §1c-32, before the Supabase-backed forms were superseded by Clienity (§1c-34 below) — kept here as the historical record of what was audited/fixed in the local implementation while it was still the live path.

**Migration audit.** Re-opened `20260811200635_join_our_team_applications.sql`, cross-checked all 3 tables/policies/triggers against the two prior migrations (`20260721224749`, `20260721224802`, `20260802010000`) — no table/function/policy name collisions; `update_updated_at_column()` (defined in the first migration) is reused, not redefined. Confirmed every column the frontend writes (`src/lib/applications/submit.client.ts`) matches the migration's column set exactly. Prepared a safe-to-paste, idempotent version at `supabase/sql-editor/apply-join-our-team-applications.sql` (transaction-wrapped, `IF NOT EXISTS`/`DROP ... IF EXISTS` guards) plus `supabase/sql-editor/verify-join-our-team-applications.sql` for post-apply verification. **Still not applied to the live database** — no authenticated Supabase CLI session available in this environment.

**Recovered Referral Partner legal copy.** Re-fetched `https://lctuniversal.com/affiliatepartnerapplication` directly (previously only the `/join-our-team` landing page had been reachable) and recovered the exact original 2 checkbox statements, verified via 2 independent fetches with different prompts returning identical text. Replaced the previously-reconstructed wording in `referral-partner-application-form.tsx` with the verified original.

**Compliance-checkbox gap found and fixed.** While re-auditing, also fetched `driversapplication` and `partnerapplication` (not just the referral form) and found the local Driver Application form only reproduced 2 of the old site's 10 checkbox statements, and Company Partner only 1 of 3 — missing MVR/background-check authorization, FCRA notice, SSN/drug-screening notice, third-party-sharing notice, e-signature/at-will disclaimer (driver), and the "no partnership created" + SMS/phone/email contact-consent disclaimers (company partner). Expanded both: `driver_applications` gained `background_check_consent`, `screening_notice_ack`, `employment_terms_ack`; `company_partner_applications` gained `no_partnership_disclaimer_ack`, `contact_consent_ack` — all with matching `WITH CHECK (... = TRUE)` DB-level enforcement (the original migration had none for the 2 pre-existing booleans either; this pass added it for all 5 new + carried it forward). Migration file, `types.ts`, `applications/types.ts`, `applications/schema.ts`, `submit.client.ts`, and both form components updated to match. Since the migration had never been applied live, this was a direct edit to the same migration file, not a follow-up migration.

**End-to-end verification (as far as this environment allows).** No Docker/Supabase CLI available, so a real database write could not be exercised. Verified instead: empty-submit blocking (12/3/10 required-field messages across the 3 forms), partial-checkbox blocking, required-file blocking, all recovered/expanded legal text rendering correctly, zero PII in console output, zero page errors, and graceful non-crashing failure UI ("We could not save your application right now...") with all entered data preserved — confirmed correct given the migration isn't live, not a bug.

---

## 1c-34. Clienity CRM integration — Join Our Team forms replaced with live production embeds (2026-08-11)

Client-directed architecture change: the existing LCT Universal Clienity CRM account already contains the production Driver/Partner/Referral application forms and workflows; the client asked that these become the source of truth instead of running a second, disconnected Supabase-backed application pipeline (§1c-32/§1c-33 above).

**Embeddability confirmed, not assumed.** Checked response headers (no `X-Frame-Options`/CSP `frame-ancestors` on any of the 4 supplied Clienity widget URLs) and rendered each inside a real iframe via Playwright — all loaded with full content, zero console/page errors, and the top-level frame never navigated away (ruling out JS frame-busting). No official Clienity resize script or continuous postMessage height protocol was found (only a one-time `["iframeLoaded"]` postMessage on load) — and since the origin is cross-origin, this app's own JS can never read the framed document's live height. Instead of an arbitrary fixed height, real content height was measured via Playwright at 5 widths (360–1440px) per form and used (plus an ~8% safety margin) to set responsive `min-height` via the same CSS-custom-property + Tailwind-arbitrary-value pattern already used elsewhere in this codebase for responsive `objectPosition` (`ClienityEmbed`, `src/components/applications/clienity-embed.tsx`) — content fits without the iframe needing its own scrollbar in normal use; native overflow is left enabled as a graceful fallback, not suppressed.

**One form held back — flagged, not silently integrated.** The supplied "Corporate Transportation Application" URL (`.../pvN3FtTiP6VOtcMlE9cj`) is an unfinished Clienity template: a single `Email` field, two SMS-consent checkboxes still containing literal unfilled placeholders (`[BUSINESS NAME]`, `[USE_CASE_FROM_CAMPAIGN_DESCRIPTION]`), and a submit button literally labeled "Button." **Not wired into the site.** No Corporate Transportation CTA was added anywhere — the client should finish configuring this form in the Clienity dashboard first.

**Brand-name inconsistency found on the live Driver form.** The Driver Application Clienity form's body text mixes "LCT Universal" (8 occurrences) with "Luxlane" (17 occurrences, including the intro line "Join Luxlane's professional driver team...") — "Luxlane Transports" also appears as the literal path segment in the existing MyLimoBiz booking URL (`book.mylimobiz.com/v4/luxlanetransports`), so this may be an intentional underlying legal-entity name or may be un-updated template boilerplate — genuinely ambiguous from outside the Clienity account, flagged rather than guessed at or silently edited. The Partnership form has one stray "Luxlane" mention among 14 "LCT Universal" mentions; the Referral form has none.

**Implementation.** `src/routes/join-our-team.tsx`: kept the existing pathway-selector cards and page structure unchanged; the "application open below" section now renders `<ClienityEmbed>` for the selected pathway instead of the local Supabase-backed form component, widened from `max-w-3xl` to `max-w-4xl` per the client's "don't put it in a tiny card" instruction. The 3 local form components, `src/lib/applications/*`, and the Supabase migration/types are all **kept in the codebase, untouched, just disconnected from this route** — per explicit instruction not to delete them until Clienity is proven in production. Vite's build correctly tree-shook the now-unused form components out of the shipped `join-our-team` bundle (no separate chunk for them appears in `dist/`), so this is a net bundle-size win, not dead weight shipped to users.

**QA.** `npx tsc --noEmit` and `npm run build` both clean. Responsive sweep of all 3 live embeds at 360×800, 375×812, 390×844, 393×852, 412×915, 430×932, 1024×768, 1440×900: 0 horizontal overflow, 0 page errors, iframe height correctly switches at the 768px breakpoint, iframe `src` confirmed pointing at the correct Clienity URL per pathway at every size.

**Not verified (requires the client's own access/authorization).** Whether a submission actually reaches the correct Clienity pipeline/contact record, whether configured automations fire, and exact Thank-You/success behavior — no test submission was made per the explicit instruction not to submit fake production leads without authorization. MyLimoBiz booking (`/book`) confirmed completely unrelated and untouched — grepped for cross-references between `src/components/booking/`, `src/lib/site-data.ts`'s `BOOKING` config, and everything Clienity/applications-related; zero overlap either direction.

---

## 1c-35. Join Our Team — pathway card media differentiation pass (2026-08-11)

Client feedback: the 3 pathway cards (Driver / Company Partners / Referral Partner) all used chauffeur-standing-beside-an-S-Class portrait crops and read as repetitive. Media-only change — no text, links, Clienity embeds, forms, navigation, routing, Supabase code, or MyLimoBiz touched.

**Audit.** Inventoried every image/video under `public/assets/` (not just `official/`) — 62 image files, 16 video files. Most raw, unprocessed files were either duplicates of already-curated shots, single-vehicle-only, or (2 files: `chauffeur.jpg`, `interior.jpg`) confirmed AI-generated/stock via visual inspection (garbled unreadable signage text, generic staged composition) and excluded per the sitewide no-stock/no-AI rule — consistent with `legacyStretchLimo`'s existing "retained on disk only, do not use" status. Inspected 11 video files (all portrait/phone-shot, 360p–1080p) via Playwright frame extraction (no `ffmpeg` available in this environment) — content was airport/jet-transfer POV, driving B-roll, and valet-line footage; none improved on the chosen stills for this compact `aspect-[4/3]` card context, and portrait source video would need heavy horizontal cropping to fit. Used 3 photos, no video — permitted explicitly by the client's own brief ("if the available videos do not improve this section, use three excellent unique photos instead").

**Selections.**
- **Driver Application** — unchanged: `chauffeur-sclass-portrait.jpg` (already isolated to this placement, genuine solo chauffeur portrait, no car-forward or fleet imagery competing with it).
- **Company Partners** — new: a previously-unused 4-vehicle fleet lineup (Cadillac Escalade, Mercedes-Benz S-Class, BMW 7 Series, GMC Yukon Denali) at dusk with the Dallas skyline, found at `public/assets/IMG_8629.PNG`. Re-encoded to JPG via an in-browser canvas round-trip (Chromium, no re-crop) since no image-processing dependency is installed in this project — saved as `public/assets/official/fleet-lineup-dusk.jpg` (2651×1103, 440KB). No person in frame — deliberately reads as "fleet / transportation business" rather than repeating the other two cards' people-forward compositions.
- **Referral Partner** — reassigned: `hero-sclass-chauffeur.jpg` (previously the Company Partners image), a wider environmental shot — chauffeur + single vehicle in a downtown Dallas plaza — the closest authentic proxy available to "professional relationship in a business context" since no meeting/handshake/networking photography exists anywhere in the project's real media library, and none was fabricated to fill that gap.

**Object-position, computed not guessed.** `fleet-lineup-dusk.jpg` is 2651×1103 (~2.4:1) against the card's fixed 4:3 container — confirmed height-bound (full vehicle height always renders; only horizontal position has any cropping effect), so `objectPositionDesktop: "46% 50%"` / `objectPositionMobile: "44% 50%"` were chosen to keep the Mercedes/BMW pair — the two most recognizable silhouettes — fully in frame, verified via actual rendered screenshots at both breakpoints, not computed blindly. `hero-sclass-chauffeur.jpg` (2000×1333, 3:2) is mildly height-bound against the same container (~11% of width crops); re-tuned to `objectPositionDesktop: "38% 45%"` / `objectPositionMobile: "35% 40%"` to keep the chauffeur and the car's front end together in frame.

**Implementation.** Only `src/lib/image-map.ts` changed (the `joinTeamPartner`/`joinTeamReferral` entries) plus the new `fleet-lineup-dusk.jpg` asset file. `src/routes/join-our-team.tsx` needed zero changes — its `PATHWAYS` array already references `IMAGES.joinTeamPartner`/`IMAGES.joinTeamReferral` by key, so the media swap flows through automatically.

**QA.** `npx tsc --noEmit` and `npm run build` both clean. Screenshot sweep at 360×800, 375×812, 390×844, 393×852, 412×915, 430×932, 768×1024, 1024×768, 1366×768, 1440×900, 1920×1080: 0 horizontal overflow, 0 console/page errors at every size; visually confirmed all 3 cards read as distinct visual stories (chauffeur portrait / fleet lineup / chauffeur-and-car-in-plaza) with consistent card heights, no stretching, and the focal subject in frame at both mobile and desktop crops. Not deployed — stopped for client review of the visual result per explicit instruction.

---

## 1c-36. Join Our Team — media replacement round 2, stricter "never used anywhere" rule (2026-08-12)

§1c-35's media was rejected — the client tightened the rule: cards must use assets never used anywhere on the site, including in §1c-35's own pass. Re-audited the *entire* project's media, not just `public/assets/` this time:

- Confirmed `src/assets/lct/*.asset.json` and `src/assets/lct-real/*.asset.json` (an earlier cataloging-phase sidecar system referencing files like `chauffeur.jpg`, `interior.jpg`, `fleet-sedan.jpg` under conceptual labels like "business-handshake," "hotel-arrival") are **dead — no component imports from either directory** (confirmed via grep; the only `@/assets/lct*` import anywhere is the logo wordmark, unrelated). Their labels are also unreliable (`business-handshake.asset.json` points at a file that shows a chauffeur by a car, not a handshake) — consistent with this project's standing "never trust filenames/labels alone" discipline.
- Found and excluded 2 confirmed stock photos in `src/assets/` (`male-chauffeur-wearing-gloves-opening-car-door-for-2026-01-11-10-50-56-utc (1).jpg` and a matching "middle-aged-woman-exiting-car" file) — iStock/Shutterstock-pattern filenames, studio lighting, generic composition.
- Found 2 more near-duplicate frames (`DSC01240.jpg`, `DSC01431 - Copy.jpg`) — same chauffeur, suit, and downtown block as already-used `chauffeur-door-service-v2.jpg`/`hero-sclass-chauffeur.jpg`, almost certainly the same photoshoot session — excluded as effectively "already used" in spirit even though never technically rendered.
- Inspected 3 previously-unchecked Instagram video exports (`SnapInsta.to_*.mp4` in `src/assets/`) and the `IMG_9079–9094` short-clip series via Playwright frame extraction (no `ffmpeg` in this environment) — real content (a daylight fleet lineup, a highway convoy, a night cockpit POV) but none clearly improved on a still for this card format, and one carried a "LUXLANE TRANSPORTS" watermark baked into the video — avoided given the open, unresolved Luxlane/LCT Universal brand-name question flagged in §1c-34.
- 4 `.MOV` files (`IMG_8591`, `IMG_8600`, `IMG_8709`, `IMG_0299`) could not be inspected at all — Chromium's media engine timed out decoding them (likely HEVC-encoded iPhone video, unsupported without additional codecs in this environment) — reported as a genuine tooling limitation, not guessed at.
- **No AI image-generation tool is available in this environment** (checked via tool search) — surfaced this honestly rather than fabricate an image and claim it was generated. Given the client's own brief allowed AI generation only as a fallback if no real asset fit, and real assets *did* exist for all 3 concepts once the search widened, this was moot in the end — but it was surfaced to the client as a blocker before they supplied the additional direction below, rather than silently worked around.
- Client then identified 2 specific assets by description from the wider file set: "BMW + Cadillac near Globe Life Field" (matches `public/assets/official/events-fleet-stadium.jpg` — superseded by `events-stadium-v2.jpg` on `/events` in an earlier round and left unreferenced since) and "nighttime hotel image with Mercedes S-Class and SUV" (matches a raw, unprocessed `public/assets/IMG_9612.JPEG`, The Westin hotel porte-cochère at night).

**Final selections — all confirmed unused anywhere else in the project (verified via `grep -r` across `src/` for each filename before assigning):**
- **Driver Application** — `public/assets/official/sedan-virgin-hotels-single.jpg` (tight front three-quarter shot of the black S-Class, no person, previously untouched by any component) → copied to `join-driver.jpg`.
- **Company Partners** — `events-fleet-stadium.jpg` (BMW 7 Series + Cadillac Escalade, Texas Live!/Globe Life Field district) → copied to `join-company-partners.jpg`.
- **Referral Partner** — `IMG_9612.JPEG` (S-Class + SUV at The Westin at night) → re-encoded via an in-browser canvas round-trip (bakes in the EXIF rotation, resized 4000×6000 → ~1600px long edge: 3.6MB → 265KB) and saved as `join-referral-partner.jpg`.

`fleet-lineup-dusk.jpg` and `hero-sclass-chauffeur.jpg` (§1c-35's picks) are now unreferenced by Join Our Team again — left on disk per this project's standing convention of not deleting superseded real assets, documented here rather than silently dropped.

**Object-position tuning.** `join-driver.jpg` is an unusually narrow portrait source (880×2134, ~0.41:1) — width-bound against the 4:3 card container, so only vertical position has any effect. An initial estimate (`50% 62%`) over-cropped to a bare grille close-up with the hood ornament cut off; compared 5 vertical values side by side in an isolated test harness and settled on `50% 48%` desktop / `50% 50%` mobile, which keeps the Mercedes star, full grille, and the S-Class's signature headlight light-line together in frame. `join-company-partners.jpg` (2000×1333, height-bound, ~11% width crops) uses `48% 55%` / `46% 55%` to keep both vehicles and the "Globe Life Field" signage in frame. `join-referral-partner.jpg` (2:3 after rotation, width-bound, ~50% height crops) uses `50% 68%` / `50% 70%`, weighted down toward the vehicles rather than the ceiling lighting.

**QA.** `npx tsc --noEmit` and `npm run build` both clean. Re-ran the full 11-breakpoint sweep (360×800 through 1920×1080): 0 horizontal overflow, 0 console/page errors. Re-verified all 3 cards still open their correct, unmodified Clienity iframe URL after the media swap (`90V5AE3Bv0Zc4R3Fz5Gg` / `PgCYKPpNTV9o0Z7imXYl` / `zsxo0GHXuPQaCDAcB0vp`) — confirms this was a pure media change with zero functional impact. Not deployed, not pushed — stopped for client visual approval per explicit instruction.

**Domain migration checklist (code-side findings; external-dashboard items need the client's own access).**
- Code-side canonical/OG/JSON-LD URLs all derive from the single `CONTACT.siteUrl` constant (`src/lib/site-data.ts`) — a domain change is a one-line edit that cascades everywhere via `src/lib/seo.ts` and `src/routes/__root.tsx`.
- `public/robots.txt` (1 line) and `public/sitemap.xml` (13 `<loc>` entries) hardcode `https://lctuniversal.com` and do **not** derive from `CONTACT.siteUrl` — these need manual/scripted updating on a domain change, unlike the source-derived references.
- MyLimoBiz (`book.mylimobiz.com`) and all 4 Clienity forms are external, cross-origin services — each likely has its own allowed-origin/embed-domain configuration in its respective dashboard that needs updating to the new production domain; this cannot be verified or changed from this codebase.
- Tracking: current site fires Google Ads conversion tracking (`AW-17966850869`, `src/lib/tracking.ts`) and StatCounter (project `13222021`); no GA4 ID is configured (env var unset) and no GTM container or Meta Pixel exists anywhere in the codebase. The old site's actual tracking snippets could not be reliably read through available tooling (script tags are stripped by the fetch tool used) — whether `AW-17966850869` is the same ID already live on the old site, and whether the old site runs additional tags this new site is missing, needs manual verification (e.g. view-source on the current live site) before any domain cutover, to avoid either losing conversion history continuity or duplicating tags.

---

## 1c-37. Blog / Insights section (2026-08-12)

New `/blog` and `/blog/$slug` section, positioning LCT Universal as an authoritative Dallas–Fort Worth executive transportation resource. Static content, structured so a CMS could replace `src/lib/blog.ts` later without touching route components.

**Content.** 10 articles (one per requested content pillar — Airport Transportation, DFW Travel Guides, Executive Car Service, Corporate Transportation, Fleet & Vehicle Guides, Group Transportation, Event Transportation, Chauffeur Service Standards, Business Travel, Transportation Planning), each 600–900 words with H2 sections, a contextual CTA, and internal links to `/fleet`, `/rates`, `/service-areas`, `/corporate`, `/airport`, `/events`, `/contact`, `/book`. Every fact used (fleet capacities/prices, service-area cities, cancellation policy, dispatch hours) is drawn directly from `site-data.ts` — no invented statistics, testimonials, awards, or operational claims. 2 of the client's 12 suggested topics were intentionally consolidated into others to avoid near-duplicate articles (e.g. "Group Transportation Across DFW" overlapped the Sprinter and Mini-Coach-vs-Motor-Coach guides) — judged closer to the brief's own "no spammy SEO articles" instruction than padding to a round number.

**Media.** 10 distinct hero images, one per article, none repeated across posts. Two (`fleet-lineup-dusk.jpg`, `hero-sclass-chauffeur.jpg`) were orphaned real assets left over from the Join Our Team media-replacement rounds (§1c-35/§1c-36) — reused here rather than left unused. The rest are existing official/ photography reused from other pages (Sprinter, Coach, Events, Airport) or previously-untouched real photos (`airport-dfw-highway.jpg`, `sedan-front-grille.jpg`, `sedan-virgin-hotels.jpg`, `chauffeur-door-service.jpg`).

**Design.** `/blog`: centered "Insights From the Road" hero, an image-led featured-article block, then a 3-column card grid with category label + reading time. `/blog/$slug`: breadcrumb → category/title/excerpt/date/reading-time → full-bleed hero → ~42rem (672px) reading column → contextual CTA panel → related articles → next/previous nav. Reuses `SiteLayout`, `SectionHeading`, and the existing `revealLines`/`revealClipImage`/GSAP scroll-reveal system — no new design language introduced.

**SEO.** Each article: unique `pageMeta()` title/description/canonical/OG/Twitter, `Article` JSON-LD (headline, image, datePublished, dateModified, Organization author/publisher — no fabricated author bio), and `BreadcrumbList` JSON-LD. `/blog` itself: `Blog` JSON-LD + `BreadcrumbList`. All 11 URLs added to `sitemap.xml`. Navigation: "Insights" added to the header's Company dropdown and the footer's Explore column, matching Join Our Team's placement precedent (not a new top-level item, per explicit "don't overcrowd the header").

**Bug found and fixed.** Initial implementation used `blog.tsx` (index) + `blog.$slug.tsx` (article) as sibling files. TanStack Router's file-based routing treats a bare `blog.tsx` as an **implicit parent layout** for any `blog.*` sibling once both exist — since `blog.tsx`'s component never rendered an `<Outlet/>`, navigating to `/blog/$slug` silently rendered the index page's content instead of the article (200 status, zero console errors, completely silent — only caught via a real navigation test, not by the route existing/building successfully). Fixed by renaming to `blog.index.tsx`, which makes both routes register directly under the root route with no implicit nesting — confirmed via `routeTree.gen.ts` (`getParentRoute: () => rootRouteImport` for both) and a live re-test of the article route.

**QA.** `npx tsc --noEmit` and `npm run build` both clean; `blog.index` and `blog._slug` confirmed as separate code-split chunks. Verified via real scroll (not a naive full-page screenshot) that the index grid's GSAP `ScrollTrigger` reveals fire correctly — an initial static screenshot showed a large gap where the grid should be, the same known artifact documented earlier in this project (below-the-fold scroll-triggered content is invisible until actually scrolled), not a real bug.

---

## 1c-38. Sitewide mobile-first production audit (2026-08-12)

Full-site mobile UX/UI audit following the Blog launch, covering all 21 production routes (19 static + `/blog` + a sample article) — not just the homepage.

**Automated sweep.** 21 routes × 10 breakpoints (360×800, 390×844, 412×915, 430×932, 812×375 landscape, 768×1024 tablet, 1024×768 tablet-landscape, 1366×768, 1440×900, 1920×1080) = 210 combinations, checking horizontal overflow and console/page errors. **Result: 0 overflow, 0 errors across all 210.** This reflects the extensive mobile-first work already completed in prior rounds of this project (Signature Journeys hotfix, sitewide cinematic motion pass, mobile-first UI/UX production pass — see earlier §1c entries), not new work invented for this pass.

**Visual spot-check.** Screenshotted `/`, `/fleet`, `/rates`, `/service-areas`, `/join-our-team`, `/book`, `/blog`, `/contact` at 375×812 and 430×932, plus 3 routes at 844×390 landscape. One apparent issue was investigated and confirmed to be intentional, pre-existing design (the homepage H1's "O" in "One Fleet" is deliberately replaced by a small circular video badge — `sr-only` text confirms this, not a text-wrap bug). MyLimoBiz's booking widget on `/book` was confirmed to load, size correctly (317px within a 375px viewport, no overflow), and render its own themed header on mobile without any changes to its integration. No other real issues were found.

**Scope note.** Given the automated sweep's clean result and the extensive prior mobile work already on record, this pass functioned as a verification-and-targeted-fix audit rather than a from-scratch mobile redesign — consistent with the explicit instruction not to blindly redesign, and honestly reflects that most of the requested checklist (touch targets, hover-vs-touch, reduced-motion, spacing tokens, etc.) was already satisfied by the existing architecture rather than newly built in this pass.

---

## 1c-39. AI Concierge — architecture built, not yet live (2026-08-12)

A structured, page-aware AI chat concierge for the site — built end-to-end (knowledge base, secure backend, frontend UI) but **not functional yet**, because it requires an AI provider API key and a deployed Supabase Edge Function, neither of which exist in this project or environment. This gap is reported explicitly per instruction, not glossed over.

**Knowledge base.** `src/lib/concierge/knowledge.ts` (frontend reference copy) and `supabase/functions/ai-concierge/knowledge.ts` (the Deno-runtime copy the Edge Function actually uses) both build a compact text summary from real data only: all 7 fleet classes with exact capacities/prices (Sedan ≠ First Class Sedan, kept distinct per explicit instruction), the full 57-city service-area list, the cancellation policy, dispatch/management hours, and contact details. One fact — a 1-hour airport / 30-minute non-airport complimentary waiting-time policy — was supplied directly in this task's own instructions rather than pre-existing in `site-data.ts`; recorded as `AIRPORT_WAIT_POLICY` with a comment noting it as direct-client-confirmed information per the task's own source-of-truth hierarchy, not fabricated.

**Backend (`supabase/functions/ai-concierge/index.ts`, not deployed).** A Deno Edge Function that: validates and rate-limits each request (12/minute per IP, in-memory — a durable table-backed limit is the natural next step, noted as a follow-up rather than silently promised as done), builds a system prompt from the knowledge summary with explicit prompt-injection resistance instructions, calls either OpenAI or Gemini (provider-abstracted via an `AI_PROVIDER` env var, so switching providers later doesn't require a rewrite), and validates the model's JSON response server-side before returning it — the frontend never renders raw model output, and returned `href` values are checked against an allowlist of real routes. **No API key is hardcoded anywhere** — both providers read their key from `Deno.env.get(...)`, meaning from Supabase secrets, never from a `VITE_*` variable or frontend code.

**Frontend.** `ConciergeLauncher` (`src/components/concierge/concierge-launcher.tsx`) is a small, eagerly-rendered floating button; the actual chat UI (`concierge-panel.tsx`, Supabase client call included) is `React.lazy`-loaded only when opened, so it adds nothing to the initial page bundle — confirmed via the build output showing `concierge-panel` as its own ~6.5KB chunk. Positioned bottom-left (desktop: floating panel above the button; mobile: full-width bottom sheet) specifically to avoid the existing bottom-right WhatsApp/phone FAB stack and the full-width `MobileBookBar` — verified via `elementFromPoint` that the FABs remain visible and clickable on desktop with the panel open, and confirmed the panel's mobile full-screen coverage matches the site's own existing mobile-nav-overlay precedent (which already covers the FABs while open) rather than being a new inconsistency. 8 quick-action chips on first open (Book a Ride, Choose a Vehicle, Airport Transfer, Corporate Travel, Group Transportation, Service Areas, Join Our Team, Contact Dispatch) plus a page-aware opening suggestion (e.g. `/fleet` suggests vehicle-selection help, `/join-our-team` suggests pathway help). Conversation history lives in `sessionStorage` only (cleared on tab close, capped at 20 messages) — never `localStorage`, per explicit "do not persist indefinitely" instruction. Input is 16px+ to avoid iOS auto-zoom; Escape closes; focus returns to the launcher button on close.

**Analytics.** `track.aiConciergeOpen(pagePath)`, `track.aiActionBookClicked()`, `track.aiActionContactClicked()` added to `src/lib/tracking.ts` — high-level engagement events only, never message content or user input.

**Verified behavior (the one thing fully testable without a live key).** Since the Edge Function isn't deployed, every real send attempt fails at the network call — confirmed this resolves to the intended graceful fallback ("Concierge is temporarily unavailable. You can still book online instantly, or reach our dispatch team directly." with Book Now / Call Dispatch action buttons), not a broken spinner, raw error, or crash. This is the same "verify graceful degradation, not the live feature" pattern already established for the Join Our Team Supabase forms before that migration was applied.

**QA.** `npx tsc --noEmit` and `npm run build` both clean. Screenshot-verified at 360×800, 390×844, 412×915, 430×932, and 1440×900: 0 horizontal overflow, 0 console/page errors, quick-action send-and-fallback flow works at every size.

**What is NOT done — required before this is a working feature.** (1) No AI provider API key exists anywhere in this project — the client must supply one (OpenAI or Gemini) and set it via `supabase secrets set`. (2) The Edge Function is written but not deployed — no Supabase CLI authentication is available in this environment (the same standing blocker as the Join Our Team migration in §1c-33); deployment requires `supabase functions deploy ai-concierge` from an authenticated machine. (3) The in-memory rate limit resets on every cold start/deploy — acceptable for initial launch, not a durable production guarantee. (4) The 12 test cases from the brief (service-area questions, group-size questions, pricing questions, Join Our Team intents, the prompt-injection attempt, etc.) are addressed in the system prompt's design and the server-side response validation, but could not be exercised against a real model response, since none is currently reachable — this must be re-verified once a key and deployment exist.

---

## 1c-40. Mobile UX polish pass + MyLimoBiz Client Login widget (2026-08-12)

Two client-requested workstreams landed together: a targeted mobile UX audit (fix real problems only, no redesign) and integration of MyLimoBiz's official Login Widget. A third request — re-verify the Service Areas 57-city list — required **no code changes**: the 3-group/22+17+18 list, Lake Worth appearing exactly once, and all JSON-LD/footer/sitemap references were already correct from §1c-32; re-checked programmatically (57 unique cities, 0 duplicates) rather than re-committed under a misleading message.

**MyLimoBiz Client Login widget.** Added the client-supplied embed (`data-ores-widget="login"`, `widget-loader.js`) to the desktop header, mobile nav, and footer. `MyLimoBizLoginButton` (`src/components/booking/mylimobiz-login-button.tsx`) owns the anchor via plain DOM APIs (`document.createElement`, manual `appendChild`) inside a React-ref-owned `display:contents` container — required because `widget-loader.js` does exactly **one** synchronous DOM scan the instant it finishes loading, with no `MutationObserver` and no re-scan; any anchor not present in the DOM at that moment, or any anchor React later reconciles and silently reverts, never converts into a working iframe. `ensureMyLimoBizScript()` (exported from the existing `mylimobiz-widget.tsx`) guarantees the loader script is requested exactly once regardless of how many login instances mount.

First implementation embedded the button directly inline in the header/footer — screenshots caught a severe regression: MyLimoBiz's own `iframeResizer` sizes the converted iframe to its actual login-form content (observed ~326–780px, ignoring all CSS on the original anchor since the anchor itself is destroyed and replaced), which blew out the header row (phone wrapped 4 lines, Book Now pushed off-screen) and overflowed the footer's grid column into its neighbor. Fixed by building `MyLimoBizLoginPopover` (`mylimobiz-login-popover.tsx`): a small trigger button + an `absolute`-positioned panel, removed from normal layout flow so no matter how large the iframe renders, it cannot push surrounding chrome. The panel is **always mounted**, visibility toggled via the `hidden` attribute rather than `{open && (...)}` — the same one-time-DOM-scan constraint applies to the popover's own anchor, caught and fixed before shipping. The mobile nav's panel content had the identical bug (was conditionally mounted with the menu's open state) and got the same fix. `data-redirect-url` is set to `window.location.href` so login returns users to whichever page they started from.

Verified via Playwright against the production build, not just dev: desktop header/footer open/closed states at 1440×900 (0 overflow either state, iframe renders inside the panel); mobile at 360×800/390×844/430×932 with the hamburger menu open (0 overflow, dialog opens, iframe renders and is visible, exactly 3 popover instances on the page — header + mobile + footer, no duplicates/leaks). Regression-tested the existing `/book` MyLimoBiz booking widget under two scenarios (navigating home-then-to-`/book`, and landing cold on `/book`) to confirm the login button's earlier script-load trigger doesn't interfere — both still produce a working 782px booking iframe.

**Mobile UX fixes (real, screenshot-confirmed issues only):**
- **Floating-element priority/overlap.** `FloatingActions` (WhatsApp/phone), `MobileBookBar`, and `ConciergeLauncher` now hide while the mobile nav is open (`src/lib/mobile-menu-state.ts`, a tiny `useSyncExternalStore`-based external store published from `site-nav.tsx`) — confirmed via `elementFromPoint` that these FABs previously stayed clickable directly on top of the open menu's own content.
- **AI Concierge covering hero content.** Screenshot showed the bottom-left Concierge launcher overlapping the start of the phone number in the homepage hero's bottom info row. That row's content (phone number, "Request a Quote") duplicates what the FABs and header already provide, so it's now hidden below the `sm` breakpoint (`cinematic-hero.tsx`) instead of squeezed into an ever-narrower gap between the concierge launcher (bottom-left) and WhatsApp/phone FABs (bottom-right); unchanged at `sm` and above.
- **Excessive empty space on `/services` mobile.** Each `.service-chapter` block used `min-h-[62vh] flex flex-col justify-center` unconditionally — needed on desktop so the sticky cross-fade image has room to trigger per chapter, but on mobile (no sticky image; a separate image grid renders below all chapters) it centered a few lines of text in a nearly-empty 62vh box, six times in a row, reading as a wall of dead black space. Scoped the min-height/centering to `lg:` only (`src/routes/services.tsx`) — mobile now flows naturally with the section's existing `py-10` padding. Screenshot-confirmed: the gap between the intro paragraph and "Airport Transportation" shrank from ~300px of pure dead space to normal section spacing.
- **Mobile nav scroll lock was not actually locking scroll.** The existing lock only set `document.body.style.overflow = "hidden"`; `document.scrollingElement` is `<html>` in standard mode, which was left scrollable. Worse, this site's Lenis smooth-scroll (`smooth-scroll.tsx`) drives scroll itself via its own rAF loop independent of CSS `overflow` entirely, so even locking both `html` and `body` left the page behind the menu scrollable on wheel/touch input — confirmed via a Playwright wheel-scroll test (`scrollY` moved from 400→811/829 while the menu was "open" both before and after the CSS-only fix). Real fix: added `src/lib/lenis-instance.ts`, a tiny module holding the live Lenis instance so any component can call its own `stop()`/`start()`; `site-nav.tsx` now calls `stopLenis()`/`startLenis()` alongside the existing (now also html-inclusive) CSS lock. Re-verified: `scrollY` stays fixed while the menu is open and is restored exactly on close. Also confirmed the element "behind" the open menu at a sample point is the menu's own "Company" accordion header, not leaked page content.
- **Fleet gallery.** The 7 vehicle chapters on `/fleet` are one photo per vehicle class (not a multi-photo gallery), each driven by an `IntersectionObserver`-linked sticky conversion bar and its own individual GSAP `ScrollTrigger` reveal — converting them into a literal horizontal-scroll carousel would have broken both existing, working systems, which the brief's own "keep all existing functionality working" constraint rules out. Added a purely additive `MobileFleetShowcase` (`fleet.tsx`): a `lg:hidden` native CSS scroll-snap filmstrip (same pattern already used by `events.tsx`'s gallery) linking to each chapter's now-added `id="fleet-<vehicle>"` anchor, giving mobile users a swipeable overview without touching the chapter architecture.
- Typography, tap targets, and lazy-loading were audited and found already solid from prior rounds (established `clamp()` heading scale, consistent `loading="lazy"` on all below-fold images, `fetchPriority="high"` on the hero LCP image) — no changes made where none were needed.

**QA.** `npx tsc --noEmit` and `npm run build` clean throughout (rebuilt 3 times as fixes landed). Full sweep: 6 breakpoints (360×800, 375×812, 390×844, 393×852, 412×915, 430×932) × 15 routes = 90 checks against the production build — **0 horizontal overflow, 0 console/page errors** on the final build.

Files changed: `src/lib/mobile-menu-state.ts` (new), `src/lib/lenis-instance.ts` (new), `src/components/booking/mylimobiz-login-button.tsx` (new), `src/components/booking/mylimobiz-login-popover.tsx` (new), `src/components/booking/mylimobiz-widget.tsx` (exported `ensureMyLimoBizScript`), `src/components/site-nav.tsx`, `src/components/site-footer.tsx`, `src/components/floating-actions.tsx`, `src/components/mobile-book-bar.tsx`, `src/components/concierge/concierge-launcher.tsx`, `src/components/luxury/smooth-scroll.tsx`, `src/components/home/cinematic-hero.tsx`, `src/routes/services.tsx`, `src/routes/fleet.tsx`.

---

## 1c-41. Services mobile gallery fix, dead form removal, integrations re-verified, AI Concierge still blocked (2026-08-12)

Follow-up production pass after §1c-40, prompted by a client report that a mobile screenshot still showed text and images reading as disconnected sections.

**Mobile gallery fix — the real culprit.** A full-page mobile screenshot sweep across `/join-our-team`, `/services`, `/fleet`, `/corporate`, `/airport`, `/events`, `/about` found the pattern only on `/services`: all 6 chapter titles/descriptions rendered as one stacked text block, followed by a completely separate `grid gap-4 lg:hidden` of all 6 chapter images stacked below — exactly "text above, images stacked far below." (`/join-our-team`'s pathway cards, and every other page checked, already pair image directly with its own text — no change needed there.) Fixed by moving each chapter's image inside its own `.service-chapter` block (`src/routes/services.tsx`), mobile-only (`lg:hidden`), directly above that chapter's own title — a "cinematic card" per service, one image each, none duplicated (the desktop sticky cross-fade column still owns the same 6 images at `lg:` and up, unchanged). Verified via DOM query: 6 chapter titles, 6 images, one-to-one. Full-page screenshot confirms each service now reads as a single connected image+title+description+CTA unit.

**Unused local form components removed.** `driver-application-form.tsx`, `company-partner-application-form.tsx`, `referral-partner-application-form.tsx`, and their shared `form-fields.tsx`/`submit-bar.tsx` helpers (all in `src/components/applications/`) were confirmed — via a repo-wide import search — to be imported nowhere; `/join-our-team` has used the live Clienity embeds exclusively since §1c-34, and `LeadForm` (used by `/corporate` and others) never touched these files. Deleted all 5 rather than leaving them as disconnected dead code, per this round's explicit instruction. Their Supabase migration/tables are untouched (not live, out of scope for a UI-only cleanup — see §1c-33/§1c-34).

**Form/widget integration re-audit (Playwright, not assumed).** All 3 live Clienity forms (`Driver Application`, `Company Partners`, `Referral Partner` on `/join-our-team`) checked at mobile (390×844) and desktop (1440×900): exactly one Clienity iframe renders per pathway, correct URL, correct measured size, 0 overflow, switching pathways doesn't leave a stale second iframe mounted (`key={active}` on `ClienityEmbed` forces a clean remount). `/corporate` confirmed to render exactly one form (the Supabase-backed `LeadForm`, 0 iframes) — this is intentional, not a bug: the client's Corporate Clienity form was never finished on Clienity's side (§1c-34), so there is no real embed URL to wire up, and fabricating one was out of the question. `/book`'s MyLimoBiz booking widget re-confirmed working (782px-wide iframe, real content height resolving to ~1216px once `iframeResizer` settles) under both cold-landing and navigate-from-home scenarios. The Client Login popover (header/mobile/footer, added in §1c-40) re-confirmed working post-rebuild.

**Observation, not a regression — recorded for awareness.** Because the Client Login popover's trigger anchors are now always-mounted globally (header/footer/every page, per §1c-40), and the booking widget's own hidden anchor (`MyLimoBizWidgetHost` in `__root.tsx`) is *also* always-mounted globally (parked off-screen, previously inert everywhere except `/book`), the two now share one script-load guard (`ensureScriptRequested()` in `mylimobiz-widget.tsx`). Once anything on a page triggers that shared script, `widget-loader.js`'s one-time DOM scan converts *every* present anchor — including the off-screen booking anchor — meaning the (hidden, zero-size) booking iframe now loads on every page, not only `/book`. Confirmed via DOM inspection, not just inferred. Nothing is visibly broken and no console errors result, but it is extra hidden network/CPU cost sitewide that didn't exist before the Client Login widget was added. Left as-is this round — the task's explicit ask was to verify neither system is broken (confirmed) — flagged here as a real, measured trade-off rather than silently accepted, and as a candidate for a future pass if proactive booking-widget preloading sitewide turns out not to be worth the cost.

**AI Concierge — still not live, same root blocker as §1c-39.** This environment has no Supabase CLI (`supabase` resolves to "command not found"; `npx supabase@latest` times out fetching it) and `.env` contains only the public `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_PROJECT_ID` (and their `VITE_`-prefixed duplicates) — no `SUPABASE_ACCESS_TOKEN`, no service-role key, and no `OPENAI_API_KEY`/`GEMINI_API_KEY` anywhere in the repo. Both are required before the Edge Function (`supabase/functions/ai-concierge/index.ts`, reads `AI_PROVIDER` + `OPENAI_API_KEY` or `GEMINI_API_KEY` via `Deno.env.get`) can be deployed and configured. Nothing was fabricated to fake a "live" status — the frontend's existing graceful-degradation fallback ("Concierge is temporarily unavailable...") is still correct, working behavior given the function isn't deployed, not a bug to paper over.

**QA.** `npx tsc --noEmit` and `npm run build` clean. Full sweep: 6 breakpoints (360×800, 375×812, 390×844, 393×852, 412×915, 430×932) × 15 routes = 90 checks against the production build — 0 horizontal overflow, 0 console errors.

Files changed: `src/routes/services.tsx`, `src/routes/join-our-team.tsx` (comment only). Files deleted: `src/components/applications/driver-application-form.tsx`, `company-partner-application-form.tsx`, `referral-partner-application-form.tsx`, `form-fields.tsx`, `submit-bar.tsx`.

---

## 1c-42. AI Concierge migrated to a Netlify Function — Gemini only, Supabase dependency removed (2026-08-12)

The site deploys on Netlify, not Supabase Edge Functions, so the AI Concierge (built in §1c-39, never deployed — no Supabase CLI/access token in this environment, see §1c-41) is rearchitected onto a Netlify Function instead of waiting indefinitely on Supabase deploy access. This only touches the Concierge's own backend call — every other Supabase usage on the site (LeadForm submissions via `src/lib/forms/submissions.client.ts`, application file uploads via `src/lib/applications/upload.ts`, etc.) is untouched and still live.

**New backend.** `netlify/functions/ai-concierge.js` — a Netlify V2 function (`export default async (req, context) => ...`, standard Web `Request`/`Response`, same shape as the retired Deno-based Edge Function, which is why the request-handling logic ported over almost unchanged: message-length validation, an 8-turn history cap, in-memory per-IP rate limiting at 12/minute, the same system prompt with the same anti-prompt-injection instructions and the same never-invent-pricing/availability/bookings rules, and the same server-side JSON-shape + href-allowlist validation on the model's response before it's ever returned to the browser). The only real change is the provider call itself: OpenAI support was dropped per explicit "Gemini only" instruction, and the Gemini `fetch` call now reads `process.env.GEMINI_API_KEY` (Node runtime) instead of `Deno.env.get(...)`. Default invocation path for a function named `ai-concierge.js` is `/.netlify/functions/ai-concierge` — no custom routing config needed, and `netlify.toml` now declares `[functions] directory = "netlify/functions"` so Netlify's build picks it up.

**Knowledge base.** `netlify/functions/ai-concierge-knowledge.js` is a plain-JS, dependency-free copy of the verified fleet/rates/service-area/policy facts (same manual-sync convention the retired Supabase version already used, documented there and carried forward here — Netlify Functions bundle independently from the Vite frontend, so reaching across into TypeScript `src/lib/site-data.ts` was judged more fragile than one clearly-labeled duplicate file). The two now-redundant knowledge copies (`supabase/functions/ai-concierge/` entirely, and `src/lib/concierge/knowledge.ts` — confirmed via repo-wide import search to never have been imported by the frontend UI itself) were deleted rather than left as dead weight.

**Frontend.** `src/lib/concierge/client.ts` no longer imports the Supabase client — `sendConciergeMessage` now does a plain same-origin `fetch("/.netlify/functions/ai-concierge", { method: "POST", ... })`. No CORS handling needed (same-origin) and no change to the existing CSP (`connect-src 'self'` in `netlify.toml` already covers it). `ConciergePanel` (chat UI, loading state, quick actions, session-only history, error handling) required zero changes — it never touched Supabase directly, only this one client function.

**Secrets.** No key is hardcoded anywhere. `GEMINI_API_KEY` is read exclusively via `process.env` inside the Netlify Function (server-side, never shipped to the browser bundle) and must be set in the Netlify dashboard (Site configuration → Environment variables) — the task's own instruction, and the only place it should ever live. Added `.env.example` documenting the variable name with no value. Also hardened `.gitignore` to exclude `.env`/`.env.local`/`.env.*.local` going forward — this repo's pre-existing `.env` (Supabase's public anon key/URL only, not a high-severity secret) was already tracked by git before this round and was left as-is rather than untracked unilaterally, but no new secret-bearing file should get committed from here on.

**Testing (honest about what could and couldn't be verified without a real key).** Wrote a local Node test harness that imports the function's handler directly and drives it with real `Request` objects (Node 22's native `Request`/`Response`/`fetch` match Netlify's runtime closely enough for this): OPTIONS → 204, GET → 405, malformed JSON → 400, empty/over-length message → 400, 13th request in a rolling minute from one IP → 429, and — with no `GEMINI_API_KEY` set — a full request correctly falls through to the graceful-fallback JSON shape at status 200 rather than crashing. Separately, with a deliberately fake key, the function's real `fetch` call was confirmed to reach `generativelanguage.googleapis.com` and get back a genuine HTTP 400 from Google (an invalid-key rejection, not a DNS/connection failure) — proving the request shape (model, `systemInstruction`, `contents`, `generationConfig`) is well-formed enough to reach the real API. What could **not** be verified: an actual successful Gemini reply, since no real API key exists in this environment and none was supplied in chat (by design — it belongs only in Netlify's dashboard). This must be exercised for real once a key is set and the site is deployed.

**QA.** `npx tsc --noEmit` and `npm run build` clean. Full sweep: 6 breakpoints × 15 routes — 0 horizontal overflow, 0 console errors. Confirmed untouched and still working: Clienity forms (Driver/Company Partner/Referral Partner), the MyLimoBiz booking widget on `/book`, and the MyLimoBiz Client Login popover.

Files added: `netlify/functions/ai-concierge.js`, `netlify/functions/ai-concierge-knowledge.js`, `.env.example`. Files changed: `src/lib/concierge/client.ts`, `netlify.toml`, `.gitignore`. Files deleted: `supabase/functions/ai-concierge/` (index.ts + knowledge.ts), `src/lib/concierge/knowledge.ts`.

**Follow-up (2026-08-14) — Gemini model availability, twice.** Once a real `GEMINI_API_KEY` was set in Netlify, the function's original default model (`gemini-1.5-flash`) returned 404 (retired); switching to `gemini-2.5-flash` also 404'd ("no longer available to new users") — both genuine live-key errors, not local guesses. Fixed in two steps: (1) switched the default to `gemini-2.5-flash` with better error logging (status + response body, never the request URL or key); (2) since model availability had already broken twice, made it resilient instead of guessing a third static name — `GEMINI_MODEL = "gemini-2.0-flash"` is now a plain top-of-file constant with an automatic one-time fallback to `GEMINI_MODEL_FALLBACK = "gemini-2.0-flash-lite"` if the primary model itself 404s (any other error, e.g. an invalid key, does not trigger the fallback, since switching models wouldn't fix that). Verified against the real Gemini endpoint with a deliberately invalid key: `gemini-2.0-flash` returns `API_KEY_INVALID` (400), not 404 — confirming the model itself is currently valid. Commits: `e0e84d3` ("Fix Gemini model endpoint for AI Concierge"), `68d8c37` ("Update Gemini model for AI Concierge compatibility").

---

## 1c-43. Google Ads tracking + conversion events (2026-08-14)

Google Ads tag switched to the client's real account (`AW-18237817494`, replacing the prior `AW-17966850869`) and conversion/engagement events added — built entirely on top of the tracking architecture already in place (`src/lib/tracking.ts` + `src/components/analytics.tsx`, mounted once in `__root.tsx`), not a new parallel system. That architecture already loaded gtag.js exactly once sitewide and already deduplicated script injection (`loadScriptOnce` checks for an existing `<script src>` before appending) — confirmed via Playwright that only one `googletagmanager.com/gtag/js` script exists in the DOM and `gtag('js', ...)` / `gtag('config', 'AW-18237817494')` fire exactly once per page load, matching the client-supplied snippet precisely.

**Contact / quote-request submissions (`generate_lead`).** Already correctly wired before this task — `LeadForm`'s `onSubmit` (`src/components/lead-form.tsx`) calls `track.leadSubmitSuccess(formType)` only inside `if (res.ok)`, i.e. only after `submitFormClient` gets a real backend-confirmed success, never on button click or validation pass alone. Every form on the site (Contact, Corporate, Service Inquiry, etc.) shares this one component, so both "contact form" and "quote request" requirements are satisfied by the same verified code path. Only the event payload changed: added `form_name` (alongside the existing `form_type`, kept for backward compatibility) and `page_location`, per the requested clean event shape.

**Booking conversion (`conversion`) — a verified signal, not a click.** The brief explicitly required NOT firing on button click alone, and this project's MyLimoBiz booking widget is a cross-origin iframe with no confirmation webhook — so "verify completion" needed a real mechanism, not an assumption. Fetched and read MyLimoBiz's actual `widget-loader.js` from `book.mylimobiz.com` (not guessed) and found the exact mechanism it uses to leave the widget after a completed reservation: `window.onmessage` triggers `window.location = event.data` whenever a `postMessage` arrives whose data contains the string `"widget-booking-data"`. `Analytics` now listens for that same signal via its own `addEventListener("message", ...)` (coexists safely with MyLimoBiz's own `onmessage =` assignment — different registration mechanisms, both receive the same event), checks `event.origin` includes `mylimobiz.com` before trusting it, fires once per page load, and calls `track.bookingComplete()` — a `conversion` event with `transport_type: "beacon"` to maximize delivery odds given a real navigation follows almost immediately. Verified: a spoofed same-origin message (not from `mylimobiz.com`) is correctly ignored (confirmed no event fires); the real cross-origin case cannot be fabricated from JS (browsers don't allow spoofing `event.origin`, which is the security guarantee working correctly) and so could not be exercised end-to-end without a real completed booking — this is disclosed here rather than glossed over, and should be confirmed via Google Ads' conversion diagnostics after a real test reservation once deployed.

**Phone clicks (`phone_call`, renamed from `phone_click`).** The existing sitewide delegated click listener already caught every `tel:` link with zero per-button instrumentation; only the event name and label derivation changed to match the brief. Labels: `header_phone` (both desktop and mobile header phone links, tagged via a new `data-track-label` attribute — 2 small additive attributes, zero visual change), `floating_call_button` (the FAB), and "Call Dispatch" (its 7+ instances sitewide needed no per-file tagging — the click handler's label fallback chain (`data-track-label` → `aria-label` → visible text → pathname) already resolves to the clean literal button text when no explicit override exists).

**WhatsApp clicks (`whatsapp_click`).** Event name was already correct; added the same clean `event_category`/`event_label`/`page_location` shape and a `data-track-label="floating_whatsapp_button"` tag on the FAB. The existing `href.includes("wa.me")` check in the delegated listener already covers "any WhatsApp CTA" sitewide, not just the FAB.

**CTA buttons (`cta_click`, new).** Reuses the sitewide `data-cursor="book"` marker already applied to every "Book Now"/reservation-intent button (17 files, an existing convention, not new markup) as the primary detector, supplemented by a small, deliberately narrow text-pattern match (`^reserve`, `^request a? quote`, `^get started`) for lead-gen CTAs that route to `/contact` rather than `/book` and so aren't `data-cursor="book"`-tagged. This fires alongside — not instead of — the pre-existing `book_cta_click` event on booking CTAs specifically; both are kept since they're differently-named, differently-purposed signals and removing the older one wasn't asked for and risks breaking anything already built on it.

**Verified, not assumed (Playwright against the production build).** Exactly one `gtag/js` script tag, correct new ID; `phone_call`/`whatsapp_click`/`cta_click`/`book_cta_click` all fire with the exact expected names and params on real dispatched clicks (not simulated no-ops — the "Book Now" click actually navigated the SPA to `/book`, and `page_view`/`reach_booking_page` fired correctly afterward too, confirming no regression to existing route tracking); the `conversion` event's payload shape confirmed correct via direct call; the postMessage listener's origin check confirmed to reject a spoofed message. Full sitewide sweep: 6 breakpoints × 15 routes, 0 overflow, 0 console errors (only the pre-existing, benign "Blocked autofocusing" notices from the always-mounted MyLimoBiz login iframes). Clienity forms, the MyLimoBiz booking widget, and the Client Login popover re-verified unaffected. `npx tsc --noEmit` and `npm run build` clean.

Files changed: `src/lib/tracking.ts`, `src/components/analytics.tsx`, `src/components/site-nav.tsx`, `src/components/floating-actions.tsx`.

---

## 1c-44. Legal pages premium redesign + MyLimoBiz login widget fixes (2026-08-14)

Two workstreams: a visual/structural redesign of the 4 legal pages, and real, confirmed bugs found in the MyLimoBiz Client Login widget via direct testing (screenshots, not assumptions).

**Legal pages — root cause found, not just "make it prettier".** All 4 pages (`/privacy`, `/terms`, `/cancellation-policy`, `/zero-tolerance`) used `prose prose-invert prose-headings:font-display ...` classes — but `@tailwindcss/typography` was never installed in this project (confirmed: absent from `package.json` and `node_modules/@tailwindcss/`). Those classes were completely inert, so every heading and paragraph fell back to unstyled browser defaults — the actual cause of the cramped, no-hierarchy look, not a design-taste issue. Built a shared `src/components/legal/legal-article.tsx` (`LegalArticle`/`LegalSectionSpec`) using the site's own existing tokens (`.eyebrow`, `font-display`, `.luxe-card`) instead of adding a new dependency: numbered sections with real spacing and hairline dividers, a sticky table-of-contents sidebar on desktop, and a collapsible `<details>` TOC accordion on mobile (matching the site's existing mobile-nav/FAQ accordion convention rather than inventing a new interaction pattern). A distinct "Questions About This Policy" contact block closes each page; `zero-tolerance.tsx`'s opening City-of-Dallas ordinance statement got its own `intro` slot (not the contact block — an early draft mistakenly filed it there, caught before shipping, since burying a prominent opening compliance statement in a "contact us" box would have changed its emphasis even with the words unchanged).

Every paragraph, list item, and link was moved into the new structure by direct copy, not retyped, specifically to satisfy "keep legal meaning unchanged." No duplicate content was found in any of the 4 pages' source or rendered output (checked both) — the "remove repeated Privacy Policy content if duplicated" instruction didn't correspond to an actual bug here. **The current Privacy Policy content has no SMS/TCPA consent language at all**, and no "provided updated privacy policy content" was actually included in the request that asked to "use it exactly" — nothing was fabricated to fill that gap (inventing SMS-consent legal language carries real compliance risk if wrong), so `/privacy` still runs the existing, previously-verified copy. This is flagged here and in the final report as a real content gap requiring the actual text from the client, not silently glossed over.

One bug surfaced by the redesign itself: the mobile TOC accordion showed "On This Page" twice — once in its own `<summary>`, once again from `LegalToc`'s internal label. Fixed with a `showLabel` prop, defaulted off for the mobile instance. Caught via direct visual testing, not assumed away.

**MyLimoBiz Client Login — real bugs found via testing, one non-bug closed out.**
- **Desktop "doesn't appear fully" did not reproduce.** Tested a cold click at 350ms after page load (before typical script-load time) and at a short 1366×768 laptop viewport — the popover opened correctly and fully visible in both cases. No code change here; documented as tested-and-not-reproduced rather than silently ignored.
- **Mobile — the real, confirmed bug.** The login popover's trigger sits near the bottom of the (already tall) mobile nav panel, so the panel opened positioned mostly *below* the visible viewport — reachable by manually scrolling the nav's own internal `overflow-y-auto` container (confirmed via a direct scroll test: the panel became fully visible after scrolling), but nothing on screen hinted a user needed to. Fixed in `mylimobiz-login-popover.tsx`: `panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })` fires when the popover opens. Re-verified: the full email/password form is now visible immediately on mobile without any manual scrolling.
- **Sitewide login-state reflection — implemented honestly, not oversold.** MyLimoBiz's login widget is a cross-origin iframe; this site has no access to its session cookie and no webhook, so a true live "is this visitor currently logged in" state is not something the frontend can know — this is a hard technical ceiling, not a shortcut. What is real and verifiable: MyLimoBiz's own `widget-loader.js` (fetched and read directly, not guessed) does `window.location = event.data` — a real top-level navigation to their dashboard — whenever it receives a `postMessage` containing `"la-login-widget-dashboard"`, which only happens after a successful login. `Analytics` (already listening for the equivalent booking-completion signal, see §1c-43) now also watches for this one, origin-checked, and calls `setMyLimoBizAuthenticated(true)` (new `src/lib/mylimobiz-auth-state.ts`, `localStorage`-backed, `useSyncExternalStore`-based, same pattern as `mobile-menu-state.ts`). `MyLimoBizLoginPopover` reads this and swaps its label from "Client Login" to "My Account" — since it's the one shared component behind the header, mobile nav, and footer instances, this propagates everywhere at once, satisfying "not restricted to /book" honestly rather than by faking a session check. Clicking it always opens the same real MyLimoBiz widget regardless of label, since their actual session validity can't be verified from here. Verified via a `localStorage` simulation + reload: header and footer both correctly switched to "My Account".

**QA.** `npx tsc --noEmit` and `npm run build` clean. Full sweep: 8 breakpoints (360–430px phones, 768×1024 tablet, 1440×900 desktop) × 19 routes = 152 checks — 0 overflow, 0 console errors. Clienity forms (Driver/Company Partner/Referral Partner), the Corporate `LeadForm`, the MyLimoBiz booking widget, and the Client Login popover all re-verified working with no regressions.

Files added: `src/components/legal/legal-article.tsx`, `src/lib/mylimobiz-auth-state.ts`. Files changed: `src/routes/privacy.tsx`, `src/routes/terms.tsx`, `src/routes/cancellation-policy.tsx`, `src/routes/zero-tolerance.tsx`, `src/components/booking/mylimobiz-login-popover.tsx`, `src/components/analytics.tsx`.

---

## 1c-45. Final production verification pass — clean, one external finding (2026-08-14)

Full re-verification of everything built across §1c-38 through §1c-44 (mobile UX, MyLimoBiz login, AI Concierge, Google Ads tracking, legal pages) — a review-and-confirm pass, not new feature work, per explicit "do not make unnecessary changes, only fix critical issues" instruction. No source files were changed; every check below is either a rerun of a previously-built verification script or a fresh live-endpoint check.

**Clean:** `npx tsc --noEmit` and `npm run build` (0 errors either). Full sweep — 8 breakpoints (360×800 through 1440×900, including tablet) × 19 routes (every route this task listed plus every other real route) = 152 checks, 0 horizontal overflow, 0 console errors. Clienity forms (Driver/Company Partner/Referral Partner) — exactly one iframe each, no duplicates, correct URLs. Corporate still correctly uses the Supabase `LeadForm` (Clienity's Corporate form remains unfinished on their side — unchanged, not a regression). MyLimoBiz booking widget re-confirmed with real content sizing (782px wide, real height once `iframeResizer` settles) under both cold-landing and navigate-from-home. Client Login popover confirmed on desktop (header + footer, open/closed, 0 overflow) and mobile at 360/390/430 (dialog opens, iframe visible, 0 overflow, exactly 3 popover instances sitewide). Google tag: exactly one `gtag/js` script tag, correct `AW-18237817494` config, `phone_call`/`whatsapp_click`/`book_cta_click`/`cta_click` all confirmed firing with correct params on real dispatched clicks. Zero Supabase references remain anywhere under `src/lib/concierge/` or the Netlify function.

**One real finding — not a code bug.** Hit the live production AI Concierge endpoint directly (`https://lctuniversal.com/.netlify/functions/ai-concierge`, real POST requests, not a local mock): the function **is** deployed and reachable (Netlify's own headers confirm a fresh, non-cached function invocation — `Cache-Status: fwd=miss`/`fwd=bypass` on both edge layers), and returns a well-formed 200 JSON response — but that response is the graceful-fallback message ("Concierge is temporarily unavailable...") rather than a real Gemini-generated reply, across two different test messages. Since §1c-42/§1c-43's prior live-endpoint tests already proved the request construction itself is correct (a deliberately invalid key produced Google's own `API_KEY_INVALID` response, not a malformed-request error), this points to either `GEMINI_API_KEY` not being set (or having been unset/changed) in Netlify's environment, or Gemini itself erroring for another reason the function's own `console.error` logging (status + response body, added in §1c-42) would show in Netlify's function logs — which aren't visible from this environment. No code change was made in response to this, since the code was already re-verified correct; it's flagged here as an action item for whoever has Netlify dashboard access to check the function's logs and confirm the key is actually set.

**Production readiness:** every part of the site under this project's own control (code, build, routes, forms, tracking, legal pages, login widget) is clean and verified. The one open item is external — the Gemini key/logs check above — and doesn't block deployment of anything else.

Files changed: none.

---

## 1c-20. Trust badge premium placement + transparent logo derivatives (2026-08-08)

Follow-up to §1c-19: the client supplied the real BBB/GNET/NLA files (as `logo1.png`/`logo2.png`/`logo3.png` — found in `dist/assets/`, the build-output folder, which gets wiped on every `npm run build`; copied to a safe location immediately before doing anything else). Mapped by direct visual inspection, not filename: logo1 → GNET, logo2 → NLA, logo3 → BBB.

Raw pixel inspection (not visual guessing) found: `badge-gnet.png` already had a genuinely transparent background (alpha 0 at every corner sample) — used as-is. `badge-nla.png` had no alpha channel at all (fully opaque white canvas) and `badge-bbb.png` had opaque white in its corners despite having an alpha channel — both needed real cleanup. A first attempt used a global distance-from-white alpha threshold; visual inspection on a dark composite showed it incorrectly eroding NLA's own light anti-aliased ring strokes (they're about as close to white, in raw RGB distance, as the actual background). Replaced with a flood-fill approach seeded from the image border — only background pixels *reachable* from the outer edge through a connected near-white path get erased, so an isolated light pixel inside the design (or BBB's intentional white torch/lettering panel, enclosed by its own border) is never touched. Verified via dark-background composite screenshots before finalizing. Originals kept on disk untouched; derivatives are `badge-nla-transparent.png` / `badge-bbb-transparent.png`.

Removed the cream/white panel wrapper from `TrustBadges` entirely per explicit follow-up instruction (logos now sit directly on the dark background); added a per-badge max-width cap on BBB (wider native aspect ratio) so it doesn't visually dominate GNET/NLA at a shared height. Built `TrustStrip`, a dedicated homepage-only marquee component: pure CSS animation (`@keyframes trustMarquee` + `.trust-marquee-track` in `styles.css`, following this file's existing keyframe/utility convention — no animation library), a doubled track for a seamless loop, paused on hover, fully disabled under `prefers-reduced-motion: reduce` (verified via Playwright's `reducedMotion: "reduce"` context — computed `animation-name` and `transform` both resolve to `none`), edge mask-image fades. Moved from "before FinalCta" to directly after `CinematicHero` (before `ValueEditorial`) per explicit high-priority placement instruction. About page keeps the full static presentation (`size="full" withNames`); footer keeps the compact static version — three different hierarchies for the same real data, not the same component repeated unchanged.

Verified: 0px horizontal overflow at all 7 required breakpoints (1920×1080 down to 375×812); homepage strip section height 150px desktop / 126px mobile (within the 130–190px target); reduced-motion fallback confirmed programmatically; MyLimoBiz iframe still loads. `npx tsc --noEmit` and `npm run build` clean.

Files changed: `src/lib/site-data.ts` (`TRUST_BADGES` now points at the transparent derivatives), `src/components/trust-badges.tsx` (panel removed), `src/components/home/trust-strip.tsx` (rewritten as the marquee), `src/routes/index.tsx` (repositioned), `src/styles.css` (marquee keyframes), plus the new `public/assets/official/badge-*.png` files.

---

## 1c-19. Header / navigation mega-menu pass (2026-08-08)

Client-requested pass: the flat 8-item header nav (`NAV_LINKS`) didn't surface Rates & Pricing, FAQ, Service Areas, Reviews, or any policy page, and the client asked for a premium dropdown structure instead of flattening all 17 routes into the navbar. Rebuilt `site-nav.tsx` around `@radix-ui/react-navigation-menu` (already an installed dependency, previously unused anywhere in the app — the generic shadcn wrapper in `components/ui/navigation-menu.tsx` was left untouched; the real primitives are imported directly and fully restyled to the black/gold system rather than using that generic wrapper's default styling). Structure: Home and "Get In Touch" (labeled per the client's explicit emphasis on Contact not being buried) as standalone links; Services, Fleet, Company, and Policies as dropdown groups. "Group Transportation" (no standalone route) and "Fleet Overview" both point at `/fleet` — an intentional dual entry point matching the footer's own already-established precedent, not an accidental duplicate.

Active-group highlighting computed from the current pathname against each group's real member routes. Mobile mirrors the same grouping via native `<details>/<summary>` accordions (matching this project's existing FAQ-page accordion convention) inside the existing mobile overlay/focus-trap, rather than a second, different interaction pattern.

Verified, not assumed: all 4 dropdown panels' real hrefs inventoried directly from the rendered DOM; Escape closes an open dropdown (`data-state` open→closed); click-outside closes it; active-group color confirmed to resolve to the champagne token on 4 sample routes; mobile accordion opens with 0 overflow; Book Now still routes to `/book`; MyLimoBiz iframe still loads; header height held constant at 76px across all 10 requested breakpoints (1920 down to 375, including 1600×900/1366×768/1280×800) — no crowding, no layout jump. `npx tsc --noEmit` and `npm run build` clean.

Files changed: `src/components/site-nav.tsx` (rebuilt).

---

## 1c-18. Footer + site navigation completeness pass (2026-08-08)

Full route inventory taken directly from the router (17 real routes — `src/routes/*.tsx` cross-checked against `routeTree.gen.ts`), not assumed from the old footer. Footer rebuilt in place (`site-footer.tsx`) into 4 organized columns — Explore, Services, Book & Contact, Company — plus: a conversion banner above the link grid ("Ready when you are." / Book Your Ride / Call Dispatch), a dedicated full-width Phone/Email/Location/Hours panel (not crammed into a link list), and a `FooterTrustBadges` hook for BBB/GNET/NLA that renders nothing today (empty array — no real badge assets exist anywhere, verified again) rather than the placeholder boxes from the previous pass, which a follow-up client instruction explicitly said not to ship. Removed that placeholder section from `about.tsx` accordingly — the footer is now the single home for trust badges sitewide. Mobile: link columns are a 2×2 grid instead of one stacked column.

Verified, not assumed: all 17 routes load with 0 console/page errors and 0 horizontal overflow; footer sits in normal document flow on every route (no absolute/fixed positioning, no content hidden behind it); all 28 footer links inventoried (19 internal, 0 pointing at localhost, 0 pointing at the old external site); 5 sample policy/info routes survive a hard refresh; SPA client-side navigation confirmed (no full page reload) for a footer link; MyLimoBiz iframe still loads correctly (untouched). `npx tsc --noEmit` and `npm run build` clean.

Files changed: `src/components/site-footer.tsx` (rebuilt), `src/routes/about.tsx` (placeholder trust section removed).

Not deployed.

---

## 1c-17. Final client revision + old-site parity pass (2026-08-08)

A large, client-driven correction pass — not a redesign. Goal: factual alignment with the client's latest fleet/pricing corrections, full feature parity with the old live site (`https://lctuniversal.com`) except where the client's corrections explicitly override old-site content, a stronger mobile experience, and production readiness. Full detail (verified old-site content, exact table, Dallas compliance checklist) lives in the new `OLD_SITE_PARITY_AUDIT.md` — this entry summarizes what changed and why.

### Fleet data — client corrections applied, verified against live MyLimoBiz

Live-inspected the real MyLimoBiz booking system (a real, non-submitted Point-to-Point quote — DFW Airport Terminal D → Grapevine Mills Mall) rather than guessing. Confirmed real vehicle classes: Sedan, SUV, Luxury SUV, First Class Sedan (2 pax, $140 for that trip — not the old site's "$200/hour"), Executive Sprinter (14 pax), **Mini Coach (39 pax)**, **Motor Coach (56 pax)** — the last two exactly matching the client's Mini Coach / Executive Coach split.

Also visually inspected the actual fleet photos (not assumed from filenames): `fleetCoach`/`fleetCoachJourney` (coach-airport-arrival.jpg, coach-sideprofile-day.jpg) are a single-rear-axle, cutaway-chassis shuttle bus — genuinely a Mini Coach, previously mislabeled "Executive Coach" at "37–50 passengers." `groupCoachStory` (group-coach-bus.jpg) was confirmed to be a **different, real vehicle** — tandem rear axle, full coach fascia, multiple luggage bay doors — so a fifth fleet entry ("Executive Coach," up to 56 passengers) was added using this genuinely distinct photo, not a fabricated or reused image.

`FLEET_VEHICLES` in `site-data.ts` restructured accordingly (5 entries now); `src/routes/fleet.tsx` gained a 5th chapter (`coachLarge`) mirroring the existing panoramic-banner chapter pattern (opposite drift direction so the two coach chapters don't repeat identically); `HorizontalJourney`'s coach slide title/desc corrected to "Executive Mini Coach."

### Pricing — verified, not guessed

The client explicitly flagged the old "$100/hour Executive" pricing as wrong and asked for live-system verification. The live quote above confirmed pricing is genuinely trip-dynamic (varies by distance/vehicle/date) — not a fixed hourly card. Per the client's own suggested fallback, every hardcoded fixed rate (`$100/hour` sedan, `$120/hour` SUV, `$200/hour` Sprinter/First Class, `$120` airport transfer) was removed from `site-data.ts`, `/fleet`, and `__root.tsx`'s JSON-LD (`priceRange` switched from a literal figure to the symbolic `"$$$"` form), replaced with the client's own suggested wording ("Rates calculated through our live booking system" / "See live rate"). New `VERIFIED_LIVE_VEHICLE_CLASSES` export documents the raw verified source data.

### New pages

- **`/rates`** — new Rates & Pricing page, premium layout (not a copy of the old homepage section): verified vehicle classes with capacities, "how pricing works" / airport-transfer explanation, "Check Live Rates" CTA → `/book`.
- **`/zero-tolerance`** — new Zero Tolerance & Safety Policy page, content preserved from the old site (Dallas Ordinance SEC. 47A-2.1.6 citation, testing/enforcement, reporting via Dallas 311 / compliance office phone) — did not exist anywhere on the new site before this pass.
- **`/cancellation-policy`** — new page at the same URL as the old site, finally rendering the `CANCELLATION_SUMMARY` data that has existed in `site-data.ts` since an earlier pass but was never wired to any page.
- `terms.tsx` enhanced with Dallas Transportation-for-Hire compliance language, complaint contacts (311 / (214) 670-3111), drug-free workplace statement, ADA/wheelchair accessibility line, and real links to the two new policy pages — all verified from the live old site, none invented.
- `faq.tsx` was never linked from any nav or footer — fixed. Its vague "cancellation policies vary" answer now points to the real Cancellation Policy page.
- `site-footer.tsx` gained links to Rates & Pricing, FAQ, Zero Tolerance Policy, and Cancellation Policy.

### Group Transportation image

Swapped `services.tsx`'s Group Transportation chapter from `fleetCoach` (the Mini Coach) to the client-supplied full-size-motorcoach photo. That source photo (`group-coach-bus.jpg`) has a standing chauffeur occupying the visual center; produced a real rectangular crop (`group-coach-bus-crop.jpg`, via an isolated `sharp` install — not AI content removal) that excludes the person entirely. A crop file was necessary rather than relying on CSS `object-position` alone because the section's mobile container aspect ratio (3:2) nearly matches the source photo's own ratio, leaving no room to crop the person out via positioning. New `groupCoachStoryCropped` key in `image-map.ts`.

### Contact page fix

`CONTACT.managementClosed` ("Closed Sundays") existed in `site-data.ts` but was never rendered on the Hours card — fixed.

### BBB / GNET / NLA trust section — blocked, not fabricated

The client considers these essential. A live check of the old site (homepage, About, Fleet, Contact) found **zero BBB/GNET/NLA badges or mentions anywhere**, and a full codebase/asset grep found none in this project either. No section was built with placeholder or invented badge artwork — doing so would misrepresent real accreditation status, directly against the same "do not fabricate" principle the client applied to fleet photos. This is the single largest open item from this pass; see `OLD_SITE_PARITY_AUDIT.md` §8 and the final report's "Missing Client Assets."

### Validation

Real MyLimoBiz autocomplete re-verified working after all changes (3 real suggestions, zero errors). All social links re-verified (`target="_blank"`, `rel="noreferrer"`, exact client-supplied URLs). `npx tsc --noEmit` and `npm run build` clean throughout. `npm audit fix` (non-force) applied, reducing 6 vulnerabilities to 2 — both dev-server-only (esbuild/vite), not shipped in the production build; the remaining fix requires `--force` and would push vite outside its stated dependency range, not applied without explicit sign-off. Expanded the QA sweep script to 17 routes × 11 breakpoints (added `/rates`, `/zero-tolerance`, `/cancellation-policy`; added 1600×900, 1366×768, 1280×800, 360×800 per the client's exact breakpoint list) — 187 combinations, 0 real problems (6 flagged results were re-tested individually and confirmed to be a flaky artifact of the large batch run, not real defects — reproduced 0/6 on isolated retest). Mobile art-direction spot-checked via real wheel-scroll (not `fullPage` screenshots, which don't fire GSAP ScrollTrigger reveals) at 390×844, 375×812, 430×932, 360×800 on every new/changed page — no clipped text, no overlapping FABs, no horizontal overflow.

### Files changed this pass

`src/lib/site-data.ts`, `src/lib/image-map.ts`, `src/routes/fleet.tsx`, `src/routes/services.tsx`, `src/routes/contact.tsx`, `src/routes/faq.tsx`, `src/routes/terms.tsx`, `src/routes/__root.tsx`, `src/components/home/horizontal-journey.tsx`, `src/components/site-footer.tsx`, `public/assets/official/group-coach-bus-crop.jpg` (new), `src/routes/rates.tsx` (new), `src/routes/zero-tolerance.tsx` (new), `src/routes/cancellation-policy.tsx` (new), `OLD_SITE_PARITY_AUDIT.md` (new).

Not deployed. DNS/old site/email DNS untouched. MyLimoBiz iframe architecture, Google Places (inside MyLimoBiz), GSAP/ScrollTrigger, Three.js gating, custom cursor, SEO, Google Ads, StatCounter, security headers/CSP, Netlify routing, Supabase, accessibility, and reduced-motion behavior all untouched.

---

## 1c-16. Final visual polish pass — the approach-darkness issue actually solved (2026-08-08)

§1c-15 (below) shipped the `HorizontalJourney`/`VehicleObjectJourney` handoff-freeze fix and flagged one remaining softer issue as a known, unsolved remainder: an empty-looking dark stretch during the ordinary (unpinned) scroll approach into `VehicleObjectJourney`, before its own pin engages. The client's instruction for this pass was explicit: zero known visual issues may remain in the production build. This pass went back into that exact transition and solved it completely — three separate, real root causes, each found via live DOM/computed-style/debug instrumentation, not guesswork or another overlay.

### 1. Root cause #1 — vertical centering buried content out of view

`VehicleObjectJourney`'s content (headline, copy, vehicle image) sat inside a `min-h-[100svh]` box with `items-center`. Confirmed via direct ancestor-chain inspection: even at full rest (pin fully engaged), the content column's own top sat ~415px below the section's top edge — during the ordinary approach scroll (section still sliding up into view from below, well before its pin starts), that offset meant nothing was on screen at all for most of the approach. A second, smaller-scale version of the same problem existed one level down: the content row's own `lg:items-center` was vertically centering the (short) text column against the (~900px tall) image column, adding another ~290px of hidden offset on top of the first.

**Fixed** by anchoring both levels near the top instead of centering: the outer wrapper is now `items-start` with `pt-32 lg:pt-40` (matching the top-clearance convention already used by `HorizontalJourney`'s own slides), and the inner content row is `lg:items-start` instead of `lg:items-center`. Verified via screenshot that the final pinned "at rest" composition is unaffected in every other respect — same imagery, same copy, same reflection — only its vertical position shifted higher, still reading as a deliberately composed stage.

### 2. Root cause #2 — competing GSAP writers on the SAME element (again, but subtler)

Even after fix #1, the approach still showed nothing on screen. Root-caused via direct `getComputedStyle` + ancestor-chain inspection (not assumption) to a second bug: the pinned timeline's own `.to(".vehicle-copy", {autoAlpha:1,...}, 0.15)` — scheduled to play only once the pin reaches 15% progress — was nonetheless *capturing and overwriting* the properties of an independent, already-added "approach reveal" tween the moment the pin's timeline was constructed, because GSAP's default tween-overwrite behavior applies when two separate animations target the same properties on the same element, regardless of which one is actually "playing" yet. **Fixed** by removing the now-redundant `.vehicle-copy`/`.vehicle-copy-b` reveal tweens from inside the pinned timeline entirely — the standalone approach-reveal tween (added in §1c-15) is now the sole writer for those properties, with nothing left to conflict with it.

### 3. Root cause #3 — the handoff-overlay fix from §1c-15 was itself subtly wrong

While chasing the above, found that §1c-15's own "fix" for the frozen-overlay bug had a second, more insidious defect than what it looked like at first (all reported here in full, including two more dead ends, because each one produced a plausible-looking partial improvement that further live testing disproved):

- **Attempt A** (§1c-15's shipped version): a single consolidated timeline with `scrollTrigger.start: () => "top top+=" + N` (N = 86–94% of the pin's own scroll distance). Debug-logged the trigger's actual resolved `start` pixel and compared it against the pin's real, independently-verified engagement point — off by **thousands of pixels**, far too early. Root cause: GSAP does not correctly resolve a relative "top top+=N" position for a *second* trigger that shares its `trigger` element with a *different* trigger that has `pin:true` — it computes "top" from the element's pre-pin static layout position, not the pin-adjusted one.
- **Attempt B**: switched the second trigger to `start: "bottom bottom"`, matching a pattern already used elsewhere in this same file. Also wrong, for a different reason (also confirmed via debug logging): "bottom bottom" is inherently ambiguous for any element that gets pinned later, because a full-viewport-height pinned section satisfies "bottom = viewport bottom" at *two* different scroll positions — once briefly as it first approaches from below in normal scroll (long before its pin even starts), and continuously throughout the entire pin. GSAP resolves to the *first* (earliest) one, which is exactly wrong for "fade out after the pin ends."
- **Attempt C, shipped**: restored the pin's own `onUpdate` as the sole fade-*in* writer (guarded to stop writing once `progress` reaches 1 — confirmed via debug logging that GSAP keeps calling `onUpdate` for a while after the trigger's progress clamps at its max, which is what caused the original §1c-15 bug), and built a **second, independent** ScrollTrigger for fade-*out* using neither a relative string nor a custom offset formula, but the pin ScrollTrigger's own already-resolved `.end` pixel value, read directly off the trigger instance (`pinTimeline.scrollTrigger.end`) and used as the new trigger's numeric `start`. This is the only version that used exclusively already-verified-correct numbers with no relative-position guessing anywhere. Also added `immediateRender: false` to both fade-out tweens — without it, `gsap.fromTo`'s default immediate-render snaps the overlay to `autoAlpha:1` the instant the component mounts (page load), which happened to be harmless only because the section was off-screen at that point, not because it was actually correct.

### 4. Validation

- Continuous `getComputedStyle(...).opacity` sampling (not spot-check screenshots) across the *entire* homepage scroll range, ~220 samples at ~90px steps, at both 1920×1080 and 1440×900: both handoff overlays now show a brief, correct 0→1→0 pulse exactly at each section's real pin-end, and `0.00` everywhere else — zero frozen stretches, zero premature darkening, zero conflicts. Maximum consecutive high-opacity (>0.9) samples measured: **1** (previously: unbounded/frozen).
- Confirmed via screenshot at the exact previously-broken frame: headline, body copy, and the vehicle image are all clearly legible well before `VehicleObjectJourney`'s pin engages — no black gap, no dead frame, no jarring cut, reads as one continuous cinematic sequence exactly as required.
- Repeated navigate-away-and-back cycling (`/` → `/fleet` → `/` × 3, this project's established convention for catching ScrollTrigger/GSAP-context leaks) followed by a full re-scroll: identical clean behavior, zero errors, zero stuck opacity — confirms proper `ctx.revert()` cleanup, no duplicated/leaked triggers.
- Zero console/page errors across every test in this pass, at 1920×1080, 1440×900, and 390×844 (mobile confirmed structurally unaffected — `VehicleObjectJourney`'s pin is gated behind `isDesktopMotion()`, so this entire bug class never existed there).
- 0px horizontal overflow at 390×844 before and after a full scroll-through.
- CLS measured via a raw `PerformanceObserver` during active scrolling read ~6.0 — investigated and confirmed to be a measurement artifact of the Layout Instability API misreading GSAP's pin/transform mechanics as shifts while scroll-driven pinning is active, not a real visual defect: the same measurement with **zero scrolling** (entrance animations only) reads **0.00005**, and this project's existing trustworthy Lighthouse-measured CLS (`LAUNCH_CHECKLIST.md`) is 0.007. Not a regression introduced by this pass.
- `npx tsc --noEmit` and `npm run build` clean after every change in this pass.
- Full 98-combination Playwright sweep re-run after all changes: see `LAUNCH_CHECKLIST.md` for the final numbers.
- Not deployed. DNS/old site/email DNS untouched. MyLimoBiz, Google Ads, StatCounter, SEO metadata, Supabase config, GA4 untouched.

### 5. Files changed this pass

- `src/components/home/vehicle-object.tsx` — `items-start`/`pt-32 lg:pt-40` outer wrapper, `lg:items-start` inner row, removed conflicting pin-timeline copy tweens, rebuilt `.vehicle-handoff` as pin-onUpdate (fade-in, guarded) + independent pin.end-based trigger (fade-out, `immediateRender:false`).
- `src/components/home/horizontal-journey.tsx` — identical `.journey-handoff` rebuild (fade-in guard + independent pin.end-based fade-out trigger, `immediateRender:false`).

---

## 1c-14. Final production pass — new Hero, scroll-gap bug fix, social links, migration audit (2026-08-07)

Pre-Netlify-release pass. No redesign, no integration/routing/booking/SEO/security/GSAP/Three.js changes — scope was Hero media, one real scroll-experience bug, social links, and a full domain-migration/integration-parity audit ahead of moving `lctuniversal.com` from Namecheap-hosted DNS to Hostinger and deploying this project to Netlify.

### 1. Hero image replaced

Client said a new Hero image would be placed in `public/assets` but it hadn't landed there — found it in their Downloads folder instead (`WhatsApp Image 2026-08-07 at 4.18.45 PM.jpeg`, a WhatsApp export, consistent with how the client has supplied images in prior passes). It shows the complete fleet — 5 vehicles plus the branded coach bus — lined up together, symmetric composition, clear sky across the top third. Processed to `public/assets/official/hero-fleet-lineup.jpg` (163KB) and set as `image-map.ts`'s `hero` key, replacing `group-coach-bus.jpg` in that one placement (the source photo remains in active use elsewhere — `fleetCoach`/`fleetCoachJourney`/`groupCoachStory` were already migrated to other photos in the prior pass, and `groupCoachStory` still uses it). No Hero animation code was touched — only the image `src`/crop.

### 2. Media re-audit

Checked `/public/assets` for anything genuinely new beyond the previous pass's exhaustive 31-file inventory. Nothing new was found except the one Hero image above — the "large batch of new photos and videos" referenced in this pass's brief was the same batch already fully catalogued in §1c-13's `MEDIA_REGISTRY.md` work. No re-assignment needed beyond the Hero swap.

### 3. Real bug found and fixed: the post-Hero "black gap"

Confirmed via scripted real-wheel-scroll + screenshot + DOM inspection (this project uses Lenis smooth-scroll on the homepage, so `window.scrollTo` isn't representative — `page.mouse.wheel` was used, consistent with this project's established testing convention). Root cause: `cinematic-hero.tsx`'s closing dark-wipe (`.hero-handoff`) used a `scrollTrigger` spanning `start: "bottom bottom"` → `end: "bottom top"` — the Hero's *entire* scroll-out distance (0%–100%). Every sibling handoff in this same codebase (`HorizontalJourney`'s `.journey-handoff`, `VehicleObjectJourney`'s `.vehicle-handoff`) compresses its wipe into only the final 14–15% of its own scroll range (`(progress - 0.85) / 0.15` and `(progress - 0.86) / 0.14`). The Hero's uncompressed version meant the photo was already darkened to near-black for most of its exit, which then ran directly into `ValueEditorial`'s own near-identical near-black top padding (`py-[var(--section-space)]`, up to 128px) before any content appears — together reading as one long dead stretch of scroll with nothing legible on screen, exactly matching the reported "ugly black gap."

**Fixed** by changing the trigger to `start: "bottom 20%"`, compressing the wipe into the final ~20% of the Hero's exit — same pattern family as its siblings, still respecting the existing code comment's explanation for why `"bottom bottom"` was originally chosen as a start anchor (Hero is exactly viewport-height). Verified before/after: at the same scroll position, `ValueEditorial`'s heading and value-prop copy are now fully legible almost immediately, instead of appearing only after a long near-black stretch.

### 4. Official social media links added

Client supplied Instagram, TikTok, YouTube, and an updated Facebook URL. Added via one new shared component (`src/components/social-links.tsx`) so the footer and Contact-page placements can never drift apart — rendered in both locations, plus added to the homepage `LocalBusiness` JSON-LD `sameAs` array (previously Facebook-only). Icons: lucide-react's `Instagram`/`Youtube`/`Facebook` (all present in the library); a new hand-drawn SVG `TikTokIcon` (`src/components/icons/tiktok-icon.tsx`) since lucide-react ships no TikTok glyph — matches the project's existing precedent of custom SVG icons where the library doesn't cover a needed brand (e.g. the WhatsApp glyph in `floating-actions.tsx`). All links: `target="_blank"`, `rel="noreferrer"`, per-icon `aria-label`, hover lift + gold-shadow transition consistent with the site's existing hover language.

### 5. Domain migration + integration parity audit

New document: `DOMAIN_MIGRATION_AUDIT.md` — supersedes the Phase-1-era `INTEGRATION_AUDIT.md` (which is now marked as superseded, not deleted). Covers: a full connection-flow diagram of every integration this project's code actually touches; a Google Places Autocomplete parity finding (the old live site's address autocomplete lives entirely inside the MyLimoBiz iframe, which this project already embeds identically — same account alias `luxlanetransports` — so parity already exists without building anything new); a 5-category breakdown of what does/doesn't depend on DNS vs. the registrar vs. the domain name itself; email DNS safety guidance (MX/SPF/DKIM/DMARC preservation); a full Integration Parity Table (MATCHED/IMPROVED/REPLACED INTENTIONALLY/MISSING/REQUIRES CLIENT ACCESS/REQUIRES PRODUCTION TEST per integration); a pre-cutover migration checklist; and direct answers to the 7 final pre-launch questions the client asked. Built by directly inspecting the live `lctuniversal.com` site (its HTML, `robots.txt`, `sitemap.xml`, and — read directly rather than assumed — MyLimoBiz's own `widget-loader.js` logic) via a dedicated research pass, cross-referenced against this project's actual source.

**Headline findings**: MyLimoBiz booking (including its Google Places-powered autocomplete) and the Google Ads/StatCounter tracking IDs are already matched exactly between old and new sites. The new site is meaningfully ahead on SEO (old site has no canonical tags, no JSON-LD, an empty `robots.txt`, and an empty `sitemap.xml`). Genuine gaps found: no live chat widget in the new site (old site has GoHighLevel's), GA4 present in code but inert pending a real measurement ID, and no SMS/transactional-email-sending code exists anywhere in this project (confirmed via full-source grep — no Twilio, no Resend, no Supabase Edge Functions). None of these are things to guess/build blindly; all are flagged as client decisions or client-access items in the audit.

### 6. Validation

- `npx tsc --noEmit` — clean.
- `npm run build` — clean.
- Full Playwright sweep, 98 combinations — 0 problems, 661 image renders all valid (0 broken), video count exactly 1 per homepage viewport (7 total), 0 on every other route.
- Social links visually verified on both footer and Contact page via screenshot.
- Scroll-gap fix verified via before/after scripted scroll-and-screenshot comparison.
- MyLimoBiz, Supabase, SEO, security headers, GSAP architecture, Three.js — none touched by this pass.
- Not deployed. DNS not changed. Old site not disconnected.

---

## 1c-15. Final correction pass — post-Hero image, real scroll-gap root cause, MyLimoBiz-only booking, sitewide address-field audit (2026-08-08)

Two-part correction pass on top of §1c-14, both driven by the client re-reviewing the live build after that pass shipped. Part A (post-Hero image + homepage scroll gap + booking-form consolidation) landed first; Part B (the *actual* black-gap root cause, found only after the client reported the gap was still present, plus a sitewide address-field consistency audit) landed after further live testing exposed that Part A's scroll-gap fix, while a real improvement, was not the whole story. No redesign, no MyLimoBiz/Google Ads/StatCounter/SEO/canonical/structured-data/DNS/email-DNS/Supabase/GA4 changes. Not deployed.

### 1. Post-Hero section image replaced

`ValueEditorial` (the section immediately after the Hero, "Quiet exactness. Every mile.") now uses the client-supplied backseat/passenger-POV photo (chauffeur driving, FIJI water bottles, downtown Dallas through the windshield) instead of `cockpit`. New `image-map.ts` key `valueCabinExperience` → `public/assets/official/cabin-premium-experience.jpg`, a taller/higher crop than the existing `bookExperience` key (same source photo, IMG_2438.PNG) so the two placements don't repeat the same framing. No copy/layout/animation changes to `ValueEditorial` itself.

### 2. Homepage booking form consolidated onto MyLimoBiz — the non-functional duplicate removed

The homepage's `BookingExperience` quote wizard (Pickup/Drop-off/Vehicle/Contact, `src/components/home/booking-experience.tsx`) was confirmed via live Playwright interaction — not code reading — to have zero real autocomplete: `autocomplete="off"`, zero network requests to any maps/places endpoint when typing, zero suggestion UI. Separately confirmed via direct cross-origin iframe inspection that the real MyLimoBiz form at `/book` has genuine, working, Google Places-backed autocomplete (typing "DFW Air" into its real `#PickupLocation` field returns real address suggestions). Per the explicit fallback instruction ("do not leave non-functional location fields in production; do not run two competing booking systems"), `BookingExperience` was **removed entirely** — `booking-experience.tsx` now only exports `FinalCta` (unchanged, already links to `/book`). `src/routes/index.tsx` updated to match. No Google Maps/Places API key exists anywhere in this project (confirmed via full-source grep), so wiring real Places into the custom form was never an available option.

### 3. Real black-gap root cause found and fixed (two bugs, not one)

The client reported the post-Hero-slide-sequence black gap as still present after an initial compression fix (shrinking `HorizontalJourney`'s dark-wipe handoff window from 15% to 6% of its pin's progress). Re-investigated from scratch with live DOM/computed-style inspection and screenshot sequencing (not code reading) at the `HorizontalJourney → VehicleObjectJourney` and `VehicleObjectJourney → PinnedStories` boundaries, per the explicit instruction to find the actual root cause rather than mask it with another overlay. Two distinct, real bugs were found:

- **Frozen dark-wipe overlay.** `.journey-handoff` / `.vehicle-handoff` (the full-bleed dark overlay each pinned section fades in near the end of its own scroll-driven timeline) were being set via the *same pinned ScrollTrigger's* `onUpdate` callback. That callback keeps firing — and re-asserting its last computed value — on every scroll tick even after the pin's own `progress` has clamped to `1` past its `end`, i.e. for the entire ordinary (unpinned) scroll distance it takes to reach the next section. A second, independent ScrollTrigger was added to fade the overlay back out across that natural post-pin stretch, but it silently conflicted with the first — GSAP's own progress tracking on the second trigger correctly reached `1.0` (opacity mathematically at `0`), yet the computed style stayed at opacity `1` because the pin's onUpdate kept re-writing it every frame. Confirmed via temporary `onUpdate`/`onRefresh` console instrumentation, not assumption. **Fixed** by consolidating each handoff into a single timeline (fade in → hold → fade out) with one ScrollTrigger and one writer, spanning from ~86–94% into the pin's own progress through the natural approach into the next section — no more competing writers.
- **`endTrigger` selector-scoping bug.** The fade-out triggers' `endTrigger: "#vehicle-motion"` / `"#stories"` (string selectors) silently failed to resolve — confirmed via GSAP's own "Element not found" console warning — because `gsap.context()` scopes selector-text lookups (including ScrollTrigger's `trigger`/`endTrigger` strings) to the effect's own root element; a sibling section's `id` selector is outside that scope. **Fixed** by resolving `document.getElementById(...)` once and passing the real element reference instead of selector text.

Both fixes verified via real wheel-scroll + live opacity sampling across the full transition range at 1920×1080 (and spot-checked at 1440×900): both handoff overlays now correctly ramp 0→1→0 with zero "Element not found" warnings and zero frozen/stuck state, confirmed by sampling `getComputedStyle(...).opacity` continuously through hundreds of scroll steps, not a single before/after screenshot pair.

A related, softer issue was also found and partially — not fully — addressed: `VehicleObjectJourney`'s copy/vehicle-image content is only animated by its own pinned timeline, gated entirely behind its "top top" pin trigger, so the ordinary approach scroll before that pin engages shows only the section's own plain dark idle background (not a frozen bug, just an empty stretch). An entrance reveal was added so the copy/vehicle fade in during the natural approach rather than waiting for the pin; an attempt to also reposition the content earlier (compensating for `items-center`'s vertical-centering offset inside the `min-h-[100svh]` box) was reverted after confirming live that it's blocked by the section's own `overflow-hidden` ancestors — the content cannot render above its own clipping box via `transform` alone, and shrinking the box's height to avoid that was judged too risky to the confirmed-good pinned "stage" composition without more validation time than this pass had. Documented here rather than silently left out: this residual softer approach-darkness is a known, lower-severity remainder, distinct from (and much shorter than) the frozen-overlay bug that was the actual reported defect.

### 4. Sitewide Pickup/Drop-off address-field audit

Per the explicit instruction not to leave one page's booking/location experience inconsistent with the rest of the site: audited every Pickup/Drop-off-labeled input across the entire codebase (grepped for `pickupAddress`/`dropoffAddress` plus a broader case-insensitive sweep for stray fields). Found the same non-functional plain-text pattern (no autocomplete, `autoComplete="off"`) in the shared `LeadForm` component (`src/components/lead-form.tsx`), used with a real single-specific-address field on three routes:

- `/contact` — "Pickup Location" / "Drop-off Location" — **removed**; the form's description already directed users to "Book Your Ride above" for instant confirmation, so this was pure redundancy.
- `/airport` — "Pickup Location" / "Drop-off Location" — **removed**; `submitLabel` changed from "Reserve Airport Transfer" to "Request Airport Transfer" (accurate now that the form no longer captures the trip's actual addresses) with a new description pointing to `/book` for live pricing/instant confirmation.
- `/events` — "Primary Pickup / Venue" (single-line) — **removed**; the existing "Additional Stops / Venues" textarea was kept and relabeled "Venue(s) / Stops" (a genuine free-text description field, not a single-address lookup, so it's a different kind of field than what was removed) with a new description pointing to `/book`.

`/corporate`'s `pickupAddress`-keyed field (labeled "Primary Cities") was deliberately **left unchanged** — it asks for a multi-city service footprint ("Dallas, Fort Worth, Plano"), not a single geocodable address, so it isn't actually an address-autocomplete candidate in the same sense as the others; forcing Google-Places-style behavior onto it would be a category error, not a fix. Flagged here explicitly as a considered judgment call rather than a silent skip.

All three edited forms still submit normally to Supabase via the existing `submitFormClient` path — only the specific broken location inputs were removed; `customerName`/`customerEmail`/`phone`/dates/passenger counts/notes and each form's Supabase submission behavior are unchanged. The real MyLimoBiz form at `/book` remains the sole location-with-autocomplete experience anywhere on the site.

### 5. Validation

- `npx tsc --noEmit` — clean.
- `npm run build` — clean throughout every intermediate step of this pass.
- Handoff opacity sampled continuously (not just before/after) across the full `HorizontalJourney → VehicleObjectJourney → PinnedStories` scroll range at 1920×1080; zero "Element not found" console warnings; zero frozen-overlay state; zero page/console errors across a full slow scroll-through of the entire homepage.
- Spot-checked 1440×900 with a full scroll-through — zero console/page errors.
- Confirmed `VehicleObjectJourney`'s pin (and therefore this whole bug class) only applies on desktop (`isDesktopMotion()` gate) — mobile/reduced-motion renders these sections in plain unpinned flow, so this bug never existed there.
- `/contact`, `/airport`, `/events` re-screenshotted after the field removals — forms render cleanly, no broken/orphaned layout, `Book Now` links present and correctly routed to `/book`.
- MyLimoBiz, Google Ads, StatCounter, SEO metadata, canonical, structured data, social links, Supabase config, GA4 — none touched by this pass.
- Not deployed. DNS not changed. Old site not disconnected. Email DNS not touched.

---

## 1b. Phase 2 completion record (2026-07-30)

### Client decisions applied
- WhatsApp active: `18886154065` / `+1 (888) 615-4065`
- Legacy WhatsApp `16823441891` documented in `LEGACY_CONTACT` only — not rendered
- Email restored: `reservations@lctuniversal.com`
- Location restored: Grapevine, Texas 76051 (no street invented)
- Brand: **LCT Universal only** — Luxlane removed from UI/copy/social/alt/metadata
- Physical Luxlane text in official photos **unchanged**; documented for later review
- Geography: Dallas–Fort Worth and Grapevine, Texas (no nationwide/affiliate claims)
- Fleet published: Sedan / SUV / Sprinter (bookable) + Coach (quote only)
- Review-only: First Class, V-Class, Limousine, additional coach variants

### Centralized modules
- `src/lib/site-data.ts` — COMPANY, CONTACT, LEGACY_CONTACT, NAV_LINKS, FLEET_VEHICLES, BOOKING_VEHICLE_OPTIONS, RATES, SERVICES_*, CANCELLATION_SUMMARY, FLEET_REVIEW_ITEMS
- `src/lib/image-map.ts` — IMAGES map with desktop/mobile object-position, alt, notes

### Official image copies (`public/assets/official/`)
| Professional name | Source |
|-------------------|--------|
| `hero-sclass-chauffeur.jpg` | DSC01373.JPG |
| `fleet-escalade.jpg` | DSC01148.JPG |
| `events-fleet-stadium.jpg` | DSC01102.JPG |
| `airport-dfw-highway.jpg` | DSC01860.JPG |
| `chauffeur-door-service.jpg` | DSC01240.jpg |
| `chauffeur-sclass-portrait.jpg` | DSC01431 - Copy.jpg |
| `chauffeur-interior.jpg` | DSC01134.jpg |
| `cockpit-highway.jpg` | DSC01854.JPG |
| `rearview-highway.jpg` | DSC01855.JPG |

### Design system
- Tokens: surface black/elevated, champagne, gold, layout, motion, z-index
- Typography: Cormorant Garamond (display) + Manrope (sans) — Inter removed
- Header: transparent → dark on scroll; Book Now CTA; Escape + scroll lock + focus return
- Footer: verified contact + Facebook only (Instagram withheld — Luxlane handle)

### Technical fixes
- `/airport` missing `SectionHeading` import — fixed
- Supabase `raw_payload` Json typing — fixed
- Booking vehicle options type cast — fixed
- Typecheck (`tsc --noEmit`) — pass
- Production build — pass
- Framer Motion / Three.js packages left installed (unused mount paths); not removed this phase to avoid unrelated breakage

### Remaining unresolved
- Instagram: no LCT-branded URL verified (Luxlane IG not linked)
- Sprinter/Coach dedicated photography still placeholder (`fleet-sprinter.jpg`)
- Hero/official DSC files are large originals — compress/WebP in Phase 7
- Luxlane plate/sticker visible in some photos — later review
- Email confirmation Edge Function still missing
- Old `/book` embed not yet connected
- Homepage cinematic sections still largely unmounted (Phase 3+)
- Logo still resolves via favicon asset URL — need proper wordmark asset

### Validation (Phase 2)
- `npx tsc --noEmit` — exit 0
- `npm run build` — success
- Lint on Phase 2 files — Prettier-cleaned; full-repo lint still noisy on unrelated `image-audit.js` / CRLF
- Routes preserved; Supabase form submit path retained

---

## 2. Current project architecture

### Stack
- **Vite 7** + **React 19** + **TypeScript** SPA (migrated from Lovable / TanStack Start)
- **TanStack Router** (file-based routes) + **TanStack Query**
- **Tailwind CSS v4** + shadcn/Radix UI kit
- **Supabase** browser client → `form_submissions` table
- Motion deps installed: **GSAP**, **Lenis**, **Framer Motion** (unused in src), **Three.js / R3F** (mostly unused)
- Forms: custom `LeadForm` + `submitFormClient` (Zod present in deps; LeadForm validates manually)

### Entry points
- `src/main.tsx` → `src/router.tsx` → `src/routes/__root.tsx` → route tree
- Global: `BrandLoader`, fonts (Cormorant Garamond + Manrope), SEO head helpers, hero preload

### Routes (current)

| Path | File | Notes |
|------|------|-------|
| `/` | `src/routes/index.tsx` | Live desktop: Hero + ValueProposition + ServicesPreview. Large cinematic GSAP sections exist in-file but are **not mounted**. Mobile: `MobileFallback` |
| `/about` | `about.tsx` | Mission + 4 values |
| `/services` | `services.tsx` | 12 service cards + inquiry form |
| `/fleet` | `fleet.tsx` | 4 vehicles from `FLEET_VEHICLES` (coach quote-only) + form |
| `/corporate` | `corporate.tsx` | Corporate pitch + form |
| `/airport` | `airport.tsx` | Airport features + form (`SectionHeading` import fixed in Phase 2) |
| `/events` | `events.tsx` | Event types + form |
| `/contact` | `contact.tsx` | Contact form + phone/WhatsApp cards |
| `/faq` | `faq.tsx` | 12 FAQs + FAQPage JSON-LD |
| `/service-areas` | `service-areas.tsx` | US + affiliates (no city list) |
| `/reviews` | `reviews.tsx` | Placeholder only — no testimonials |
| `/privacy` | `privacy.tsx` | Short policy (Jan 2026) |
| `/terms` | `terms.tsx` | Short terms (Jan 2026) |

**Nav (`NAV_LINKS`):** Home, About, Services, Fleet, Corporate, Airport, Events, Contact  
**Not in main nav:** FAQ, Reviews, Service Areas, Privacy, Terms

### Key shared modules
- Data: `src/lib/site-data.ts`
- Forms: `src/lib/forms/types.ts`, `src/lib/forms/submissions.client.ts`
- Supabase: `src/integrations/supabase/client.ts`, `types.ts`
- Layout: `src/components/site-layout.tsx`, `site-nav.tsx`, `site-footer.tsx`
- Luxury (partially live): `brand-loader.tsx`, `smooth-scroll.tsx`, `reserve-dialog.tsx`, `split-reveal.tsx`, `gold-particles.tsx`
- Luxury unused in tree: `scroll-progress.tsx`, `section-progress.tsx`
- Booking UI: `booking-card.tsx`, `lead-form.tsx`, `reserve-dialog.tsx`

---

## 3. Verified business data — OLD WEBSITE (primary)

Source: https://lctuniversal.com and linked pages (audited 2026-07-30).

### Company identity
- **Legal / brand name:** LCT Universal Executive Transports
- **Also appears on About:** “Luxlane Transports” / Luxlane branding (related brand — see conflicts)
- **Positioning:** Premium / VIP / luxury executive transportation in Dallas area
- **Founded:** 2025 (homepage “Who we are”)
- **Regulatory note (Terms):** Operates under City of Dallas Transportation-for-Hire regulations

### Contact
| Field | Verified value |
|-------|----------------|
| Phone | `(888) 615-4065` / `tel:(888) 615-4065` |
| Email | `reservations@lctuniversal.com` (decoded from Cloudflare protection on contact page) |
| Address | Grapevine, Texas 76051 (city/ZIP only — no street line published) |
| Reservation / dispatch | 24 hours a day, 7 days a week |
| Management hours | 9:00 AM – 4:00 PM, Monday–Saturday |
| Management closed | Sundays |
| WhatsApp (footer) | `https://wa.me/16823441891` |
| Facebook | `https://www.facebook.com/profile.php?id=61581897194732` |
| Instagram | `https://www.instagram.com/luxlanetransports` |

### Old site routes (content sources)
- `/` home
- `/about`
- `/services`
- `/our-fleet`
- `/contact-us`
- `/book` (existing booking entry — keep for later embed/connect; do not invent a parallel booking engine)
- `/flight`
- `/login` / register
- `/terms` (Last Updated: April 28, 2025)
- `/policy`, `/privacypolicy`, `/cancellation-policy`
- `/partners-app`, `/articles`, `/news`

### Services (verified on old site)
1. **Private Transportation** — door-to-door luxury vehicles, professional chauffeurs, comfort/safety/privacy  
2. **Airport Transfers** — pickups/drop-offs, luggage assistance, real-time flight monitoring, curbside or meet-and-greet  
3. **Large Group Transfers** — buses and spacious vans; corporate groups, weddings, conferences  
4. **City Tours and Travel** — personalized luxury city touring  
5. **Corporate Clients** — executive meetings, VIP guests, punctuality, privacy  
6. **Family Travel & Child Safety** — child car seats upon request  

Homepage also highlights: Private Transportation, Airport Transfers, Large Group Transfers, City Tours, Corporate Clients.

### Fleet categories (verified on old site)
| Category | Capacity / notes | Features (as published) |
|----------|------------------|-------------------------|
| Executive sedans | Capacity not numerically listed on old fleet page | Premium leather, elegant design, convenient luggage space; business/private rides |
| Luxury SUVs | Capacity not numerically listed | Spacious comfort for families/small groups; events, city, long-distance; luggage space |
| Luxury Sprinter vans | **Up to 12–14 passengers** | Comfortable seating, ample luggage, sleek black exterior; corporate groups, VIP tours |
| Luxury coach buses | **Up to 37–50 passengers** | Weddings, conferences, large events; premium seating, storage, professional service |

Old FAQ also mentions **limousines** as a vehicle type — no model/price/capacity detail. Treat as review item.

### Pricing (verified on old site — “from” rates)
| Item | Rate |
|------|------|
| Sedan hourly | from **$100/hour** |
| SUV hourly | from **$120/hour** |
| Sprinter Van hourly | from **$200/hour** |
| First Class hourly | from **$200/hour** |
| Airport transfers | starting from **$120** (depends on pickup/drop-off) |
| Notes | Rates vary by vehicle, distance, time; minimum service duration may apply; final pricing via booking system |

### Cancellation policy (verified — old `/cancellation-policy`)
**Sedans & SUVs**
- >12 hours before pickup → full refund  
- Within 12 hours → 50% of fare  
- Within 2 hours or no-show → full charge  

**Airport transfers**
- Notify ≥6 hours before to avoid charges  
- <6 hours → 50%  
- Airport no-show without notice → 100%  

**Hourly & special events** (hourly charters, weddings, proms, etc.)
- ≥48 hours → full refund  
- Within 48 hours → 50%  
- Same-day / no-show → full charge  

**Modifications:** <6 hours before pickup may face availability limits and fees.  
**Weather/emergencies:** fees may be waived at company discretion.  
**Cancel contact:** phone + reservations email.

### FAQ themes (old site)
- Vehicles: sedans, SUVs, limousines  
- Advance or same-day booking (availability)  
- Professionally trained, background-checked, formal dress chauffeurs  
- Modify/cancel within notice period; late fees / no-shows  
- Payment: major credit/debit; fare authorized before pickup  
- Mobile app: in development (not available yet)

### About / brand copy themes (old site)
- Founded 2025; ambition to lead premium transportation  
- Invest in modern luxury vehicles and systems  
- Reliability, discretion, personalized service  
- Safety, privacy, comfort; maintained fleet; trained chauffeurs  
- Why choose: reliable/on-time, luxury fleet selection, privacy & safety (incl. real-time tracking language on homepage)

---

## 4. Verified business data — CURRENT PROJECT

### Company identity (in code)
- Names: “LCT Universal”, “LCT Universal Executive Transports”
- Tagline themes: private chauffeur; discreet, punctual, impeccable
- Founding year: **not in code**
- Street address: **not in code**
- Public email: **not shown** (UI: “Use the reservation form”)

### Contact (in code)
| Field | Value |
|-------|-------|
| Phone display | `+1 (888) 615-4065` |
| Phone tel | `tel:+18886154065` |
| WhatsApp | `https://wa.me/18886154065` |
| Hours | 24/7 / 24/7/365 (reservation language) |
| Geography | “United States”, affiliates for additional cities |
| Social | Instagram / Facebook / LinkedIn → `href="#"` placeholders |

### Fleet (`src/lib/site-data.ts`) — keep as current verified numeric data unless client overrides

| ID | Name | Model | Pax | Bags | From | Features |
|----|------|-------|-----|------|------|----------|
| sedan | Executive Sedan | Mercedes-Benz S-Class | 1–3 | 2–3 | $100/hr | Premium leather; Wi-Fi when available; bottled water & amenities; privacy tinted windows |
| suv | Executive SUV | Cadillac Escalade · Executive SUV | 1–6 | 4–6 | $120/hr | Captain's chairs; extended legroom; extra luggage; ideal for VIPs/families |
| sprinter | Executive Sprinter | Mercedes-Benz Sprinter Executive | 1–14 | 12+ | $200/hr | Conference seating; USB & power; high headroom; perfect for corporate groups |

### Booking vehicle options (includes item not in fleet cards)
- Executive Sedan — Mercedes-Benz S-Class  
- Executive SUV — Cadillac Escalade · Executive SUV  
- Executive Sprinter — Mercedes-Benz Sprinter  
- **Executive Van — Mercedes-Benz V-Class** ← not in `FLEET_VEHICLES`  
- No preference  

### Services (current `/services` — 12)
Airport Transfers; Corporate Travel; Executive Chauffeur; Hourly Chauffeur; Point to Point; Hotel Transfers; Business Meetings; VIP Transportation; Long Distance; Group Transportation; Luxury Mercedes Fleet; Weddings & Private Occasions  

### Reviews
- No verified testimonials in project. Reviews page is a placeholder. **Do not invent testimonials.**

### Terms / privacy (current)
- Short versions dated January 2026  
- Differ from old site April 28, 2025 terms and detailed cancellation page — see conflicts  

---

## 5. Conflicts & review items

| # | Topic | Old site | Current project | Safe interim rule |
|---|--------|----------|-----------------|-------------------|
| C1 | Email | `reservations@lctuniversal.com` | Not displayed | **Restore old-site email** in Phase 2 data; mark confirmed |
| C2 | Address | Grapevine, TX 76051 | Not shown; “United States” | Keep Grapevine + ZIP; do not invent street |
| C3 | Founded | 2025 | Absent | Use 2025 when About needs a year |
| C4 | WhatsApp | `wa.me/16823441891` | `wa.me/18886154065` | **REVIEW** — do not guess; keep phone tel link; document both |
| C5 | Service area | Dallas / Grapevine / DFW-focused copy + City of Dallas regulatory notice | US-wide + affiliates | Prefer **Dallas–Fort Worth / Grapevine** as primary verified market; treat US-wide affiliate claim as **review** |
| C6 | Coach buses | 37–50 pax published | Not in `FLEET_VEHICLES` | Preserve as verified category; need price/features before promoting rates |
| C7 | Limousines | Mentioned in old FAQ | Not in fleet data | **REVIEW** — do not invent specs |
| C8 | First Class rate | from $200/hr | Not named | Preserve as verified rate label pending definition |
| C9 | Airport from price | from $120 | Not in site-data | Preserve; show only as “from” with location dependency |
| C10 | Sedan models in photos | BMW 7 Series + Mercedes S-Class present in client photos | Copy says Mercedes-Benz S-Class | Align copy to vehicle shown; **REVIEW** official sedan lineup |
| C11 | Luxlane vs LCT | About + Instagram + plate stickers reference Luxlane/Luxlane Transports | Brand is LCT Universal | **REVIEW** relationship/branding with client |
| C12 | Booking system | `/book` + Login/Register on old site | Supabase lead forms only; email pipeline removed | Keep Supabase leads; prepare to **embed/connect** old `/book` — do not fake bookings |
| C13 | Management hours | 9–4 Mon–Sat | Only 24/7 language | Publish both: 24/7 dispatch + management hours |
| C14 | Payment copy | Cards + pre-auth (old FAQ) | Invoice / settle / advance auth (new FAQ) | Prefer old verified payment language for public FAQ unless client confirms new |
| C15 | Terms date / cancellation | Detailed cancellation page Apr 2025 terms | Simplified Jan 2026 terms | Prefer old cancellation policy as verified; merge carefully in Phase 7 |
| C16 | Child seats / wheelchair | Child seats (services); wheelchair upon request (terms) | Not surfaced | Preserve as verified service notes |
| C17 | V-Class | Not on old fleet page | In booking options only | **REVIEW** before public fleet promotion |
| C18 | Social links | FB + IG live | `#` placeholders | Restore verified FB/IG; WhatsApp pending C4 |

### Missing (do not invent)
- Street-level address  
- Exact passenger/luggage numbers for sedan/SUV on old site (use current project numbers until client confirms)  
- First Class vehicle definition  
- Verified written testimonials / awards / package names  
- Professional transparent PNG / GLB vehicle asset (none found)  
- Official logo wordmark file wired correctly (logo currently maps to favicon PNG)  
- Confirmation of which WhatsApp number is correct  
- Confirmation of LCT vs Luxlane public branding  

---

## 6. Booking flow & forms

### Current flow
1. User opens `LeadForm` / `BookingCard` / `ReserveDialog`  
2. Client-side validation (required fields, name length, email regex, honeypot `website`)  
3. `submitFormClient` inserts into Supabase `form_submissions` with `status: "received"`  
4. UI success toast — **no email send** in SPA (`MIGRATION-NOTES.md`)  
5. DB columns for company/customer email status exist but are unused by client  

### Form types
`contact` | `quote` | `booking` | `corporate` | `airport` | `event` | `fleet` | `service_inquiry`

### Core fields supported by schema / client
customer name/email, phone, company, pickup/dropoff, additional stops, trip type, pickup/return datetime, passengers, luggage, vehicle preference, flight number, airline, meet & greet, corporate booking, special requests, source page, honeypot, clientToken (sent in payload; not a dedicated DB column)

### Old site booking
- Public CTA routes to https://lctuniversal.com/book and Login/Register  
- Final pricing “calculated instantly through our booking system”  
- **Decision:** Do not replace with a fake success engine. Preserve Supabase lead capture; Phase 7 should embed or deep-link the existing booking system after client confirmation.

---

## 7. Supabase integration

- Client: `src/integrations/supabase/client.ts`  
- Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (required)  
- Table: `public.form_submissions` (see `src/integrations/supabase/types.ts`)  
- Migrations under `supabase/migrations/`  
- Email delivery: **not implemented** in this Vite build — restore via Edge Function or backend before production if confirmation emails are required  
- Never remove working insert path without a verified replacement  

---

## 8. Image inventory

### A. Live public assets (what the site actually serves)

| File | Size (approx) | Observed content | Current overuse risk |
|------|---------------|------------------|----------------------|
| `public/assets/fleet-sedan.jpg` | ~54 KB | Studio black Mercedes S-Class (gold wheels) | Strong sedan hero candidate; low-res |
| `public/assets/fleet-suv.jpg` | ~49 KB | SUV placeholder | Low-res |
| `public/assets/fleet-sprinter.jpg` | ~56 KB | Sprinter/coach placeholder | Low-res; often used as “hero car” incorrectly |
| `public/assets/hero-limo.jpg` | ~294 KB | Night Maybach stretch limo (stock/cinematic) | May conflict with “no generic limo” + sedan copy |
| `public/assets/chauffeur.jpg` | ~120 KB | Shared chauffeur placeholder | Over-mapped to many asset.json entries |
| `public/assets/interior.jpg` | ~126 KB | Cabin interior | Shared |
| `public/assets/favicon.png` | ~772 KB | Favicon **and** logo URL | Wrong for wordmark |

**Critical:** Nearly all `src/assets/lct/*.asset.json` and `lct-real/*.asset.json` `url` fields collapse onto the 6 files above. Original high-res R2 filenames remain in metadata only.

### B. Client / camera originals (present, mostly unreferenced — prefer these)

| File | Approx size | Inspection summary | Recommended placement |
|------|-------------|--------------------|-----------------------|
| `src/assets/DSC01373.JPG` | ~7.4 MB | Chauffeur + black Mercedes S-Class, Dallas AAC / Dirk Nowitzki area | **Primary homepage hero (desktop)** / Executive sedan / Chauffeur |
| `src/assets/DSC01431 - Copy.jpg` | ~1.1 MB | Chauffeur with gold tie clip + S-Class front, urban glass towers | Corporate / About / Booking CTA |
| `src/assets/DSC01240.jpg` | ~0.6 MB | Vertical: gloved chauffeur opening sedan rear door | Chauffeur service / mobile hero crop |
| `src/assets/DSC01134.jpg` | ~0.9 MB | Chauffeur at wheel, white gloves, BMW interior ambient light | Chauffeur experience / About human detail |
| `src/assets/DSC01148.JPG` | ~6.0 MB | Cadillac Escalade rear 3/4, golden hour urban | **Fleet SUV** / Corporate / Airport luggage capacity |
| `src/assets/DSC01102.JPG` | ~7.2 MB | BMW sedan + Escalade near Globe Life Field / Texas Live! | **Events** / dual-fleet showcase (note Luxlane plate) |
| `src/assets/DSC01854.JPG` | ~4.7 MB | Escalade cockpit / CarPlay / golden hour highway | Tech/safety / chauffeur POV detail (not hero) |
| `src/assets/DSC01855.JPG` | ~3.3 MB | Digital rearview mirror, highway bokeh | Atmospheric / airport journey detail |
| `src/assets/DSC01860.JPG` | ~4.0 MB | DFW / I-635 / Denton highway signs | **Airport** / service-area authenticity |

### C. Flagged / do not use as primary brand photography

| File | Reason |
|------|--------|
| `ChatGPT Image Feb 11, 2026, 06_41_20 PM.jpg` | ~~Filename indicates AI generation~~ **Client-approved 2026-07-31 override — see §1c-1.** Copied to `public/assets/official/group-coach-bus.jpg` and mapped as `IMAGES.fleetCoach`. Byte size (96,774) matches the original `chauffeur-coach-bus.jpg` asset record. |
| `ChatGPT Image Feb 14, 2026, 12_09_29 AM.png` | Filename indicates AI generation (~2.1 MB; size matches DFW pickup metadata) |
| `male-chauffeur-wearing-gloves-...utc (1).jpg` | Stock-style filename — verify ownership before use |
| `middle-aged-woman-exiting-car-...utc (1).jpg` | Stock-style filename — verify ownership before use |
| `5.png` | Unreferenced ~3.1 MB — inspect before use |
| `public/assets/hero-limo.jpg` | Stretch Maybach night shot — generic limo aesthetic; avoid with sedan copy |

### D. 3D / transparent vehicle assets
- **No `.glb` / `.gltf` found** in project (excluding node_modules)  
- **Fallback plan:** GSAP-driven 2D vehicle motion using official photos; no forced 3D on mobile  

### E. Recommended placement map (Phase 2 will centralize in code)

| Slot | Preferred asset | Fallback |
|------|-----------------|----------|
| Homepage hero (desktop) | `DSC01373.JPG` (S-Class + chauffeur) | `fleet-sedan.jpg` if compression only |
| Homepage hero (mobile) | Crop `DSC01240.jpg` or `DSC01431` | — |
| Fleet — Sedan | `DSC01373` / `fleet-sedan.jpg` | — |
| Fleet — SUV | `DSC01148.JPG` | `fleet-suv.jpg` |
| Fleet — Sprinter | Need dedicated official photo | `events-fleet-stadium.jpg` (stand-in) **REVIEW** |
| Fleet — Coach / Group | `group-coach-bus.jpg` (client-approved 2026-07-31, see §1c-1) | — |
| Airport | `DSC01860.JPG` + journey details `DSC01854`/`DSC01855` | Do not use coach image for sedan airport copy |
| Corporate | `DSC01431` | `DSC01373` |
| Events / group visual | `DSC01102.JPG` | — |
| Chauffeur | `DSC01240`, `DSC01134`, `DSC01431` | — |
| About | `DSC01431` / `DSC01134` | — |
| Booking CTA | `DSC01240` or `DSC01431` | — |
| Final CTA background | Dark crop of `DSC01373` or `DSC01148` | Avoid repeating identical full hero |
| Logo | Need real wordmark from client | Stop using favicon as logo long-term |

**Notes for Phase 2 image pipeline**
- Create `src/lib/image-map.ts` (or similar) with desktop/mobile `object-position`, width/height, alt text  
- Compress DSC originals to WebP/AVIF responsive sizes; keep grille, lights, wheels visible  
- Preload **only** hero  
- Lazy-load all others  
- Do not repeat one major image across many sections  

---

## 9. Design direction (approved brief — implement from Phase 2)

### Feel
International, executive, sophisticated, cinematic, custom — quality bar of premium automotive brands (inspiration only, do not copy).

### Color
Near black, deep charcoal, surface black, champagne / soft metallic gold (accent only), warm off-white, controlled neutrals. Premium gradients for depth — not purple/blue tech gradients, not orange-gold, not glow spam.

### Typography
- Elegant high-contrast **serif** for selected major headlines  
- Clean professional **sans** for UI/body/forms  
- Avoid Inter-as-default long term if it reads template; Phase 2 selects final pair  
- Strong hierarchy, short paragraphs, generous spacing  

### Avoid
AI-template look, gold particles everywhere, identical card grids, fake stats/testimonials/awards, emoji, generic limo clichés, excessive glass cards/badges, cartoon motion.

### Motion direction
Single cinematic system: GSAP + ScrollTrigger primary; Framer only for small React UI if needed; Lenis optional if stable. Respect `prefers-reduced-motion`. Clean GSAP teardown. Horizontal scroll only where it adds value. Short session loader once. No 3D unless asset quality + performance allow.

---

## 10. Technical decisions

1. Keep Vite SPA + TanStack Router architecture.  
2. Centralize business facts in expanded `site-data` (Phase 2).  
3. Centralize images in an image map; rewire `.asset.json` or replace with direct imports of optimized client photos.  
4. Preserve Supabase form inserts; plan Edge Function for email later.  
5. Prepare embed/link to existing `/book` system — do not fake confirmation.  
6. Prefer official DSC photos over ChatGPT/stock/low-res placeholders.  
7. Use 2D GSAP vehicle motion unless a professional GLB appears.  
8. Remove or quarantine AI-leaning patterns (gold particles default, unused R3F badge pipeline, disconnected 900+ line home sections) during rebuild — not in Phase 1.  
9. Fix `/airport` missing import when touching that file.  
10. Old site data wins for contact/pricing/cancellation/services categories when conflict is clear; numeric pax/bags from current `site-data` kept until client confirms.

---

## 11. Technical risks

| Risk | Severity | Notes |
|------|----------|-------|
| Asset URL collapse to 6 low-res files | High | Brand photography broken locally |
| Logo = favicon | High | Weak branding |
| Email sending removed | High for ops | Forms store only |
| WhatsApp number conflict | High | Wrong number = lost leads |
| `/airport` missing import | High | Page may fail |
| Dead cinematic homepage code | Medium | Confusion / bundle weight |
| Framer / R3F unused weight | Medium | Performance |
| Open anon insert + no CAPTCHA | Medium | Spam risk |
| Hero limo vs sedan copy mismatch | Medium | Trust/credibility |
| Luxlane plate/stickers in photos | Medium | Brand consistency — review |
| README still says TanStack Start | Low | Docs drift |

---

## 12. Files recommended for modification (later phases)

### Phase 2 (next)
- `PROJECT_SPEC.md` (update)  
- `src/lib/site-data.ts` (expand: contact, services, fleet, policies, areas)  
- **New** `src/lib/image-map.ts` (or `src/content/images.ts`)  
- `src/styles.css` (design tokens)  
- `src/routes/__root.tsx` (fonts if changed)  
- `src/components/site-nav.tsx`  
- `src/components/site-layout.tsx` / `site-footer.tsx` / `logo.tsx`  
- Optimize/copy selected DSC images into `public/assets/` or `src/assets/official/`  

### Phase 3+
- `src/components/luxury/*` (rebuild loader/reveals; drop particles default)  
- `src/routes/index.tsx` (homepage cinematic journey)  
- Service/fleet/corporate/airport/events routes  
- `src/components/lead-form.tsx`, `booking-card.tsx`  
- SEO: `__root`, per-route `head`, robots/sitemap  

### Do not casually rewrite
- Working Supabase client + migrations  
- Form field contracts matching DB columns  
- Unrelated shadcn `components/ui/*` unless needed  

---

## 13. Phased implementation plan

**Phase 2 — Data + foundation**  
Normalize contact/fleet/services/policies from this spec; image map; tokens; typography; sticky header + accessible mobile nav. No full homepage redesign yet beyond foundation.

**Phase 3 — Loader + hero + reveals**  
Session loader; cinematic hero with official sedan-appropriate image; vehicle entrance; reusable reveal variants; reduced-motion.

**Phase 4 — Story sections**  
Value proposition; services storytelling (editorial, not card spam); horizontal/pinned systems where justified.

**Phase 5 — Fleet + verticals**  
Cinematic fleet; corporate; airport; group — verified copy/data only.

**Phase 6 — Close homepage**  
Chauffeur; booking steps; reviews (empty state or omit until real); final CTA; footer with verified contact/social.

**Phase 7 — Sitewide polish**  
Internal pages; forms + booking embed decision; SEO/schema; a11y; performance; breakpoint QA; conflict resolutions confirmed by client.

---

## 14. Completed / remaining

### Completed (Phase 1)
- [x] Audit current codebase architecture, routes, forms, Supabase  
- [x] Review old website pages for company, services, fleet, rates, policies, contact  
- [x] Inventory images (public, DSC, flagged AI/stock)  
- [x] Document conflicts, missing data, risks  
- [x] Write this `PROJECT_SPEC.md`  
- [x] No visual design changes made  

### Completed (Phase 2)
- [x] Centralized `site-data.ts` + client decisions  
- [x] Centralized `image-map.ts` + official DSC copies  
- [x] Design tokens, Manrope + Cormorant, global overflow/focus styles  
- [x] Premium sticky header + accessible mobile nav  
- [x] Brand/geography/contact cleanup across key routes  
- [x] Fix `/airport` import; typecheck + build  

### Completed (Phase 3)
- [x] Cinematic session loader  
- [x] Full-viewport hero rebuild with GSAP entrance  
- [x] Horizontal ScrollTrigger journey (6 slides)  
- [x] Pinned storytelling (4 services)  
- [x] 2D vehicle object scroll motion  
- [x] Multi-image homepage using official DSC set  
- [x] Booking experience visual rebuild (Supabase preserved)  
- [x] Mobile fallbacks + reduced-motion  
- [x] Image compression for official assets  
- [x] Typecheck + build  

### Remaining (blocked on Phase 4 approval)
- [x] Signature Journeys pinned-section overlap/animation/layout hotfix (2026-07-31, see §1c-1)
- [x] Service Areas SEO rebuild, rejected-image replacement, Join Our Team feature (2026-08-11, see §1c-32)
- [x] Join Our Team production-readiness pass — migration audit, recovered legal copy, compliance-checkbox gap fix (2026-08-11, see §1c-33)
- [x] Clienity CRM integration for Join Our Team — Driver/Company Partner/Referral Partner (2026-08-11, see §1c-34)
- [x] Join Our Team pathway card media differentiation pass (2026-08-11, see §1c-35)
- [x] Join Our Team media replacement round 2 — stricter never-used-anywhere rule (2026-08-12, see §1c-36)
- [x] Blog / Insights section — 10 articles, SEO, nav/sitemap wiring (2026-08-12, see §1c-37)
- [x] Sitewide mobile-first production audit — 210-combination sweep, 0 issues (2026-08-12, see §1c-38)
- [x] AI Concierge architecture built (knowledge base, Edge Function, frontend UI) — not yet live, needs API key + deployment (2026-08-12, see §1c-39)
- [x] Mobile UX polish pass (floating-element overlap, hero dead space, scroll-lock fix) + MyLimoBiz Client Login widget (2026-08-12, see §1c-40)
- [x] Services mobile gallery fix, dead local-form removal, forms/MyLimoBiz re-verified (2026-08-12, see §1c-41)
- [x] AI Concierge migrated off Supabase onto a Netlify Function (Gemini), deployed with a real production API key as of 2026-08-14 (model-availability fixed twice based on real live-key errors reported back) — see §1c-42
- [x] Google Ads tracking (AW-18237817494) + conversion/engagement events (2026-08-14, see §1c-43)
- [x] Legal pages premium redesign + MyLimoBiz Client Login widget fixes (mobile scroll-into-view, sitewide "My Account" state) (2026-08-14, see §1c-44)
- [x] Privacy Policy updated with client-approved SMS/TCPA consent content verbatim (2026-08-14)
- [x] Final production verification pass — clean across the board (2026-08-14, see §1c-45)
- [ ] AI Concierge: live endpoint confirmed deployed and reachable but returns the fallback, not real Gemini replies — code re-verified correct; check `GEMINI_API_KEY` and function logs in the Netlify dashboard (see §1c-45)
- [ ] Corporate Transportation Clienity form still not finished on Clienity's side — `/corporate` correctly stays on the Supabase `LeadForm` until a real embed URL exists (see §1c-34/§1c-41)  
- [ ] Further services storytelling refinements beyond homepage  
- [ ] Dedicated Sprinter photography (Coach resolved 2026-07-31 — see §1c-1)  
- [ ] LCT Instagram URL / logo wordmark  
- [ ] Booking embed + email Edge Function  
- [ ] Device visual QA confirmation  
- [ ] Corporate Transportation Clienity form needs finishing in the Clienity dashboard before it can be wired to `/corporate` (see §1c-34)  
- [ ] "Luxlane" vs "LCT Universal" brand-name inconsistency on the live Driver Application Clienity form needs client review (see §1c-34)  
- [ ] Domain-migration dashboard checks (MyLimoBiz allowed origins, Clienity embed-domain settings, old-site tracking comparison) — see §1c-34 checklist  
- [ ] The Supabase `driver_applications`/`company_partner_applications`/`referral_partner_applications` migration is written but was never applied live, and is now disconnected from the UI pending Clienity being proven in production — see §1c-33/§1c-34  

---

*End of Phase 3. Stop here pending approval to begin Phase 4.*
