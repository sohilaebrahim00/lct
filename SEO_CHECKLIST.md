# SEO Checklist — LCT Universal

Status as of this pass (2026-08-02). Every claim below was directly verified against the running app (Playwright DOM inspection across all 14 routes), not assumed from reading source.

## Critical fix made this pass

**`<HeadContent />` (TanStack Router) was never rendered anywhere in the app.** This means every route's `head()` metadata — title, description, canonical, Open Graph, JSON-LD — had been silently inert since before this session; the browser only ever showed `index.html`'s static fallback tags. This predates this session; it is not a regression introduced by this pass. Fixed by rendering `<HeadContent />` in `__root.tsx`'s `RootComponent`. This single fix is what made every item below actually take effect in the live DOM — verified by re-inspecting the rendered page, not just the source.

Two knock-on duplicate-tag bugs were found and fixed while verifying that fix:
- Root-level `<link rel="canonical">` doesn't get *overridden* by a leaf route's own canonical — `links` entries aren't deduped by `rel` the way `meta` is deduped by name/property, so both existed simultaneously. Fixed by removing the root fallback (every route now supplies its own via `pageMeta()`).
- `index.html` had a static `<title>` and `<meta name="description">` that, likewise, sat *alongside* — not replaced by — the dynamic ones, producing two of each on every page. Fixed by removing them from `index.html`; `__root.tsx`'s `head()` is now the sole sitewide fallback.

## Per-route metadata — verified live

All 14 routes checked via headless browser after page load (not just reading the source):

| Route | Unique title | Unique description | Canonical (absolute, ×1) | og:url (×1) | H1 count |
|---|---|---|---|---|---|
| `/` | ✅ | ✅ | ✅ `https://lctuniversal.com/` | ✅ | 1 |
| `/services` | ✅ | ✅ | ✅ | ✅ | 1 |
| `/fleet` | ✅ | ✅ | ✅ | ✅ | 1 |
| `/corporate` | ✅ | ✅ | ✅ | ✅ | 1 |
| `/airport` | ✅ | ✅ | ✅ | ✅ | 1 |
| `/events` | ✅ | ✅ | ✅ | ✅ | 1 |
| `/about` | ✅ | ✅ | ✅ | ✅ | 1 |
| `/contact` | ✅ | ✅ | ✅ | ✅ | 1 |
| `/faq` | ✅ | ✅ | ✅ | ✅ | 1 |
| `/reviews` | ✅ | ✅ | ✅ | ✅ | 1 |
| `/service-areas` | ✅ | ✅ | ✅ | ✅ | 1 |
| `/book` | ✅ | ✅ | ✅ | ✅ | 1 |
| `/privacy` | ✅ | ✅ | ✅ `noindex, follow` | ✅ | 1 |
| `/terms` | ✅ | ✅ | ✅ `noindex, follow` | ✅ | 1 |

Zero duplicate titles, zero duplicate descriptions, zero duplicate canonical/og:url tags across all 14 routes. Every canonical and `og:url` is now an **absolute** URL (`https://lctuniversal.com/...`) — every route previously used a bare relative path (`"/fleet"`), which is invalid for both tags.

`og:image`, `og:type`, `og:site_name`, `og:locale`, and full Twitter Card metadata (`summary_large_image`, title, description, image) are now present on every route via the shared `src/lib/seo.ts` `pageMeta()` helper — previously only the homepage had a `twitter:card` tag and no route had `og:image` at all.

## Structured data (JSON-LD)

| Schema | Where | Matches visible content? |
|---|---|---|
| `LocalBusiness` | Sitewide (`__root.tsx`) | ✅ — name, phone, email, city/region/zip, area served, 24/7 hours, and price range (`$100–$200/hour`, taken directly from the verified `RATES` constant, not invented) all match what's rendered in the footer/contact info elsewhere |
| `WebSite` | Sitewide | ✅ — name/url only, no `SearchAction` since there's no on-site search |
| `FAQPage` | `/faq` | ✅ — pre-existing, generated directly from the same `faqs` array the page renders (verified, not touched structurally) |
| `Service` (with `OfferCatalog`) | `/services` | ✅ — generated directly from the same `services` array the page renders, not a separately-maintained list |
| `Service` | `/airport` | ✅ — matches the page's own description text |
| `Service` | `/corporate` | ✅ — matches the page's own description text |

No ratings/reviews schema was added — `/reviews` is an honest "no verified reviews yet" page, and marking that up as `AggregateRating` would misrepresent it.

**Deliberately not added: `BreadcrumbList`.** No page currently renders a visible breadcrumb trail, and Google's own requirement (quoted in the brief for this pass) is that structured data must reflect visible content. Recommend adding this alongside the Phase 4 visual pass, when `PageHero` is touched anyway — add a small visible breadcrumb row there, then wire matching `BreadcrumbList` JSON-LD to it.

