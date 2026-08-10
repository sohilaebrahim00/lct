# Old Site → New Site Full Feature Parity Audit

Live audit of `https://lctuniversal.com/` performed 2026-08-08 (real page fetches, not assumed content) as part of the "Final Client Revision + Old Site Parity Pass." This document is the source of truth for what exists on the old site, what the new site currently does, and what action was taken. See `PROJECT_SPEC.md` §1c-17 for the full narrative of this pass and `FLEET_VEHICLES`/`RATES`/`CANCELLATION_SUMMARY` in `src/lib/site-data.ts` for the underlying verified data.

**Statuses used below:** `MATCHED` · `IMPROVED` · `CLIENT-UPDATED` (client's new instructions intentionally override old-site content) · `MISSING` · `NOT APPLICABLE` · `REQUIRES CLIENT CONFIRMATION`

---

## 1. Page / Section Parity

| Feature | Old Site | New Site | Status | Action Taken | Still Missing |
|---|---|---|---|---|---|
| Home | `/home-998021` — long single-scroll page (Hero, Services, About, Fleet teaser, Why Choose Us, Safety, FAQ, Rates, Get In Touch, Footer) | `/` — cinematic multi-section homepage (Hero, Value, Journey, Vehicle, Stories, Chauffeur, CTA) | IMPROVED | New site's homepage already covers the old site's narrative beats with a more premium production; not a literal copy by design (client instruction: "premium and concise," "do not copy the old visual design") | — |
| About | `/about` | `/about` | MATCHED | — | — |
| Services | `/services` (6 services incl. "Large Group Transfers") | `/services` (6 chapters incl. "Group Transportation") | MATCHED | Group Transportation chapter image swapped to the verified client-supplied photo, cropped to exclude a distracting standing person (see §4) | — |
| Contact / Get In Touch | `/contact-us` | `/contact` | MATCHED | Added missing "Closed Sundays" line to the Hours card (was in `site-data.ts` but never rendered) | — |
| Fleet | `/our-fleet` (4 categories, no pricing shown) | `/fleet` (now 5 chapters) | CLIENT-UPDATED | See §2 (Fleet Data) — client corrections override old-site labels/capacities per explicit instruction | — |
| Join Our Team | `/partners-app` (link hub → 3 application forms: driver, partner, affiliate) | Not present | MISSING | Not built this pass — old site's version is 3 detailed application forms (license/insurance uploads, background-check consent, commission payout preferences) that would need real backend handling, not just static content. Flagging for explicit client scoping before building. | 3 application flows |
| Book / MyLimoBiz | `/book` — embeds `book.mylimobiz.com/v4/luxlanetransports` | `/book` — same MyLimoBiz alias, persistent-iframe architecture | MATCHED | — | — |
| FAQ | Homepage section, 6 Q&As | `/faq` — own page, 4 categories (Reservations, Airport Transfers, Fleet & Groups, Corporate & Policies) | IMPROVED | New site already covers the old site's 6 topics (vehicle types, advance/same-day booking, chauffeurs, modify/cancel, payment, mobile app) across its categories, in more depth. Was NOT linked from nav/footer anywhere — fixed this pass (added to footer). Cancellation FAQ answer updated to point to the new real Cancellation Policy page instead of vague text. | — |
| Rates & Pricing | Homepage section — vehicle-based hourly rates, "First Class," Airport Transfers note | `/rates` — new dedicated page | CLIENT-UPDATED | Built new, in the site's premium layout (not copying old design), per explicit instruction. Uses verified live MyLimoBiz vehicle class names instead of the old site's unverified fixed hourly figures (client confirmed those were wrong — see §3). Linked from footer. | — |
| Articles | `/articles` — 6 generic SEO blog posts | Not present | MISSING | Out of scope this pass — old-site content contains a stray "Luxlane Transports" brand-name inconsistency (see §5) that shouldn't be copied as-is; would need real client-approved copy, not a port of the old posts | Real article content |
| News | `/news` — 6 templated/auto-generated tourism-stat posts | Not present | NOT APPLICABLE | Old-site content reads as auto-generated filler (repetitive "Live Travel & Tourism Movement..." headlines), not substantive news — not recommended for parity | — |
| Terms | `/terms` | `/terms` | IMPROVED | Enhanced with Dallas Transportation-for-Hire compliance language, complaint contacts (311 / (214) 670-3111), drug-free workplace statement, ADA/wheelchair line, and real links to the new Cancellation and Zero Tolerance pages — all verified from the old site (see §6) | — |
| Zero Tolerance Policy | `/policy` — cites Dallas Ordinance SEC. 47A-2.1.6 | Not present before this pass | CLIENT-UPDATED | New `/zero-tolerance` page built this pass, full content preserved from old site (ordinance citation, testing/enforcement, reporting via Dallas 311 / compliance office phone) | — |
| Cancellation Policy | `/cancellation-policy` — tiered by Sedans & SUVs / Airport / Hourly & Events / Modifications / Weather exceptions | Not present before this pass (data existed in `site-data.ts` as `CANCELLATION_SUMMARY` but was never rendered anywhere) | CLIENT-UPDATED | New `/cancellation-policy` page built this pass at the same URL as the old site, wired to the existing verified data | — |
| Privacy Policy | `/privacypolicy` | `/privacy` | MATCHED | Not modified this pass — content already covers the same topics (collection, use, sharing, security, rights, contact) | Old site's real contact email/phone `(682) 344-1891` for privacy-specific inquiries — see §9 (REQUIRES CLIENT CONFIRMATION) |
| Social Links | Facebook `profile.php?id=61581897194732`, Instagram `luxlanetransports`, WhatsApp — no TikTok/YouTube | Facebook, Instagram, TikTok, YouTube — all client-supplied 2026-08-07 URLs, verified open correctly (see §7) | CLIENT-UPDATED | New site uses the client's newer, explicitly-supplied official profiles, which supersede the old site's (different, older) links. Old site's Instagram handle (`luxlanetransports`) differs from the client-supplied one (`lctuniversal`) — expected, since the client-supplied link is the newer canonical account. | — |
| Trust / Accreditation Badges | **None found anywhere on the old site** (checked homepage, About, Fleet, Contact — no BBB/GNET/NLA) | None | REQUIRES CLIENT CONFIRMATION | See §8 — client considers these essential but no real badge assets exist on the old site OR in this project's asset library. Not fabricated. | Real BBB/GNET/NLA badge image files from the client |
| 24/7 Dispatch | "24 hours a day, 7 days a week" | Same, `CONTACT.dispatchHours` | MATCHED | — | — |
| Booking CTAs | "Book now" throughout | "Book Now" / "Book This Vehicle" / "Reserve Your Ride" throughout, all → `/book` | MATCHED | — | — |
| Phone Links | `(888) 615-4065`, tel-linked | Same number, tel-linked | MATCHED | — | — |
| Footer Content | Book now, Our fleet, Log in, About us, Contact us, News, Articles, Cancellation policy, Terms; "Developed by Clienity" attribution | Explore, Services, Contact columns; social links; Privacy/Terms/Zero Tolerance/Cancellation legal row | IMPROVED | Added Zero Tolerance Policy, Cancellation Policy, Rates & Pricing, and FAQ links to the footer this pass (previously FAQ existed but was linked from nowhere) | "Log in" (customer account portal) — see §9 |

## 2. Fleet Data — Client Corrections (override old site per explicit instruction)

| Item | Old Site | Live MyLimoBiz (verified 2026-08-08) | New Site (this pass) | Status |
|---|---|---|---|---|
| Executive SUV | "Luxury SUVs," no model stated, no capacity shown | "SUV" (6 pax) and "Luxury SUV" (6 pax) both exist as separate classes | Kept as-is: Executive SUV / Cadillac Escalade, 6 passengers — client explicitly validated this entry | CLIENT-UPDATED |
| Sprinter | "Sprinter Vans," 12–14 passengers | "Executive Sprinter," 14 passengers, quote-routed | Kept as own category, 12–14 pax, quote-routed, real Sprinter imagery (`fleetSprinter`) | MATCHED |
| Mini Coach | Not a separate category — old site's single "Coach Buses" covers 37–50 pax | "Mini Coach," 39 passengers | **New**: "Executive Mini Coach," Up to 39 passengers, uses the correct (smaller, single-rear-axle) vehicle photo — was previously mislabeled "Executive Coach" at 37–50 passengers | CLIENT-UPDATED |
| Large Coach | Same "Coach Buses" category, 37–50 pax, no separate large tier | "Motor Coach," 56 passengers | **New**: "Executive Coach," Up to 56 passengers — added only because a genuinely distinct full-size motorcoach photo (`groupCoachStory`, visually confirmed: tandem rear axle, full coach fascia, multiple luggage bays) actually exists in the asset library | CLIENT-UPDATED |
| First Class | "First Class: from $200/hour" (fixed hourly rate) | "First Class Sedan," 2 passengers, real quote for a ~6-mile trip returned **$140** (not $200/hour) | Not published as its own fleet card (no dedicated photo) — referenced by verified name only on `/rates` and documented in `FLEET_REVIEW_ITEMS` | CLIENT-UPDATED |

## 3. Pricing — Verification, Not Guessing

The client explicitly stated the old site's "$100/hour" Executive pricing (and by extension every other fixed hourly figure) was wrong, and asked for live-system verification rather than another guess.

**Method**: loaded `/book`, filled a real (non-submitted) Point-to-Point quote — DFW Airport Terminal D → Grapevine Mills Mall, 1 passenger, a real future date — through to "Step 2: Select Vehicle." No reservation was submitted, no payment step was reached.

**Verified live result** (`VERIFIED_LIVE_VEHICLE_CLASSES` in `site-data.ts`):

| Class | Passengers | Bags | This trip's fare |
|---|---|---|---|
| Sedan | 3 | 2 | $95.00 |
| SUV | 6 | 6 | $110.00 |
| Luxury SUV | 6 | 6 | $130.00 |
| First Class Sedan | 2 | 2 | $140.00 |
| Executive Sprinter | 14 | 10 | Request Quote |
| Mini Coach | 39 | — | Request Quote |
| Motor Coach | 56 | — | Request Quote |

This confirms pricing is **trip-dynamic** (varies by distance/vehicle/date), not a fixed hourly card — matching the client's own expectation. Per explicit instruction, no fixed dollar figure from this one sample trip was published sitewide as a general rate. All previously-hardcoded rates (`$100/hour` sedan, `$120/hour` SUV, `$200/hour` Sprinter/First Class, `$120` airport transfer) were removed from `site-data.ts`, `/fleet`, and the homepage/JSON-LD, replaced with the client's own suggested safe wording ("Rates calculated through our live booking system" / "See live rate") and a `priceRange: "$$$"` symbolic indicator in JSON-LD instead of a literal figure.

## 4. Group Transportation Image

Old site's "Large Group Transfers" service has no named image asset (fetch tooling couldn't recover alt text/filenames). New site's Services → Group Transportation chapter previously used `fleetCoach` (the Mini Coach photo). Per client instruction, swapped to the client-supplied Group Transportation photo (`groupCoachStory`, group-coach-bus.jpg — the real full-size motorcoach). That source photo includes a standing chauffeur that occupies the visual center; produced a real rectangular crop (`group-coach-bus-crop.jpg`, not AI content removal) that excludes the person entirely while keeping the bus sharp on both the section's desktop (4:5) and mobile (3:2) containers — the mobile ratio nearly matches the source's own ratio, so a crop was needed rather than relying on CSS `object-position` alone. See `groupCoachStoryCropped` in `image-map.ts`.

