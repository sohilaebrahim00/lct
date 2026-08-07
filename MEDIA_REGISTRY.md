# Media Registry — LCT Universal

Rebuilt from scratch 2026-08-07 during the Final Art Direction pass, after a large batch of new professional photos and videos was added to `/public/assets`. Updated the same day (final production pass) with a new Hero image. **Supersedes every previous version of this file** — do not reference the pre-2026-08-07 registry; the photo pool and nearly every assignment below changed. Source of truth for the mapping itself is `src/lib/image-map.ts`; this file is the human-readable page/section/reason view plus the video registry and the raw-asset inventory.

**Hero image, updated same day**: `hero` now points at `hero-fleet-lineup.jpg` (source: `WhatsApp Image 2026-08-07 at 4.18.45 PM.jpeg`, found in the client's Downloads folder rather than `public/assets` as stated — the complete fleet, 5 vehicles + the branded coach bus, lined up together). `group-coach-bus.jpg` (the previous `hero` image) remains in active use for `groupCoachStory`.

---

## 1. Raw asset inventory — everything found in `/public/assets`

Every file was opened and inspected manually (HEIC files converted to JPEG first — this environment has no native HEIC viewer — and every video frame-sampled) before any assignment was made. Nothing below was assigned "randomly" or left to a filename guess.

### Selected and processed into `public/assets/official/` (this pass)

| Processed file | Original source | What it shows | Notes |
|---|---|---|---|
| `sedan-virgin-hotels.jpg` | `IMG_0680.HEIC` | Black S-Class, front 3/4, valet stand outside Virgin Hotels, second S-Class in background | Sharper and cleaner-backdrop than the sedan photo it replaces |
| `suv-escalade-corporate.jpg` | `IMG_8626.JPEG` | Black Cadillac Escalade, front 3/4, golden-hour light, corporate office park | Replaces a flatter-lit rear 3/4 shot |
| `sprinter-exterior.jpg` | `IMG_2444.PNG` | Black Mercedes-Benz Sprinter (Legends conversion), front 3/4, exterior lot | **The first real Sprinter photo this project has ever had** — see §4 |
| `sprinter-interior-cream.jpg` | `IMG_0964.HEIC` | Sprinter interior — 4 cream-leather captain's chairs, panoramic sunroof panels, rear TV | Companion interior shot for the Sprinter |
| `coach-airport-arrival.jpg` | `IMG_1156.HEIC` | Branded "LCT Universal Executive Transports" coach bus, chauffeur boarding, covered arrival area | Airport-adjacent context, sharp brand livery |
| `coach-sideprofile-day.jpg` | `IMG_1500.HEIC` | Branded coach bus, full side profile, bright daylight | A genuinely different bus photo, not another crop of the same one |
| `events-stadium-v2.jpg` | `IMG_8624.JPEG` | Escalade + BMW 7-Series outside Globe Life Field / Texas Live! | Sharper, higher-resolution reshoot of the same location as the previous events photo |
| `airport-dfw-sign-silver.jpg` | WhatsApp image, 2026-08-03 7:29:59 PM | The silver "DFW" monument sign, sunny day, flowers in foreground | Unmistakably DFW Airport — replaces generic highway signage |
| `airport-dfw-sign-red.jpg` | WhatsApp image, 2026-08-03 7:29:08 PM | The red "DFW" letter sculpture, different location on campus | Second, distinct DFW landmark photo |
| `chauffeur-door-service-v2.jpg` | `IMG_8625.JPEG` | Chauffeur in white gloves, door open, S-Class rear 3/4, downtown backdrop | Sharper and richer context than the photo it replaces |
| `chauffeur-corporate-portrait-v2.jpg` | `IMG_8628.JPEG` | Chauffeur standing beside S-Class, downtown high-rise construction backdrop | Sharper, higher-resolution version of the same concept |
| `cabin-premium-experience.jpg` | `IMG_2438.PNG` | Back-seat passenger POV — chauffeur driving, two chilled FIJI waters in the console, downtown street ahead | Authentic in-cabin passenger experience |

### Video, upgraded

| File | Source | What it shows | Notes |
|---|---|---|---|
| `src/assets/video/hero-driving.mp4` | `IMG_8718.MP4`, trimmed 1.0s–5.5s | Chauffeur in white gloves opening the rear door of an S-Class, downtown Dallas high-rises behind him | Replaces the previous Hero clip (a highway driving montage) with a sharper, more specific door-service moment — same placement (Hero "O"), same trim/encode conventions (400px wide, H.264, no audio, ~398KB) |

### Inspected, not selected this pass (documented so nothing gets assigned "randomly" later either)

| File(s) | What it shows | Why not used |
|---|---|---|
| `IMG_1986.JPG.jpeg`, `IMG_1991.JPG.jpeg`, `IMG_8627.PNG`, `IMG_9612.JPEG` | S-Class exterior shots at various locations (front lawn, marble hotel entrance, Hampton Inn at night, The Westin at night) | Good quality but stored sideways (need a rotation fix before use) and redundant with `sedan-virgin-hotels.jpg`, which was the strongest of the sedan set. Kept on disk as backup options if a page ever needs a *third* distinct sedan crop. |
| `IMG_8620.JPEG` | S-Class + BMW 7-Series, night, strip-mall parking lot | Busier/less premium background than `events-stadium-v2.jpg`; redundant subject matter |
| `IMG_8629.PNG` | 4-vehicle fleet lineup (Escalade, S-Class, BMW 7, GMC Yukon) at dusk with the Dallas skyline | Genuinely strong "full fleet" shot — flagged as the best candidate if a future pass wants a dedicated fleet-overview hero; not wired into a specific section this pass to keep this pass scoped to fixing identified gaps/mismatches rather than adding new placements |
| `IMG_0536.HEIC`, `IMG_0537.JPG.jpeg` | Sprinter interior (wine/burgundy leather, red ambient lighting, Apple TV on the rear screen) | A second, moodier Sprinter interior option; `sprinter-interior-cream.jpg` (brighter, wider shot) was judged the stronger single choice |
| `IMG_9079/9081/9082/9090/9093/9094.MP4` | Night driving on the airport tarmac, a private jet visible, ground crew in hi-vis — genuine private-aviation transfer footage | Real, unique content (literal airport-tarmac footage), but shot at low resolution (464×832 / 848×480) — not sharp enough for a premium web placement. Flagged as the single best case for the client to supply a higher-resolution re-shoot of the same moment. |
| `IMG_8591.MOV`, `IMG_8600.MOV`, `IMG_8709.MOV`, `IMG_1979.MP4`, `IMG_2446.MP4` | Chauffeur + Escalade intro cutting to a "Coach" retail storefront (8591); daytime and nighttime in-cabin driving POV shots, downtown Dallas (the rest) | Good quality, but this pass added only one video change (the Hero upgrade) per "use videos only where they actually improve the experience — do not use video just because it exists." These are documented here as strong candidates if the client wants video reintroduced elsewhere later. |
| `IMG_0299.MOV` (4K) | Chevrolet Suburban, exterior walk-around, industrial parking lot | Highest raw resolution of anything supplied, but the vehicle isn't in this project's fleet taxonomy (Sedan/SUV/Sprinter/Coach) and the backdrop isn't premium |
| `IMG_9085.MP4` | GMC Yukon Denali, parking garage, night | Same reason — not in the site's fleet taxonomy |
| `IMG_9088.MP4` | Steering-wheel POV, daytime, apartment-complex street | Least premium backdrop of the driving clips |
| `chauffeur.jpg`, `fleet-sedan.jpg`, `fleet-sprinter.jpg`, `fleet-suv.jpg`, `hero-limo.jpg`, `interior.jpg` (all at `public/assets/`, not `official/`) | Pre-photography-handoff template placeholders | Unchanged from prior passes — not referenced anywhere, retained on disk only |

---

## 2. Current `image-map.ts` registry — key, file, page/section, reason

| Key | File | Page — Section | Reason |
|---|---|---|---|
| `hero` | `hero-fleet-lineup.jpg` | Home — Hero | **Updated 2026-08-07** — client-supplied photo of the complete fleet (5 vehicles + coach bus) lined up together, an even stronger "One Fleet" statement than the bus alone. Source found in the client's Downloads folder (a WhatsApp export), not `public/assets` as stated. |
| `fleetSedan` | `sedan-virgin-hotels.jpg` | Home — HorizontalJourney (Sedan slide); Home — BookingExperience media panel | Sedan section → sedan only, sharpest available sedan photo |
| `fleetSuv` | `suv-escalade-corporate.jpg` | Home — HorizontalJourney (SUV slide); Home — VehicleObjectJourney; `/services` Family Transportation; `/fleet` SUV chapter | SUV section → SUV only, best-lit available Escalade photo |
| `fleetSprinter` | `sprinter-exterior.jpg` | Home — HorizontalJourney (Sprinter slide) | The real vehicle, finally — resolves the top gap from the prior pass |
| `sprinterInterior` | `sprinter-interior-cream.jpg` | `/fleet` — Sprinter chapter | Companion interior shot so the /fleet page shows the cabin, not a repeat of the homepage's exterior slide |
| `fleetCoach` | `coach-airport-arrival.jpg` | `/fleet` — Coach chapter | Coach section → coach only; sharp branded livery, airport-adjacent context |
| `fleetCoachJourney` | `coach-sideprofile-day.jpg` | Home — HorizontalJourney (Coach slide) | A second, genuinely different coach photograph — not another crop of the hero image |
| `groupCoachStory` | `group-coach-bus.jpg` | Home — PinnedStories "Group Transportation" | Kept — narrative mid-shot crop, still a good fit; frees the other two coach placements to use fresh photos |
| `events` | `events-stadium-v2.jpg` | Home — PinnedStories "Event Transportation"; `/events` PageHero; `/services` Event Transportation | Events → groups/executive events; sharper reshoot of the same verified location |
| `airport` | `airport-dfw-sign-silver.jpg` | Home — HorizontalJourney/PinnedStories "Airport Transfers"; `/services` Airport Transportation | Airport → an actual, unmistakable DFW Airport landmark, not generic highway signage |
| `airportGateway` | `airport-dfw-sign-red.jpg` | `/airport` PageHero | A second, distinct DFW landmark shot so the page hero doesn't repeat the homepage composition |
| `chauffeur` | `chauffeur-door-service-v2.jpg` | Home — ChauffeurSection (floating card); `/services` Corporate Transportation; `/events` filmstrip "Weddings & Ceremonies" | Meet & greet / door-service moment, sharper and richer-context than the previous photo |
| `chauffeurPortrait` | `chauffeur-corporate-portrait-v2.jpg` | Home — ChauffeurSection (main image) | Chauffeur/team imagery, sharper version of the same concept |
| `aboutPortrait` | `chauffeur-corporate-portrait-v2.jpg` | `/about` — mission portrait | Distinct (tighter head-and-shoulders) crop of the same new source |
| `corporate` | `chauffeur-corporate-portrait-v2.jpg` | `/corporate` PageHero | Corporate → executive/business imagery; distinct crop, same new source |
| `corporateStory` | `chauffeur-corporate-portrait-v2.jpg` | Home — PinnedStories "Corporate Transportation" | Distinct (building-forward, wider) crop of the same new source |
| `fleetHero` | `chauffeur-interior.jpg` | `/fleet` PageHero | Unchanged — still an appropriate "standard held across the fleet" atmosphere shot |
| `chauffeurInterior` | `chauffeur-interior.jpg` | Home — ChauffeurSection (floating card) | Unchanged |
| `chauffeurAvailability` | `chauffeur-interior.jpg` | Home — ServiceAvailability circular badge | Unchanged (added 2026-08-06, replaced a video) |
| `about` | `chauffeur-interior.jpg` | `/about` PageHero | Unchanged — professional chauffeur imagery |
| `bookingCta` | `chauffeur-door-service-v2.jpg` | `/contact` PageHero | Luxury transportation imagery; distinct crop from `chauffeur`, same new source |
| `bookExperience` | `cabin-premium-experience.jpg` | `/book` — intro accent | **New placement.** Book → premium reservation experience; `/book` previously had no image anywhere on the page |
| `valueCabinExperience` | `cabin-premium-experience.jpg` | Home — ValueEditorial ("Quiet exactness. Every mile.") | **New placement, 2026-08-08 correction pass.** Client-specified exact replacement for this section's image, swapped in for `cockpit`. Same source as `bookExperience` (IMG_2438.PNG) but a taller, higher crop favoring the windshield/street view and the chauffeur — distinct from `bookExperience`'s lower, cupholder-inclusive crop, and on a different page, so neither placement repeats the other's framing. |
| `cockpit` | `cockpit-highway.jpg` | `/reviews` PageHero; `/events` filmstrip "Multi-Day Programs" | **Home — ValueEditorial reassigned to `valueCabinExperience` (2026-08-08)** — still used on `/reviews` and `/events` |
| `rearview` | `rearview-highway.jpg` | Home — FinalCta; `/service-areas` PageHero | Unchanged — no clearly superior replacement in the new batch for this specific "mirror macro" concept |
| `legacyStretchLimo` | `hero-limo.jpg` | Not used anywhere | Unchanged — excluded from brand use |

---

## 3. Same-page repetition check

No image repeats within a single page. Cross-page reuse is limited to the same disciplined pattern already established: a source photo used more than once always gets a **distinct crop and framing** per placement (documented in each `image-map.ts` entry's `notes` field). The heaviest remaining reuse:

- `chauffeur-corporate-portrait-v2.jpg` — 4 uses (`chauffeurPortrait`, `aboutPortrait`, `corporate`, `corporateStory`), each a different crop, each on a different page except `chauffeurPortrait`/`corporateStory` which are both on the homepage but in sections far apart (ChauffeurSection vs. PinnedStories) with very different framing (person-centered vs. building-forward).
- `chauffeur-interior.jpg` — 4 uses (`fleetHero`, `chauffeurInterior`, `chauffeurAvailability`, `about`), same pattern, unchanged from the prior pass.
- `group-coach-bus.jpg` — down to 2 uses (`hero`, `groupCoachStory`), from 4 before this pass.
- `cabin-premium-experience.jpg` — 2 uses (`bookExperience` on `/book`, `valueCabinExperience` on Home), distinct crops per placement (see §2), added 2026-08-08.

## 4. Known gaps — what's still missing

1. ~~Executive Sprinter — no photo existed~~ **Resolved this pass** (`sprinter-exterior.jpg` + `sprinter-interior-cream.jpg`).
2. **Airport tarmac / private-aviation footage exists but only at low resolution** (`IMG_9079` etc., 464×832). If the client can supply a higher-resolution re-shoot of the same tarmac/jet moment, it would be strong Hero- or Airport-page-video material.
3. **No literal luggage-handling or family/child-seat photo.** `fleetSuv` (Escalade) is used for `/services` Family Transportation as the closest available match — the right vehicle class, but nothing family-specific in frame.
4. **No dedicated fleet-overview "lineup" placement yet** — `IMG_8629.PNG` (4-vehicle lineup at dusk, Dallas skyline) is a strong candidate sitting unused; flagged for a future pass rather than wired in now, to keep this pass scoped to fixing identified problems.

## 5. Technical notes

- All new `official/` images were resized to a 1600–2000px long edge and re-compressed (`ffmpeg`, quality-scaled) from originals as large as 8MB/6000×4000 — final file sizes range 50KB–780KB, in line with this project's existing performance conventions.
- 5 source photos arrived as HEIC (iPhone format, not natively viewable in any browser besides Safari or renderable by this environment's tools) — converted to JPEG via `heic-convert` (a `libheif`-based decoder) before inspection or use. None of the *selected* photos are HEIC in their final form; all are standard JPEG.
- Every new `image-map.ts` entry carries independent `objectPositionDesktop`/`objectPositionMobile` values and a declared `aspectRatio`, same structure as every existing entry — nothing about the "swap the image without touching layout" pattern changed.
- Lazy-loading unchanged: every non-Hero image placement still uses `loading="lazy"`; the Hero image and Hero video remain the only eager-loaded media, per this project's established performance rules.
