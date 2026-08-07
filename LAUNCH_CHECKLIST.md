# Launch Checklist — LCT Universal

Consolidated status as of the pre-launch QC pass (2026-08-02). Originally written after Phase 3 (production hardening: security → SEO → tracking → performance → Hostinger deployment). Phase 4 (interior-page visual elevation) and a subsequent pre-launch QC pass (cursor, images, CTAs, responsive/keyboard/reduced-motion QA, integration regression — full record in `PROJECT_SPEC.md` §1c-5 and §1c-6) have both since completed. The sections below are updated in place rather than duplicated.

## ✅ Done and verified — final visual polish pass (2026-08-08, latest, see `PROJECT_SPEC.md` §1c-16)

- [x] The approach-darkness issue flagged as a "known remainder" at the end of the previous pass was tracked down to root cause and fully solved — not masked. Three real, distinct bugs, each confirmed via live debug instrumentation (not guessed): (1) `items-center` vertical centering (two nested levels) burying `VehicleObjectJourney`'s content ~700px below the visible area during its approach scroll; (2) a redundant tween inside the pinned timeline silently overwriting an already-correct standalone reveal tween via GSAP's default overwrite behavior; (3) the handoff-overlay fix shipped in the previous pass was itself subtly wrong — two further relative-position approaches (`"top top+=N"`, then `"bottom bottom"`) were tried and both proven incorrect via debug logging before landing on a fully self-contained fix using only the pin ScrollTrigger's own already-resolved `.end` pixel value.
- [x] Verified via continuous `getComputedStyle` opacity sampling (~220 samples across the full homepage scroll range, not spot-check screenshots) at 1920×1080 and 1440×900: both section handoffs now show a brief, correct fade-pulse exactly at each pin's real end, with zero frozen stretches and zero premature darkening — maximum consecutive high-opacity sample run measured: 1.
- [x] Screenshot-confirmed at the exact previously-broken frame: headline, body copy, and vehicle image all clearly visible well before the pin engages — no black gap, no dead frame, reads as one continuous cinematic sequence.
- [x] ScrollTrigger/GSAP cleanup re-verified via repeated navigate-away-and-back cycling (this project's established leak-detection convention) — identical clean behavior after 3 cycles, zero errors, zero stuck opacity.
- [x] Zero console/page errors at 1920×1080, 1440×900, and 390×844. Zero horizontal overflow on mobile before/after full scroll-through.
- [x] Investigated an apparent CLS spike (~6.0) from a raw `PerformanceObserver` during active scrolling — confirmed it's a measurement artifact of the Layout Instability API misreading GSAP's pin mechanics as shifts during active scroll (same measurement with zero scrolling: 0.00005); not a real regression against this project's trustworthy Lighthouse-measured CLS of 0.007.
- [x] `npx tsc --noEmit` and `npm run build` clean after every change in this pass.
- [x] Full 98-combination Playwright sweep re-run after all changes: 0 problems, 656 valid image renders (0 broken), 7 video elements (1 per homepage breakpoint, matching every prior pass).
- Not deployed. DNS/old site/email DNS untouched. MyLimoBiz, Google Ads, StatCounter, SEO metadata, Supabase config, GA4 untouched.

## ✅ Done and verified — final correction pass (2026-08-08, earlier, see `PROJECT_SPEC.md` §1c-15)

- [x] Real black-gap root cause found and fixed: two pinned homepage scroll sections (`HorizontalJourney`, `VehicleObjectJourney`) had a dark-wipe overlay that froze at full opacity after its own pin ended, painting solid black over the section's still-on-screen footprint until the next section's pin engaged — found via live `onUpdate`/`onRefresh` instrumentation (two competing writers on the same property), not guessed. Consolidated into one non-conflicting timeline per section; verified via continuous opacity sampling across hundreds of real scroll steps at 1920×1080, spot-checked at 1440×900 — zero frozen state, zero "Element not found" console warnings.
- [x] Homepage's non-functional `BookingExperience` quote wizard removed (confirmed via live interaction to have zero real autocomplete — `autocomplete="off"`, zero network requests) — MyLimoBiz at `/book` is now the sole booking system on the homepage, per explicit instruction not to run two competing booking systems.
- [x] Sitewide address-field audit: removed the same non-functional `pickupAddress`/`dropoffAddress` plain-text inputs from `/contact`, `/airport`, and `/events` `LeadForm`s, each now pointing users to `/book` for live pricing with real Google Places-backed autocomplete. `/corporate`'s "Primary Cities" field deliberately kept (multi-city, not a single-address lookup — documented judgment call in `PROJECT_SPEC.md` §1c-15).
- [x] Post-Hero section image swapped to the client-supplied cabin/passenger-POV photo (`ValueEditorial`).
- [x] Full 98-combination Playwright sweep re-run after all changes above: 0 problems, 655 valid image renders (0 broken), 7 video elements (1 per homepage breakpoint, matching every prior pass), 1 `<h1>` per route sitewide.
- [x] `npx tsc --noEmit` and `npm run build` clean after every change in this pass.
- Not deployed. DNS/old site/email DNS untouched. MyLimoBiz, Google Ads, StatCounter, SEO metadata, Supabase config, GA4 untouched.

## ✅ Done and verified — pre-launch QC pass (2026-08-02, latest)

- [x] Cursor responsiveness fixed: 0.09s primary follow (was 0.15s), magnetic pull capped at 10px and disabled entirely for drag targets/large panels (was: snapped to target center, including on viewport-spanning elements — the actual cause of the reported "laggy/disconnected" feel)
- [x] Native cursor now correctly restored over text inputs/textareas/selects/contenteditable/iframes (was: forced `cursor: none` even there)
- [x] **Critical fix**: the MyLimoBiz widget lost its live iframe (reverted to a dead, un-upgraded anchor link) every time a visitor navigated away from `/book` and came back via the site's own navigation — a fundamental React/third-party-DOM-mutation conflict, not a timing issue. This directly contradicts the "Survives SPA navigation" ✅ recorded below from the earlier pass; that earlier check did not catch it. Rewritten to manage the widget DOM with plain DOM APIs that React never re-renders. Verified fixed: iframe count 1/1/1 across direct load, navigate-away-and-back, and hard refresh (previously 1/**0**/1).
- [x] Same-page image repetition eliminated sitewide (was present on the homepage — 6 repeat pairs across its 8 sections — and on `/fleet`, `/services`, `/events`); full detail in `PROJECT_SPEC.md` §1c-6
- [x] Two real accessibility bugs fixed: mobile nav had no keyboard focus trap (Tab could reach content hidden behind the overlay); every lead-form field was missing `id`/`htmlFor`/`name` (no programmatic label association anywhere, on every form sitewide)
- [x] CTA gaps fixed: Contact, About, FAQ, Corporate, and Events had no path to instant `/book` booking at all — only a quote/inquiry form
- [x] Responsive sweep: 15 routes × 9 breakpoints (135 combinations) — 0 problems (console errors, overflow, heading structure)
- [x] Reduced-motion sweep: 12 routes — 0 problems
- [x] Accessibility score improved 91 → 96 (Lighthouse) as a direct result of the focus-trap and form-label fixes

## ✅ Done and verified — Phase 3 pass (2026-08-02, earlier)

## ✅ Done and verified this pass

- [x] Full integration audit (`INTEGRATION_AUDIT.md`)
- [x] Real MyLimoBiz booking system built (`/book`, persistent widget host, single script load, verified across navigation) — replaces the previous state where **no MyLimoBiz integration existed at all**
- [x] Primary "Book Now" CTAs repointed sitewide; quote/inquiry forms kept distinct and honestly labeled
- [x] Mobile sticky booking bar, verified not overlapping FABs or covering the footer
- [x] Lead form security: Zod validation, control-character sanitization, SHA-256 duplicate-submission hash (now actually populated — the DB column existed but was never used before), server-side rate-limit trigger (migration written, **not yet applied to the live database** — see below), sensitive-error logging removed
- [x] Dead `dangerouslySetInnerHTML` usage removed (unused shadcn `chart.tsx`) — codebase now has zero raw-HTML injection anywhere
- [x] **Critical fix**: `<HeadContent />` was never mounted — every route's title/description/OG/JSON-LD had been inert since before this session. Fixed, verified live across all 14 routes
- [x] Duplicate meta tag bugs found and fixed (root-vs-leaf canonical, static-vs-dynamic title/description)
- [x] Absolute canonical + full OG/Twitter Card metadata on every route (`src/lib/seo.ts`)
- [x] JSON-LD: `LocalBusiness`, `WebSite` (sitewide), `Service` (services/airport/corporate), `FAQPage` (pre-existing, verified matches visible content)
- [x] `robots.txt`, `sitemap.xml` created
- [x] 404 page sets `noindex` once confirmed (best achievable without SSR — see `SEO_CHECKLIST.md`)
- [x] Google Ads (`AW-17966850869`) + StatCounter (`13222021`/`abf8a3d5`) installed correctly: single `gtag.js` load, single StatCounter load, no duplication, SPA route-change `page_view`, click-delegated event tracking for booking CTAs / phone / email / WhatsApp / lead-submit-success
- [x] GA4 wired to activate automatically the moment a real Measurement ID is supplied (`VITE_GA4_MEASUREMENT_ID`) — **not fabricated**, since none was ever provided
- [x] `public/.htaccess`: HTTPS enforcement, SPA rewrite fallback, full security header set (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options, Cross-Origin-*), compression, cache rules (1yr immutable for hashed assets, no-cache for HTML)
- [x] `nginx.conf.example` reference config, mirrors the above
- [x] Fixed an oversized 790KB "favicon" that was actually the site's **logo**, rendered in the header on every page load — resized to 93.5KB (88% reduction), verified visually unchanged
- [x] Fixed router eagerly preloading other pages' images on initial homepage load (`defaultPreload: "intent"`)
- [x] `npm audit` run — see below
- [x] 4 stray debris files removed from repo root (confirmed with you first)

## ⚠️ Requires action before production launch

1. **Apply the Supabase migration.** `supabase/migrations/20260802010000_form_submission_hardening.sql` (rate limiting + submission-hash dedupe + length caps) exists in this repo but has **not been applied to the live database** — this environment has no Supabase CLI credentials. Run `supabase db push`, or paste the SQL into the Supabase dashboard's SQL editor, before launch.
2. **Provide old site URLs for redirects.** Per your direction, 301 redirects from the old Clienity/LeadConnector site weren't built this pass. `.htaccess` is ready to receive them.
3. **Add `.env` to `.gitignore`** before this project is ever connected to a git remote (currently harmless — no `.git` exists in this working copy — but a real risk the moment one is added).
4. **Decide on GA4.** If Google Analytics 4 is wanted, provide a real `G-XXXXXXX` Measurement ID; set it as `VITE_GA4_MEASUREMENT_ID` and it activates with no code changes.
5. **Verify CSP against the real deploy.** The exact StatCounter beacon domain was included based on their documented pattern, not confirmed against your live account — check the browser console for CSP violations after deploying and adjust `public/.htaccess` if needed.
6. **Real booking journey test on the live domain** (see below — what's already verified vs. what still needs a live pass).

## npm audit

2 vulnerabilities found, both **dev-server-only** (Vite's dev server / esbuild file-serving, exploitable only when running `npm run dev` locally — not present in the static production build Hostinger serves):
- `esbuild` 0.27.3–0.28.0 — arbitrary file read via the dev server on Windows
- `vite` 7.0.0–7.3.3 — several dev-server path-traversal/file-read advisories

Fix requires `npm audit fix --force`, which bumps Vite outside its currently-pinned range — not applied automatically per "don't blindly apply breaking dependency upgrades." Recommend testing a Vite upgrade in a follow-up session with a full build+QA pass, since it's a dev-only risk and not launch-blocking.

## Performance — honest caveat on the numbers

Lighthouse was run against the real production build (`npm run build` + `vite preview`, not the dev server) using the local machine's headless Chrome, most recently on 2026-08-02 during the pre-launch QC pass. **The absolute performance score (26–38 across runs) is not trustworthy** — this development machine had substantial concurrent load from other applications and my own test processes during each run (confirmed via `Get-Process`; the 2026-08-02 run showed `msedgewebview2`/`firefox`/other tooling consuming 18,000+ cumulative CPU-seconds), and Lighthouse's performance timing is CPU-throttle-simulated and extremely sensitive to that kind of contention.

What **is** trustworthy (not CPU-timing-dependent):
- **Cumulative Layout Shift: 0.007** (2026-08-02) — excellent, confirms the image `aspectRatio`/dimension discipline used throughout the site is working.
- **SEO score: 100/100** (unchanged).
- **Accessibility: 96/100** (2026-08-02, up from 91 — the mobile-nav focus-trap and lead-form label fixes from the QC pass measurably improved this).
- **Best Practices: 79** — only third-party cookies (StatCounter/Google Ads, inherent to the tracking you requested) and one `color-contrast` hit on a deliberately faint, `aria-hidden="true"` decorative background numeral (not real content, not announced to screen readers) — both reviewed and not real defects.
- Route-level code splitting confirmed working (every route ships its own small JS chunk, verified in the build output; bundle sizes unchanged from Phase 4).

**Recommended**: re-run Lighthouse (or Google's PageSpeed Insights, which runs on Google's own infrastructure) against the real deployed `lctuniversal.com` after launch for a number worth acting on. Known, concrete, already-fixed contributors to real-world load time regardless of this sandbox's noise: the 88%-smaller logo, eliminated duplicate font/meta fetches, and the router preload fix.

## Real booking journey — what's verified vs. what needs a live pass

| Check | Status |
|---|---|
| Every "Book Now" CTA reaches `/book` | ✅ verified (nav ×2, hero, fleet bookable vehicles, final CTA, airport, mobile sticky bar) |
| Widget initializes | ✅ verified — real client-branded MyLimoBiz form renders |
| No duplicate widget/script | ✅ verified (exactly 1 script tag, 1 iframe) |
| Survives SPA navigation away and back | ✅ verified 2026-08-02 with a real navigate-away-and-back repro script — this row was previously (incorrectly) marked verified after the Phase 3 pass; that check did not actually catch a real regression that was present (see the pre-launch QC pass section above). Now genuinely fixed and confirmed: iframe count 1/1/1 across direct load, navigate-away-and-back, and hard refresh. |
| No website overlay blocks the widget | ✅ verified visually |
| Direct fallback link works | ✅ present ("Open in a new tab" + timeout/error fallback), not live-clicked to avoid an unnecessary real MyLimoBiz session |
| Mobile viewport (no horizontal overflow) | ✅ verified at 390×844 |
| Progressing through actual reservation steps | ❌ **not tested** — would require entering real trip data into the live MyLimoBiz system; not done without explicit authorization |
| Customer/chauffeur notifications fire | ❌ **cannot be verified from the website side** — MyLimoBiz owns that workflow entirely; no webhook or confirmation channel exists back to this app |
| Real Safari behavior (the one-time redirect quirk found in the ORES script) | ❌ **not tested on real Safari/iOS** — found and designed around by reading the actual script source, not observed live |

## Documentation produced this pass

- `INTEGRATION_AUDIT.md`
- `SECURITY_CHECKLIST.md`
- `SEO_CHECKLIST.md`
- `LAUNCH_CHECKLIST.md` (this file)
- `PROJECT_SPEC.md` updated with a Phase 3 summary section

## Explicitly not done (per your own stop conditions, unchanged)

- Not published to the live domain
- No DNS changes
- Old Clienity site untouched
- No real paid booking submitted
- Namecheap email untouched

## Status: Phase 4 and the pre-launch QC pass are both complete

Phase 4 (interior-page visual elevation — `PROJECT_SPEC.md` §1c-5) and this pre-launch QC pass (§1c-6) have both completed since this file was first written. Remaining work before launch is the "Requires action before production launch" list above, unchanged in kind, plus the "Remaining launch blockers" carried forward in `PROJECT_SPEC.md` §1c-6.