## 5. Brand-Name Inconsistency Found on Old Site (flag only, not applied)

Old site's `/articles` page and its Instagram footer link reference **"Luxlane Transports"** (not "LCT Universal") in several places — e.g. one article titled "Dallas Luxury Transportation & Black Car Service | Luxlane Transports," and the footer Instagram link points to `instagram.com/luxlanetransports`. Everywhere else (headers, footers, legal pages) the old site consistently uses "LCT Universal Executive Transports." This reads as either a rebrand-in-progress, reused template copy, or an unedited legacy name — **not applied to the new site**, which uses "LCT Universal Executive Transports" throughout per the client's own supplied social URLs (`lctuniversal`, `lctuniversallimoservices`) and business name. Flagging for the client to confirm intentionally, not silently ignoring it.

## 6. Dallas Compliance Checklist

Everything below was verified present on the old live site and cross-checked against the new site's current state.

| Requirement | Found on Old Site | On New Site Before This Pass | On New Site After This Pass |
|---|---|---|---|
| Dallas Transportation-for-Hire regulation reference | `/terms` — "operates in accordance with the City of Dallas Transportation-for-Hire regulations" | Not present | Added to `/terms` |
| Zero Tolerance ordinance citation (SEC. 47A-2.1.6) | `/policy` — explicit ordinance number cited | Not present anywhere | Added, full page at `/zero-tolerance` |
| Complaint contact information | `/terms` — "3-1-1 (inside Dallas)" / "(214) 670-3111 (outside Dallas)"; `/policy` — Dallas 311 Hotline + LCT Compliance Office phone | Not present | Added to both `/terms` and `/zero-tolerance` |
| Accessibility (ADA / wheelchair) statement | `/terms` — "Wheelchair accessibility is available in all our vehicles upon request" | Not present | Added to `/terms` |
| Drug-free workplace statement | `/terms` — explicit statement | Not present as a standalone statement (only implied by Zero Tolerance concept) | Added to `/terms`, full detail in `/zero-tolerance` |
| Cancellation policy detail (tiered by service) | `/cancellation-policy` — 5-part structure | Data existed (`CANCELLATION_SUMMARY`) but was never rendered on any page | Rendered at `/cancellation-policy`, matching old site's exact 5-part structure |