## robots.txt / sitemap.xml

- `public/robots.txt` — allows all crawlers, points to the sitemap. No disallowed paths (no admin/internal routes exist to hide).
- `public/sitemap.xml` — all 12 indexable routes, correct `lastmod`/`changefreq`/`priority`. `/privacy` and `/terms` are **intentionally excluded** since both are `noindex` (a pre-existing decision, preserved not changed) — a sitemap should only list canonical, indexable URLs.

## 404 handling

TanStack Router's `notFoundComponent` renders correctly, but a pure client-rendered SPA on static hosting has no way to return a true HTTP 404 status for a client-side-routed path — `public/.htaccess`'s SPA fallback always serves `index.html` with a 200. This is an inherent limitation of static SPA hosting without a serverless/edge function, not something specific to this app. Mitigated as far as possible: the 404 component now sets `document.title` and injects `<meta name="robots" content="noindex, follow">` once it confirms the route doesn't exist, so any crawler that executes JS (Googlebot does) still gets a clear non-indexable signal instead of a bare 200. **Known limitation, not fully solvable without SSR/prerendering** — documented rather than silently left broken.

## Redirect strategy

No 301 redirects from the old Clienity/LeadConnector site were built this pass — per your direction, you'll supply the old site's indexed URL list separately. `public/.htaccess` is ready to receive `RewriteRule` entries once that list exists; the SPA fallback and HTTPS-enforcement rules are already in place and won't conflict with added redirects (redirects should be inserted before the SPA fallback block).

## Local SEO

Titles/descriptions naturally incorporate "Dallas–Fort Worth," "DFW," "Grapevine," "corporate transportation," "airport transportation" etc. where genuinely relevant to each page's content (e.g. `/airport` → "DFW Airport Transportation," `/corporate` → "Corporate Transportation Dallas") — no keyword stuffing, every phrase matches what the page is actually about. `LocalBusiness` schema's `address`/`areaServed` match the same `CONTACT` object used everywhere else in the app (single source of truth, no drift).

## Image alt text

Spot-checked across hero images, fleet images, and icon usage — all `<img>` tags carry descriptive `alt` text sourced from `IMAGES` (`image-map.ts`), which already documents alt text per asset. No empty or missing `alt` attributes found on content images. Decorative SVG icons correctly use `aria-hidden`.

**Update, 2026-08-02 (pre-launch QC pass):** found one real exception during the image-repetition audit — the `/events` filmstrip cards used `alt={m.t}` (the visible heading text, e.g. "Weddings & Ceremonies") instead of describing the image itself, which is redundant for screen readers and doesn't meet the "describe the image" bar. Fixed with real descriptive alt text per card (`src/routes/events.tsx`). Full image-repetition findings and fixes: `PROJECT_SPEC.md` §1c-6, items 4–5.

## Font loading fixed (also a performance/SEO-adjacent fix)

`index.html` was loading Google Fonts' **Inter** family — which is not used anywhere in the app's CSS (the actual body font is **Manrope**, per `styles.css`). Meanwhile `__root.tsx` separately loaded the *correct* fonts (Cormorant Garamond + Manrope) a second time, later. Net effect: the site was downloading three font families when it uses two, with the correct one arriving late. Fixed: `index.html` now loads the correct, single, static font link (fires before JS parses — best practice), and the redundant duplicate in `__root.tsx` was removed.

## What was not verified (needs a real deploy)

- Actual Google Search Console indexing behavior — can't be tested without a live, publicly reachable domain.
- Rich Results Test / Schema validator — the JSON-LD is well-formed (verified via `JSON.parse` on the live rendered output, zero parse errors) but wasn't run through Google's actual validator tool, which requires a live URL.
- Social share preview rendering (Facebook/Twitter/LinkedIn unfurl cards) — these tools also require a live, publicly fetchable URL.

**Recommended before launch**: after deploying to the real domain, run the URL Inspection tool in Search Console and the Rich Results Test against at least `/`, `/fleet`, and `/faq`.

## Re-verified unchanged, 2026-08-08 (final correction pass, see `PROJECT_SPEC.md` §1c-15)

This pass touched: the Home `ValueEditorial` section's image, GSAP scroll-handoff timing on `HorizontalJourney`/`VehicleObjectJourney`, and the removal of non-functional `pickupAddress`/`dropoffAddress` inputs from the `/contact`, `/airport`, and `/events` `LeadForm`s (replaced with a description linking to `/book`, plus a `submitLabel` wording change on `/airport`). None of this touches `head()`/`pageMeta()`, canonical tags, JSON-LD, `robots.txt`/`sitemap.xml`, or alt text. Re-ran the full 98-combination Playwright sweep (14 routes × 7 breakpoints) after this pass's changes: 1 `<h1>` per route unchanged across all 14, 0 console/page errors, 0 CSP violations — confirming this pass introduced no SEO regressions.
