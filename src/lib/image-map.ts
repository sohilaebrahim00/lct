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
  fleetSedan: {
    src: "/assets/official/sedan-virgin-hotels.jpg",
    alt: "Executive Sedan — Mercedes-Benz S-Class outside a Dallas hotel",
    objectPositionDesktop: "50% 45%",
    objectPositionMobile: "50% 40%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07 (media refresh pass), source IMG_0680.HEIC — sharper front 3/4 shot with a cleaner, more premium backdrop (Virgin Hotels valet) than the previous hero-sclass-chauffeur.jpg, which had a busier street/pickup-truck background. That file is retained on disk but no longer referenced.",
  },
  fleetSuv: {
    src: "/assets/official/suv-escalade-corporate.jpg",
    alt: "Executive SUV — Cadillac Escalade in golden-hour light",
    objectPositionDesktop: "50% 42%",
    objectPositionMobile: "55% 38%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07, source IMG_8626.JPEG — front 3/4 in golden-hour light against a clean corporate-park backdrop, stronger than the previous fleet-escalade.jpg (flatter light, rear 3/4 angle). That file is retained on disk but no longer referenced.",
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
    alt: "LCT Universal executive coach bus with chauffeur boarding at a covered arrival area",
    objectPositionDesktop: "40% 50%",
    objectPositionMobile: "45% 45%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07, source IMG_1156.HEIC — sharp branded livery shot at a covered pickup area, replacing the group-coach-bus.jpg crop previously used here (that photo remains in use for `hero` and `groupCoachStory`). Used by the /fleet page Coach chapter.",
  },
  fleetCoachJourney: {
    src: "/assets/official/coach-sideprofile-day.jpg",
    alt: "LCT Universal executive coach bus, full side profile in daylight",
    objectPositionDesktop: "50% 45%",
    objectPositionMobile: "50% 42%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07, source IMG_1500.HEIC — a second, distinct new coach photograph (not a crop of the hero photo) for the HorizontalJourney fleet slide, so the site now has 3 genuinely different bus photographs rather than 3 crops of one.",
  },
  groupCoachStory: {
    src: "/assets/official/group-coach-bus.jpg",
    alt: "LCT Universal chauffeur beside the executive coach bus for group transportation",
    objectPositionDesktop: "38% 42%",
    objectPositionMobile: "45% 40%",
    aspectRatio: "3 / 2",
    notes:
      "Same source as `hero` (group-coach-bus.jpg) with a narrative mid-shot crop for PinnedStories' Group Transportation chapter. `fleetCoach`/`fleetCoachJourney` moved to two new, distinct coach photographs in the 2026-08-07 pass, so this source photo is now used only twice sitewide (down from four times).",
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
    objectPositionMobile: "50% 40%",
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