No legal requirement was guessed — every line above is a direct transcription/adaptation of real text confirmed on the live old site, not an invention.

## 7. Social Links Verification

All four client-supplied URLs (Instagram, TikTok, YouTube, Facebook — see `CONTACT` in `site-data.ts`) were already wired sitewide (footer, Contact page, JSON-LD `sameAs`) from an earlier pass. Re-verified this pass that each opens in a new tab with correct `rel="noreferrer"` and resolves to the exact client-supplied URL string, unchanged.

## 8. BBB / GNET / NLA Trust Section — Blocked, Not Fabricated

The client considers these affiliations essential and asked for "the real badges/assets currently available." **A real, live-site check confirmed zero BBB, GNET, or NLA badges, logos, or mentions exist anywhere on `lctuniversal.com`** (homepage, About, Fleet, Contact all checked explicitly), and a full codebase/asset-library grep confirmed none exist in this project either. Per the client's own explicit "if no real large-coach image exists, do not fabricate one" principle (applied here to logos rather than photos): **no trust/accreditation section was built this pass.** Building one with placeholder or invented badge artwork would misrepresent real accreditation status. This is the single largest open item from this pass — see the final report's "Missing Client Assets" section.

## 9. Items Requiring Client Confirmation

- **BBB / GNET / NLA badge image files** — needed before the trust section (§8) can be built at all.
- **Large Coach media** — resolved this pass (a real, distinct photo existed); flagging here only that if the client has *additional* professional large-coach photography, it should replace the current single photo for variety.
- **"Luxury SUV" as a class** — live MyLimoBiz shows a second 6-passenger SUV tier distinct from the standard SUV/Escalade. Is this the same Escalade at a premium service tier, or a different vehicle? Not published as its own fleet card pending clarification (see `FLEET_REVIEW_ITEMS`).
- **Privacy Policy contact phone** — old site's Privacy Policy specifically lists `(682) 344-1891` (different from the main `(888) 615-4065` number used everywhere else on the old site). Not applied to the new site's Privacy page since it directly contradicts the client's single verified number elsewhere — flagging rather than guessing which is correct.
- **Join Our Team** — old site's version is 3 real application forms with file uploads and background-check consent language; out of scope to port without explicit client direction on backend handling (Supabase schema, file storage, etc.).
- **Articles / News** — old site's content is either brand-inconsistent (see §5) or auto-generated filler; not recommended for direct parity. Flagging as a content gap, not silently dropping it.
