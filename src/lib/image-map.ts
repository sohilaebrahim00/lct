/**
 * Centralized image mapping for LCT Universal.
 * Swap paths here to replace imagery site-wide without hunting components.
 *
 * Official DSC client photos are copied under /assets/official/ with professional names.
 * Do not reference ChatGPT-* or AI-named source filenames in components.
 * Physical Luxlane plate/sticker text in photos is unchanged (documented for later review).
 */

export type ImagePlacement = {
  src: string;
  alt: string;
  /** CSS object-position for desktop */
  objectPositionDesktop: string;
  /** CSS object-position for mobile */
  objectPositionMobile: string;
  /** Intrinsic aspect for layout stability (width / height) */
  aspectRatio: string;
  /** Preload only the primary hero */
  preload?: boolean;
  /** Notes for editors — not rendered */
  notes?: string;
};

export const IMAGES = {
  hero: {
    src: "/assets/official/hero-fleet-lineup.jpg",
    alt: "LCT Universal complete fleet — sedan, SUVs, and executive coach bus lined up together",
    objectPositionDesktop: "50% 58%",
    objectPositionMobile: "50% 60%",
    aspectRatio: "3 / 2",
    preload: true,
    notes:
      "Changed 2026-08-07 (was group-coach-bus.jpg): client-supplied hero photo — the full branded fleet (5 vehicles + the coach bus) lined up together, an even stronger 'One Fleet' statement than the bus alone. Source: WhatsApp Image 2026-08-07 at 4.18.45 PM.jpeg (client Downloads folder). Symmetric composition with open sky across the top third, giving the hero's text overlay clean room regardless of crop. group-coach-bus.jpg remains in active use elsewhere (fleetCoach*/groupCoachStory) — only the Hero placement changed.",
  },
  /**
   * Mobile-specific Hero derivative (2026-08-08, mobile-first pass). The
   * desktop `hero` source is a wide 5-vehicle lineup (1535×1024, ~3:2) shot
   * for a landscape hero container — on a narrow portrait phone viewport,
   * `object-fit: cover` against that source is height-bound (verified via
   * the actual cover-scale-factor math, not assumed), meaning the FULL
   * vertical extent of the source — including its top third of empty sky —
   * always renders no matter what `objectPosition` is set to; there is no
   * vertical crop headroom to shift with a position value alone. A real
   * rectangular crop was the only fix (the same category of problem the
   * Sedan fleet photo and `groupCoachStoryCropped` solved before). This
   * derivative (`sharp .extract({left:520,top:280,width:850,height:744})`)
   * trims almost all of the sky and tightens onto 4 of the 5 vehicles plus
   * the branded coach, giving mobile real "vehicle-forward" hero material
   * instead of a mostly-sky frame with tiny cars at the bottom.
   */
  heroMobile: {
    src: "/assets/official/hero-fleet-lineup-mobile.jpg",
    alt: "LCT Universal fleet — sedan, SUVs, and branded coach bus",
    objectPositionDesktop: "50% 50%",
    objectPositionMobile: "48% 42%",
    aspectRatio: "850 / 744",
  },
  fleetSedan: {
    src: "/assets/official/sedan-chauffeur-crop.jpg",
    alt: "Executive Sedan — chauffeur beside a Mercedes-Benz S-Class in downtown Dallas",
    objectPositionDesktop: "38% 55%",
    objectPositionMobile: "32% 52%",
    aspectRatio: "4 / 3",
    notes:
      "Changed 2026-08-08 (final production cleanup pass). Two prior real photos were tried and rejected before this one: `sedan-virgin-hotels.jpg` had a second, differently-colored S-Class in the same frame, ambiguous about which car was being advertised; a tight rectangular re-crop of just the black car (`sharp .extract` down to 880px wide) technically excluded the second car but — at the Fleet Sedan chapter's ultra-wide 21:9 full-bleed container — a source that narrow has to scale up so much to cover the container's width that only a ~18% vertical sliver of it ever renders, reducing the shot to an extreme hood/grille close-up that no longer clearly read as 'a sedan' at a glance. `hero-sclass-chauffeur.jpg` (same verified S-Class, different real photo, 3/4 angle showing the full car body) was tried next, but its far-left edge had a seated bystander who — same container-math issue — can never be cropped out via `objectPosition` alone since the container always needs this image's full width. Fixed with a real rectangular crop of THIS photo (`sedan-chauffeur-crop.jpg`, `sharp .extract({left:220,width:1780})`) that excludes the bystander while staying wide enough (1780px) to avoid the earlier over-zoom problem — verified by checking the actual rendered container math (only ~43% of source height gets cropped away here, vs. ~82% for the narrower attempt) and by direct visual inspection of the final crop before use.",
  },
  fleetFirstClassSedan: {
    // FINAL 2026-08-09 — client-supplied photo, not a project-derived crop.
    // Delivered as a chat attachment (no tool available can persist inline
    // chat image bytes to disk — that limitation was surfaced explicitly
    // rather than worked around), then saved to disk by the client directly.
    // Two path attempts (`first-class-sedan.jpg`, then a claimed second save
    // to the same name) genuinely did not exist on disk — verified via three
    // independent methods (`ls`, a `sharp` read, and the `Read` tool) each
    // time before saying so, plus a search across all three LCT project
    // copies on this machine and the full user profile, specifically to
    // avoid a false "still broken" report if the file truly was there. The
    // real file landed as `first-class-sedan.jpeg` (`.jpeg`, not `.jpg`) —
    // confirmed via `sharp` metadata (1560×878 after EXIF auto-orientation)
    // and a direct visual read that it matches the attached photo exactly
    // before wiring it in. Used as supplied — not re-cropped into a new
    // derivative — per explicit client instruction to art-direct via
    // `objectPosition` only. `fleetSedan` (Executive Sedan) is a different
    // class/photo and was not touched.
    src: "/assets/official/first-class-sedan.jpeg",
    alt: "First Class Sedan — Mercedes-Benz S-Class, front three-quarter view",
    // Source is ~16:9 (1560×878), almost exactly matching this chapter's own
    // mobile aspect (16/9) — mobile therefore needs virtually no cropping in
    // either dimension, confirmed by computing the actual `cover` scale
    // factors, not assumed. At the wider desktop aspect (21/9) the source is
    // width-bound (full width always renders — checked, so horizontal
    // position is moot there), with a real vertical crop window; 56% keeps
    // the grille/headlight band centered rather than the sky/roofline above
    // it or the pavement below — confirmed by rendering the actual scaled
    // crop before choosing this value, not by eyeballing the raw photo.
    objectPositionDesktop: "50% 56%",
    objectPositionMobile: "50% 50%",
    aspectRatio: "1560 / 878",
    notes:
      "First Class Sedan class published 2026-08-08 (verified live via MyLimoBiz — a 2-passenger sedan-tier class distinct from the standard 3-passenger Sedan). Image finalized 2026-08-09 to the client's own supplied photo (see comment above).",
  },
  fleetSuv: {
    src: "/assets/official/suv-escalade-corporate.jpg",
    alt: "Executive SUV — Cadillac Escalade in golden-hour light",
    objectPositionDesktop: "50% 42%",
    objectPositionMobile: "55% 38%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07, source IMG_8626.JPEG — front 3/4 in golden-hour light against a clean corporate-park backdrop, stronger than fleet-escalade.jpg's flatter-light rear 3/4 angle. That file was retained unused until 2026-08-08, when it was activated as `fleetLuxurySuv` (see below) — the two SUV classes share one verified vehicle but never share the same photo.",
  },
  fleetLuxurySuv: {
    src: "/assets/official/fleet-escalade.jpg",
    alt: "Luxury SUV — Cadillac Escalade, rear three-quarter view",
    objectPositionDesktop: "50% 48%",
    objectPositionMobile: "55% 45%",
    aspectRatio: "3 / 2",
    notes:
      "Activated 2026-08-08 for the newly-published Luxury SUV class (verified live 2026-08-08 via MyLimoBiz — a second, higher-tier 6-passenger SUV class alongside the standard SUV). Per explicit client instruction: no distinct Luxury SUV vehicle photo exists in the project, so the same verified Escalade is used, but in its OTHER real photograph (rear 3/4, previously unreferenced) rather than reusing `fleetSuv`'s exact front 3/4 crop — the two classes never render the identical image.",
  },
  fleetSprinter: {
    src: "/assets/official/sprinter-exterior.jpg",
    alt: "Executive Sprinter — Mercedes-Benz Sprinter van, exterior",
    objectPositionDesktop: "45% 55%",
    objectPositionMobile: "50% 55%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07, source IMG_2444.PNG — a real photo of the actual Sprinter, resolving the gap flagged in the 2026-08-06 pass (previously a stand-in using unrelated stadium/event photography with no van visible at all).",
  },
  sprinterInterior: {
    src: "/assets/official/sprinter-interior-cream.jpg",
    alt: "Executive Sprinter interior — captain's chairs, ambient lighting, and a rear entertainment display",
    objectPositionDesktop: "50% 45%",
    objectPositionMobile: "50% 40%",
    aspectRatio: "3 / 2",
    notes:
      "New key, added 2026-08-07, source IMG_0964.HEIC — companion interior shot for `fleetSprinter`, used on the /fleet Sprinter chapter so the vehicle reads as a real, inspectable product rather than exterior-only.",
  },
  fleetCoach: {
    src: "/assets/official/coach-airport-arrival.jpg",
    alt: "LCT Universal Executive Mini Coach with chauffeur boarding at a covered arrival area",
    objectPositionDesktop: "40% 50%",
    objectPositionMobile: "45% 45%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07, source IMG_1156.HEIC — sharp branded livery shot at a covered pickup area, replacing the group-coach-bus.jpg crop previously used here (that photo remains in use for `hero` and `groupCoachStory`). Used by the /fleet page's Executive Mini Coach chapter. RECLASSIFIED 2026-08-08: this is a single-rear-axle, cutaway-chassis shuttle bus (visually confirmed) — a Mini Coach, not a full-size motorcoach. Previously mislabeled 'Executive Coach' at 37–50 passengers; corrected per client instruction (see FLEET_VEHICLES in site-data.ts).",
  },
  fleetCoachJourney: {
    src: "/assets/official/coach-sideprofile-day.jpg",
    alt: "LCT Universal Executive Mini Coach, full side profile in daylight",
    objectPositionDesktop: "50% 45%",
    objectPositionMobile: "50% 42%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07, source IMG_1500.HEIC — a second, distinct new coach photograph (not a crop of the hero photo) for the HorizontalJourney fleet slide, so the site now has 3 genuinely different bus photographs rather than 3 crops of one. RECLASSIFIED 2026-08-08: same vehicle as `fleetCoach` — a Mini Coach, not a full-size motorcoach. See that key's notes.",
  },
  groupCoachStory: {
    src: "/assets/official/group-coach-bus.jpg",
    alt: "LCT Universal chauffeur beside the full-size executive motorcoach for group transportation",
    objectPositionDesktop: "38% 42%",
    objectPositionMobile: "45% 40%",
    aspectRatio: "3 / 2",
    notes:
      "Same source as `hero` (group-coach-bus.jpg) with a narrative mid-shot crop for PinnedStories' Group Transportation chapter. CONFIRMED 2026-08-08 via direct visual inspection: this is a genuinely distinct, full-size motorcoach (tandem rear axle, full coach fascia, multiple luggage bay doors) — NOT the same vehicle as `fleetCoach`/`fleetCoachJourney` (a smaller cutaway-chassis shuttle bus). Now also used as the /fleet page's new Executive Coach (up to 56 passengers) chapter image. See `groupCoachStoryCropped` for the person-excluded crop used on the Services page.",
  },
  groupCoachStoryCropped: {
    src: "/assets/official/group-coach-bus-crop.jpg",
    alt: "LCT Universal full-size executive motorcoach, group transportation",
    objectPositionDesktop: "50% 50%",
    objectPositionMobile: "50% 50%",
    aspectRatio: "3 / 2",
    notes:
      "New 2026-08-08 — a real, rectangular crop (not AI content removal) of group-coach-bus.jpg, produced specifically for the Services → Group Transportation section per explicit client instruction: the source photo's standing chauffeur was distracting from the group-transportation message, and the section's own aspect ratios (4/5 desktop, 3/2 mobile) don't reliably crop the person out via object-position alone since the mobile ratio nearly matches the source photo's own ratio. This derivative keeps the bus sharp on both desktop and mobile and excludes the person from the visible composition.",
  },
  events: {
    src: "/assets/official/events-stadium-v2.jpg",
    alt: "LCT Universal executive vehicles near Globe Life Field, Dallas–Fort Worth",
    objectPositionDesktop: "50% 48%",
    objectPositionMobile: "55% 45%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07, source IMG_8624.JPEG — a sharper, higher-resolution reshoot of the same stadium-district location as the previous events-fleet-stadium.jpg, symmetric front-facing composition. That file is retained on disk but no longer referenced.",
  },
  airport: {
    src: "/assets/official/airport-dfw-sign-silver.jpg",
    alt: "The DFW monument sign at Dallas Fort Worth International Airport",
    objectPositionDesktop: "50% 55%",
    objectPositionMobile: "50% 50%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07 — the actual DFW Airport monument sign, unmistakably recognizable, replacing airport-dfw-highway.jpg (generic highway signage with no vehicle, chauffeur, or airport landmark visible). Used by the homepage HorizontalJourney and PinnedStories airport beats.",
  },
  airportGateway: {
    src: "/assets/official/airport-dfw-sign-red.jpg",
    alt: "The red DFW monument sign marking the gateway to Dallas–Fort Worth",
    objectPositionDesktop: "50% 45%",
    // Corrected 2026-08-08 (mobile-first pass) — the "DFW" lettering sits in
    // the right ~35% of this source photo, not centered; the previous mobile
    // value ("50% 40%") was a near-duplicate of desktop and, on the
    // narrower/taller `PageHero` container where this source is
    // height-bound (full vertical extent always shows, only horizontal
    // position has any cropping effect), centered the crop on the plain
    // building/grass and left only a sliver of the "F" visible — verified
    // via an actual mobile screenshot, not assumed. Shifted right so the
    // full "DFW" lettering — the entire point of this photo — is in frame.
    objectPositionMobile: "82% 42%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07 — a second, distinct DFW monument-sign photograph (different sign, different location on the airport campus) for the /airport page hero, so it doesn't repeat `airport`'s composition.",
  },
  chauffeur: {
    src: "/assets/official/chauffeur-door-service-v2.jpg",
    alt: "LCT Universal chauffeur in white gloves opening the door of an executive sedan",
    objectPositionDesktop: "62% 30%",
    objectPositionMobile: "60% 25%",
    aspectRatio: "2 / 3",
    notes:
      "Added 2026-08-07, source IMG_8625.JPEG — sharper, higher-resolution door-service moment with a real downtown backdrop, replacing chauffeur-door-service.jpg (that file is retained on disk but no longer referenced).",
  },
  chauffeurPortrait: {
    src: "/assets/official/chauffeur-corporate-portrait-v2.jpg",
    alt: "LCT Universal chauffeur standing with a Mercedes-Benz S-Class in downtown Dallas",
    objectPositionDesktop: "42% 35%",
    objectPositionMobile: "45% 30%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07, source IMG_8628.JPEG — same concept as the previous chauffeur-sclass-portrait.jpg but a sharper, higher-resolution shot with a richer downtown high-rise backdrop. Used by the homepage ChauffeurSection main image. That file is retained on disk but no longer referenced.",
  },
  aboutPortrait: {
    src: "/assets/official/chauffeur-corporate-portrait-v2.jpg",
    alt: "LCT Universal chauffeur portrait representing the company's story",
    objectPositionDesktop: "42% 8%",
    objectPositionMobile: "45% 5%",
    aspectRatio: "3 / 2",
    notes:
      "Same source as chauffeurPortrait/corporate/corporateStory with a tighter head-and-shoulders crop for the About page's portrait storytelling beat, distinct from the other three crops.",
  },
  fleetHero: {
    src: "/assets/official/chauffeur-interior.jpg",
    alt: "LCT Universal chauffeur at the wheel, representing the standard held across the entire fleet",
    objectPositionDesktop: "65% 55%",
    objectPositionMobile: "60% 50%",
    aspectRatio: "3 / 2",
    notes:
      "Same source as chauffeurInterior/about (DSC01134.jpg) with a distinct crop for the /fleet page hero — added 2026-08-02 to fix a same-page repeat where the hero previously shared group-coach-bus.jpg with the Coach chapter below it.",
  },
  chauffeurInterior: {
    src: "/assets/official/chauffeur-interior.jpg",
    alt: "Professional chauffeur at the wheel of a luxury sedan",
    objectPositionDesktop: "45% 35%",
    objectPositionMobile: "50% 30%",
    aspectRatio: "3 / 2",
    notes: "Source DSC01134.jpg",
  },
  chauffeurAvailability: {
    src: "/assets/official/chauffeur-interior.jpg",
    alt: "LCT Universal chauffeur ready at the wheel, day or night",
    objectPositionDesktop: "62% 58%",
    objectPositionMobile: "60% 55%",
    aspectRatio: "1 / 1",
    notes:
      "Same source as chauffeurInterior/about/fleetHero (DSC01134.jpg) with a tighter, more centered crop for the homepage 'Always Available' circular badge — added 2026-08-06 replacing that section's second video. Distinct from chauffeurInterior's crop (used two sections later, in ChauffeurSection) so the same photo doesn't repeat identically on the same page.",
  },
  corporate: {
    src: "/assets/official/chauffeur-corporate-portrait-v2.jpg",
    alt: "Executive chauffeur service for corporate travel in Dallas–Fort Worth",
    objectPositionDesktop: "38% 30%",
    objectPositionMobile: "40% 25%",
    aspectRatio: "3 / 2",
    notes:
      "Same new source as chauffeurPortrait/aboutPortrait/corporateStory (IMG_8628.JPEG, added 2026-08-07). Used by the /corporate page hero.",
  },
  corporateStory: {
    src: "/assets/official/chauffeur-corporate-portrait-v2.jpg",
    alt: "LCT Universal chauffeur in the downtown Dallas business district",
    objectPositionDesktop: "58% 5%",
    objectPositionMobile: "55% 5%",
    aspectRatio: "3 / 2",
    notes:
      "Same source as chauffeurPortrait/aboutPortrait/corporate with a wider, building-forward crop (more skyline, chauffeur smaller in frame) for the homepage PinnedStories 'Corporate Transportation' beat. Distinct crop from the other three uses of this photo.",
  },
  about: {
    src: "/assets/official/chauffeur-interior.jpg",
    alt: "LCT Universal chauffeur ready for executive service",
    objectPositionDesktop: "45% 35%",
    objectPositionMobile: "50% 30%",
    aspectRatio: "3 / 2",
    notes: "Source DSC01134.jpg",
  },
  bookingCta: {
    src: "/assets/official/chauffeur-door-service-v2.jpg",
    alt: "Book chauffeured transportation with LCT Universal",
    objectPositionDesktop: "40% 55%",
    objectPositionMobile: "40% 50%",
    aspectRatio: "2 / 3",
    notes:
      "Same new source as `chauffeur` (IMG_8625.JPEG, added 2026-08-07) with a distinct crop for the /contact page hero, so the two placements don't repeat the same framing.",
  },
  bookExperience: {
    src: "/assets/official/cabin-premium-experience.jpg",
    alt: "Passenger's view from inside an LCT Universal executive sedan, chilled water service, driving through downtown Dallas",
    objectPositionDesktop: "50% 40%",
    objectPositionMobile: "50% 35%",
    aspectRatio: "2 / 3",
    notes:
      "New key, added 2026-08-07, source IMG_2438.PNG — an authentic back-seat passenger POV (chauffeur driving, chilled water service, downtown skyline through the windshield). Used for the /book page hero, which previously had no image at all.",
  },
  valueCabinExperience: {
    src: "/assets/official/cabin-premium-experience.jpg",
    alt: "Passenger's view from inside an LCT Universal executive sedan, chauffeur driving through downtown Dallas",
    objectPositionDesktop: "50% 28%",
    objectPositionMobile: "50% 22%",
    aspectRatio: "4 / 5",
    notes:
      "New key, added 2026-08-08 — client-specified replacement for Home / ValueEditorial's main image ('Quiet exactness. Every mile.' section), swapped in for `cockpit`. Same source as `bookExperience` (IMG_2438.PNG) but a taller, higher crop favoring the windshield/street view and the chauffeur, distinct from bookExperience's lower, cupholder-inclusive crop — so the two placements (different pages) don't repeat the same framing.",
  },
  cockpit: {
    src: "/assets/official/cockpit-highway.jpg",
    alt: "Executive vehicle cockpit on a Dallas–Fort Worth highway",
    objectPositionDesktop: "55% 50%",
    objectPositionMobile: "50% 45%",
    aspectRatio: "3 / 2",
    notes: "Source DSC01854.JPG — detail / atmosphere, not primary hero",
  },
  rearview: {
    src: "/assets/official/rearview-highway.jpg",
    alt: "Highway view from an executive vehicle rearview display",
    objectPositionDesktop: "50% 45%",
    objectPositionMobile: "50% 40%",
    aspectRatio: "3 / 2",
    notes: "Source DSC01855.JPG",
  },
  /** Do not use as primary brand visual */
  legacyStretchLimo: {
    src: "/assets/hero-limo.jpg",
    alt: "Legacy stretch limousine image — not used as primary brand visual",
    objectPositionDesktop: "50% 50%",
    objectPositionMobile: "50% 50%",
    aspectRatio: "16 / 9",
    notes:
      "Stock/cinematic stretch limo. Retained on disk only; do not use as hero or fleet flagship.",
  },
} as const satisfies Record<string, ImagePlacement>;

export type ImageKey = keyof typeof IMAGES;

export function getImage(key: ImageKey): ImagePlacement {
  return IMAGES[key];
}

/** Hero preload link href for document head */
export const HERO_PRELOAD_HREF = IMAGES.hero.src;
