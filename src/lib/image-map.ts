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
    // Changed 2026-08-11 — client explicitly rejected `coach-airport-arrival.jpg`
    // (dominant composition was the chauffeur's lower body/legs against wet
    // pavement, with the coach itself secondary) and required it removed
    // from this placement entirely, not re-cropped. Visually inspected every
    // remaining real Mini Coach photo in the project — only one other exists
    // (`coach-sideprofile-day.jpg`, previously used only for the homepage
    // HorizontalJourney slide/`fleetCoachJourney`) — so it's now used here
    // too. Different pages (this is /fleet + /events; `fleetCoachJourney` is
    // the homepage), and given distinct object-position/crop values below so
    // the two placements don't read as an identical repeated shot. The
    // rejected photo remains on disk, unreferenced, per the client's
    // "do not reuse in that section" instruction — not deleted.
    src: "/assets/official/coach-sideprofile-day.jpg",
    alt: "LCT Universal Executive Mini Coach, full side profile in daylight",
    objectPositionDesktop: "20% 50%",
    objectPositionMobile: "15% 48%",
    aspectRatio: "3 / 2",
    notes:
      "Used by the /fleet page's Executive Mini Coach chapter and the /events page. This is a single-rear-axle, cutaway-chassis shuttle bus (visually confirmed) — a Mini Coach, not a full-size motorcoach (see FLEET_VEHICLES in site-data.ts).",
  },
  fleetCoachJourney: {
    src: "/assets/official/coach-sideprofile-day.jpg",
    alt: "LCT Universal Executive Mini Coach, full side profile in daylight",
    objectPositionDesktop: "38% 45%",
    objectPositionMobile: "35% 42%",
    aspectRatio: "3 / 2",
    notes:
      "Added 2026-08-07, source IMG_1500.HEIC — for the homepage HorizontalJourney fleet slide. Same source photo as `fleetCoach` (see that key's 2026-08-11 note for why) — given a different horizontal crop/emphasis (frames toward the bus's front/branding rather than `fleetCoach`'s frame toward the open door) so the two placements, on different pages, don't read as an identical repeated shot.",
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
  joinTeamDriver: {
    // Media replacement 2026-08-11 (round 2) — round 1's
    // chauffeur-sclass-portrait.jpg was disqualified per explicit client
    // instruction: cards must use media never used anywhere on the site,
    // including in the round-1 Join Our Team pass itself. Full re-audit of
    // every media file in the project (public/assets, public/assets/official,
    // src/assets, src/assets/lct*/*.asset.json sidecars — confirmed
    // dead/unimported by no component importing from those directories,
    // plus 3 previously-unchecked Instagram video exports) found no unused
    // person-forward chauffeur photo that wasn't either a confirmed stock
    // photo (iStock/Shutterstock-style filenames: "male-chauffeur-...-utc.jpg",
    // studio lighting) or a near-duplicate frame from the same photoshoot
    // session as an already-used image (DSC01240.jpg/DSC01431 — same
    // chauffeur, suit, and downtown block as chauffeur-door-service-v2.jpg /
    // hero-sclass-chauffeur.jpg). This image — a tight, dramatic front
    // three-quarter shot of the black S-Class with no person — was unused
    // anywhere (public/assets/official/sedan-virgin-hotels-single.jpg,
    // previously untouched by any component), copied to join-driver.jpg.
    // Source is an unusually narrow portrait crop (880×2134, ~0.41:1) —
    // width-bound against this card's 4:3 container (full width always
    // shows; only vertical position has any effect) — verified via the
    // actual rendered crop, not assumed. Vertical position tuned from an
    // initial 62% (bare grille, hood ornament cropped out) down to 48%/50%
    // after a 5-way side-by-side comparison, so the Mercedes star, full
    // grille, and headlight light-line stay together in frame.
    src: "/assets/official/join-driver.jpg",
    alt: "LCT Universal Mercedes-Benz S-Class, front three-quarter view",
    objectPositionDesktop: "50% 48%",
    objectPositionMobile: "50% 50%",
    aspectRatio: "880 / 2134",
    notes: "Replaces round 1's chauffeur-sclass-portrait.jpg, disqualified for having already been used in the round-1 Join Our Team pass.",
  },
  joinTeamPartner: {
    // Media replacement 2026-08-11 (round 2) — see joinTeamDriver's note for
    // why round 1's fleet-lineup-dusk.jpg was disqualified (already used
    // within round 1 itself). Client specifically identified this photo by
    // description ("BMW + Cadillac near Globe Life Field") as a strong
    // Company Partners candidate. Real, previously-unused-anywhere photo —
    // public/assets/official/events-fleet-stadium.jpg, superseded by
    // events-stadium-v2.jpg for the /events page in an earlier round and
    // left unreferenced since — copied to join-company-partners.jpg. Two
    // distinct vehicles (BMW 7 Series, Cadillac Escalade) in the Texas
    // Live!/Globe Life Field entertainment district. Source 2000×1333
    // (3:2), mildly height-bound against the 4:3 container (full height
    // always shows, ~11% of width crops) — verified via rendered screenshot.
    src: "/assets/official/join-company-partners.jpg",
    alt: "LCT Universal executive vehicles — BMW 7 Series and Cadillac Escalade — near Globe Life Field, Arlington",
    objectPositionDesktop: "48% 55%",
    objectPositionMobile: "46% 55%",
    aspectRatio: "3 / 2",
    notes: "Replaces round 1's fleet-lineup-dusk.jpg, disqualified for reuse within the same Join Our Team section.",
  },
  joinTeamReferral: {
    // Media replacement 2026-08-11 (round 2) — see joinTeamDriver's note.
    // Client specifically identified this photo by description ("nighttime
    // hotel image with Mercedes S-Class and SUV") as a strong Referral
    // Partner candidate. Real, previously-unused-anywhere photo — a raw,
    // unprocessed file at public/assets/IMG_9612.JPEG (The Westin hotel
    // porte-cochère at night, S-Class in front of a second SUV) — re-encoded
    // via canvas (bakes in the EXIF rotation, resized to a 1600px long edge
    // for web weight: 3.6MB → 265KB) and saved as
    // public/assets/official/join-referral-partner.jpg. A premium
    // hotel-arrival moment reads as "VIP client experience," genuinely
    // distinct from joinTeamDriver's single-car close-up and
    // joinTeamPartner's daylight multi-vehicle fleet shot. Source is
    // portrait (2:3 after rotation) — width-bound against the 4:3 container
    // (full width always shows, ~50% of height crops), so the vertical
    // position was weighted down toward the vehicles rather than the
    // ceiling lighting — verified via rendered screenshot.
    src: "/assets/official/join-referral-partner.jpg",
    alt: "LCT Universal Mercedes-Benz S-Class and SUV at The Westin hotel entrance at night",
    objectPositionDesktop: "50% 68%",
    objectPositionMobile: "50% 70%",
    aspectRatio: "2 / 3",
    notes: "Replaces round 1's hero-sclass-chauffeur.jpg, disqualified for reuse within the same Join Our Team section.",
  },
  /** Blog hero/card imagery — added 2026-08-12 for the Insights section. Wide 3:2 sources chosen for a 16:9-ish editorial hero + 4:3 index card, each used by exactly one article so no two posts share a hero. */
  blogAirport: {
    src: "/assets/official/airport-dfw-highway.jpg",
    alt: "Highway signage for DFW International Airport",
    objectPositionDesktop: "50% 45%",
    objectPositionMobile: "50% 42%",
    aspectRatio: "3 / 2",
    notes: "Previously unused (superseded by airport-dfw-sign-silver.jpg for the /airport page). Used for the DFW Airport Transportation article.",
  },
  blogLoveField: {
    src: "/assets/official/airport-dfw-sign-red.jpg",
    alt: "The red DFW monument sign marking the gateway to Dallas–Fort Worth",
    objectPositionDesktop: "50% 45%",
    objectPositionMobile: "60% 42%",
    aspectRatio: "3 / 2",
    notes: "Reused from airportGateway (a distinct DFW sign photo from the one used on /airport itself) for the Love Field vs. DFW article — airport-themed but a different composition from blogAirport.",
  },
  blogExecutiveCar: {
    src: "/assets/official/hero-sclass-chauffeur.jpg",
    alt: "LCT Universal chauffeur and executive vehicle in a downtown Dallas business district",
    objectPositionDesktop: "38% 45%",
    objectPositionMobile: "40% 42%",
    aspectRatio: "3 / 2",
    notes: "Orphaned after the Join Our Team round-2 media swap (previously joinTeamReferral) — reused here for the Executive Car Service article.",
  },
  blogBooking: {
    src: "/assets/official/sedan-front-grille.jpg",
    alt: "Close-up of a Mercedes-Benz S-Class front grille and hood ornament",
    objectPositionDesktop: "50% 45%",
    objectPositionMobile: "50% 45%",
    aspectRatio: "3 / 2",
    notes: "Previously unused. Used for the What to Consider When Booking article.",
  },
  blogCorporate: {
    src: "/assets/official/fleet-lineup-dusk.jpg",
    alt: "LCT Universal fleet lineup — Cadillac Escalade, Mercedes-Benz S-Class, BMW 7 Series, and GMC Yukon Denali at dusk with the Dallas skyline",
    objectPositionDesktop: "50% 50%",
    objectPositionMobile: "50% 50%",
    aspectRatio: "2651 / 1103",
    notes: "Orphaned after the Join Our Team round-2 media swap (previously joinTeamPartner) — reused here for the Corporate Transportation Planning article.",
  },
  blogSprinter: {
    src: "/assets/official/sprinter-exterior.jpg",
    alt: "Executive Sprinter — Mercedes-Benz Sprinter van, exterior",
    objectPositionDesktop: "45% 50%",
    objectPositionMobile: "50% 50%",
    aspectRatio: "3 / 2",
    notes: "Reused from fleetSprinter for the Sprinter Van group-transportation article — same vehicle class the article is about.",
  },
  blogCoach: {
    src: "/assets/official/group-coach-bus.jpg",
    alt: "LCT Universal chauffeur beside the full-size executive motorcoach for group transportation",
    objectPositionDesktop: "38% 42%",
    objectPositionMobile: "45% 40%",
    aspectRatio: "3 / 2",
    notes: "Reused from groupCoachStory for the Mini Coach vs. Motor Coach comparison article.",
  },
  blogEvents: {
    src: "/assets/official/events-stadium-v2.jpg",
    alt: "LCT Universal executive vehicles near Globe Life Field, Dallas–Fort Worth",
    objectPositionDesktop: "50% 48%",
    objectPositionMobile: "55% 45%",
    aspectRatio: "3 / 2",
    notes: "Reused from events for the Corporate Events transportation-planning article.",
  },
  blogChauffeur: {
    src: "/assets/official/chauffeur-door-service.jpg",
    alt: "LCT Universal chauffeur in white gloves opening the door of an executive sedan",
    objectPositionDesktop: "55% 25%",
    objectPositionMobile: "55% 22%",
    aspectRatio: "2 / 3",
    notes: "Previously unused (the v1 door-service photo — v2 is used elsewhere for the `chauffeur`/`bookingCta` keys). Used for the Chauffeur Service Standards article.",
  },
  blogMeetGreet: {
    src: "/assets/official/sedan-virgin-hotels.jpg",
    alt: "LCT Universal Mercedes-Benz S-Class arriving at a hotel entrance",
    objectPositionDesktop: "50% 45%",
    objectPositionMobile: "50% 42%",
    aspectRatio: "1600 / 2134",
    notes: "Previously unused. Used for the Airport Meet-and-Greet article.",
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
