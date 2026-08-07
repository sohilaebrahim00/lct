# Domain Migration & Integration Parity Audit — LCT Universal

**Date**: 2026-08-07
**Scope**: Pre-launch audit before moving `lctuniversal.com` from its current host (DNS at Namecheap) to Hostinger, and deploying this new site to Netlify.
**Status**: Audit only. **No DNS was changed. No deployment happened. The old site was not touched or disconnected.**

This supersedes `INTEGRATION_AUDIT.md` (2026-08-01) as the current source of truth for integration status — that file is a Phase-1 snapshot from before MyLimoBiz, tracking, and Netlify config existed in this project; it's kept for history, not accuracy. Everything below was verified by reading this project's actual source and by directly inspecting the live `lctuniversal.com` site (fetched its HTML, its `robots.txt`/`sitemap.xml`, and the actual third-party scripts it loads — including reading MyLimoBiz's own `widget-loader.js` logic directly rather than guessing what it does).

---

## Part 1 — Media, UX, and bug-fix work done this pass

(Full detail lives in `PROJECT_SPEC.md` and `MEDIA_REGISTRY.md`; summarized here since this is the "final report.")

- **Hero image replaced**: the client supplied a new photo (found in their Downloads folder as a WhatsApp export, `WhatsApp Image 2026-08-07 at 4.18.45 PM.jpeg` — not yet in `public/assets` as stated, so it was located, verified, and processed) showing the complete fleet (5 vehicles + the branded coach bus) lined up together. Processed into `public/assets/official/hero-fleet-lineup.jpg` (163KB) and set as the `hero` key in `image-map.ts`. Existing Hero entrance/parallax/pointer-tilt GSAP animations were not touched — only the image `src`/crop changed.
- **Media re-audit**: re-checked `/public/assets` for anything genuinely new beyond the previous pass's 31-file inventory — nothing new was found except the one Hero image above. No re-assignment of already-correct media was needed.
- **Video count re-confirmed at exactly 1** (`hero-driving.mp4`, inside the Hero's "O") — verified via Playwright across all 98 route×breakpoint combinations: 7 total video elements found (1 per homepage viewport), 0 on every other route.
- **Real bug found and fixed — the post-Hero "black gap"**: the Hero's closing dark-wipe (`.hero-handoff`) was animating across its *entire* scroll-out distance (`start: "bottom bottom"` → `end: "bottom top"`, i.e. 0%–100%), unlike every sibling section's handoff in this same codebase (`HorizontalJourney`, `VehicleObjectJourney`), which both correctly compress their wipe into only the final 14–15% of their scroll range. The full-range version meant the Hero photo spent most of its exit already darkened to near-black, which then ran directly into the next section's own near-identical near-black top padding — together reading as one long dead stretch of scroll with nothing legible on screen. Fixed by changing the trigger to `start: "bottom 20%"`, compressing the wipe into the final ~20% of the exit, matching the established sibling pattern. Verified before/after via scripted scroll-and-screenshot: content in the next section is now legible almost immediately instead of after a long black stretch.
- **Official social links added**: Instagram, TikTok, YouTube, and an updated Facebook URL — all client-supplied this pass — added to the footer (every page) and to a new "Follow Us" card on the Contact page, via one shared `SocialLinks` component so the two placements can never drift apart. Proper icons (lucide-react's `Instagram`/`Youtube`/`Facebook`; a hand-drawn SVG for `TikTokIcon`, since lucide-react ships no TikTok glyph), `target="_blank"` + `rel="noreferrer"`, `aria-label` per icon, hover lift/glow transition. Also added to the homepage's `LocalBusiness` JSON-LD `sameAs` array (was Facebook-only before).
- No routing, integrations, SEO mechanics, GSAP architecture, or Three.js architecture were touched.

**Build/QA for this part**: `tsc --noEmit` clean, `npm run build` clean, full 98-combination Playwright sweep — 0 problems, 661 image renders all valid (0 broken), video count as expected.

---

## Part 2 — How each integration is currently connected

```
Visitor's browser
   │
   ├─▶ lctuniversal.com (DNS → wherever the A/CNAME records point)
   │       │
   │       ├─▶ Static site assets (HTML/CSS/JS/images/video) — served directly
   │       │      by whichever host the DNS points to (currently unspecified/
   │       │      old host; after migration, Netlify)
   │       │
   │       ├─▶ Supabase (gqjzrkossjayendtjxxp.supabase.co)
   │       │      Browser calls this DIRECTLY — a hardcoded HTTPS endpoint,
   │       │      not something that flows "through" lctuniversal.com's
   │       │      server. Forms insert rows into `form_submissions` using a
   │       │      public "publishable" key (safe for the browser by design).
   │       │      No server-side code in this project touches Supabase.
   │       │
   │       ├─▶ MyLimoBiz (book.mylimobiz.com)
   │       │      `/book` loads `widget-loader.js` from this domain, which
   │       │      finds a specific anchor tag and replaces it with a same-
   │       │      page iframe pointing at
   │       │      `https://book.mylimobiz.com/v4/luxlanetransports`.
   │       │      Everything past that point — the booking UI, pickup/
   │       │      drop-off fields, vehicle selection, confirmation — is
   │       │      MyLimoBiz's own application running inside that iframe.
   │       │      This project has zero code control over it.
   │       │
   │       ├─▶ Google Ads / gtag.js (googletagmanager.com/gtag/js)
   │       │      Direct script load, conversion ID AW-17966850869 (same ID
   │       │      the OLD site's GTM container also fires — see Part 4).
   │       │
   │       ├─▶ StatCounter (statcounter.com)
   │       │      Direct script load, project 13222021 (same ID as the old
   │       │      site).
   │       │
   │       └─▶ Google Fonts (fonts.googleapis.com / fonts.gstatic.com)
   │              Direct <link>/@font-face load.
   │
   └─▶ (inside the MyLimoBiz iframe only, cross-origin, not this project's
        code) Google Maps/Places JS API (maps.googleapis.com) — MyLimoBiz's
        own API key, MyLimoBiz's own Places Autocomplete implementation for
        the pickup/drop-off fields.
```

**What does NOT exist in this project, at all** (confirmed by grep across the entire source tree, not assumed): Twilio, Resend, any SMS-sending code, any transactional-email-sending code, any Supabase Edge Function (`supabase/functions/` doesn't exist — only migrations + `config.toml`), Google Maps/Places loaded by this project's own code (only MyLimoBiz's iframe touches it), Google Tag Manager (this project calls `gtag.js` directly instead — see Part 4 for why that's fine), GA4 (present in code but inert — see below), any live chat widget, any webhook receiver, any server-side API route (this is a static SPA with zero backend of its own beyond Supabase).

---

## Part 3 — Google Places Autocomplete: parity finding

**You asked me to verify this specifically, and not rebuild it blindly if the old site already handles it. Here's the finding**: the old site's pickup/drop-off address autocomplete is Google Places Autocomplete (confirmed — `libraries=places` in the Maps JS API request, a `GoogleGeoCore.InitGoogleServices` callback, real address-field placeholders), but it is **entirely inside the MyLimoBiz iframe** (`book.mylimobiz.com/v4/luxlanetransports`) — loaded, keyed, and controlled by MyLimoBiz, not by `lctuniversal.com`'s own code. The host site never touches Google Maps/Places directly.

**This new project's `/book` page embeds the exact same MyLimoBiz widget, same account alias (`luxlanetransports`), via the same `widget-loader.js` mechanism** (`src/components/booking/mylimobiz-widget.tsx`, `BOOKING.url` in `site-data.ts`). Because it's the identical MyLimoBiz account and the identical embed technique, **the Places Autocomplete behavior is already at full parity — nothing needed to be rebuilt, because nothing was actually built by the old site's own team either.** The "old implementation" you referenced *is* MyLimoBiz's, and this project already reuses it correctly.

One real, separate gap: this project's `LeadForm` (used for the homepage's `BookingExperience` quote wizard, and the Contact page's message form) has plain free-text `pickupAddress`/`dropoffAddress` fields — no autocomplete. **This is not a regression**, though: the old site has no equivalent quote/contact form at all (`/contact-us` is a static info block with no functional form) — so there's nothing on the old site to have parity *with* here. If you want Places Autocomplete on these secondary forms too, that's a genuinely new feature, not a migration task, and it needs a Google Maps/Places API key from you — I have none and can't fabricate one. Flagging as **REQUIRES CLIENT ACCESS** below, not as a bug.

---

## Part 4 — Domain migration impact, by dependency type

### 1. Integrations independent of the registrar (Namecheap vs. Hostinger doesn't matter at all)

- **Supabase** — the browser calls `gqjzrkossjayendtjxxp.supabase.co` directly. Nothing about where `lctuniversal.com`'s DNS points changes this URL or how it's reached.
- **MyLimoBiz** — same reasoning; the iframe always points at `book.mylimobiz.com`, a fixed URL baked into this project's own code, not derived from the visitor's origin domain.
- **Google Ads / gtag.js, StatCounter, Google Fonts** — all direct script loads to their own fixed domains; none of them care what domain is hosting the page that loaded them, unless the *account itself* is domain-restricted (see category 3 below).

### 2. Integrations that depend on DNS records specifically (not the registrar, the actual record values)

- **Email (MX / SPF / DKIM / DMARC)** — this is the one that can genuinely break if handled carelessly. See Part 5 — do not touch these records as part of a hosting migration; they're independent of where the *website* is hosted.
- **SSL/TLS** — depends on which DNS records point where and which host is issuing/managing the certificate at that hostname, not the registrar. Netlify automatically provisions and renews Let's Encrypt certificates once a domain's DNS points at it (via CNAME/ALIAS at apex, or Netlify DNS) — this "just works" once DNS is correctly pointed, no separate cert purchase needed.

### 3. Integrations that depend on the domain **name** itself (would only break if the domain name changed, not just its DNS target)

- None found that are hard-coded to `lctuniversal.com` in a way that breaks on a *hosting* move. `CONTACT.siteUrl` (`https://lctuniversal.com`) is used for canonical URLs, OG tags, and JSON-LD — correct today and stays correct as long as the domain name itself doesn't change, regardless of which host serves it.

### 4. Integrations that require an allowed-origin/allowed-domain update somewhere in a third-party dashboard

- **Google Ads (`AW-17966850869`) / StatCounter (`13222021`)** — these IDs are already present in this project's code, matching the old site's IDs exactly (confirmed: old site's GTM container also fires `AW-17966850869`; StatCounter project ID matches exactly, `13222021`). **No action needed on these specifically for a hosting move** — they track by account ID, not by verifying the requesting domain in a way a host change would break. If Google Ads has "Verified domains" enabled in that account (a separate setting from the tracking ID, only you can see this in the Ads dashboard), that's worth a client-side check but is unrelated to DNS/hosting.
- **Supabase** — if Supabase's project has CORS/allowed-origins restrictions configured (Authentication → URL Configuration, or API settings), confirm `https://lctuniversal.com` (and the Netlify preview subdomain, e.g. `*.netlify.app`, during testing) are on the allow-list. **REQUIRES CLIENT ACCESS** — I can't see your Supabase dashboard settings from here.
- **MyLimoBiz** — if their iframe embed is domain-restricted (some booking-widget providers lock embeds to a specific referring domain), confirm with MyLimoBiz support that `lctuniversal.com` (and Netlify's preview domain, for testing before cutover) are both allowed. **REQUIRES CLIENT ACCESS** — this is entirely inside MyLimoBiz's own account configuration, invisible to me.

### 5. Integrations/config that require **no change at all**

- This project's own code: `netlify.toml` / `public/_redirects` / `public/_headers` are domain-agnostic by design — SPA fallback and security headers apply to whatever domain Netlify serves, no edits needed for a domain swap.
- `CONTACT.siteUrl`, canonical URLs, sitemap.xml, robots.txt, OG URLs — all already correctly hardcoded to `https://lctuniversal.com` (the domain name itself, not tied to a specific host), so as long as the *domain* stays `lctuniversal.com` and only its hosting target changes, none of these need touching.

---

## Part 5 — Email safety (read before touching any DNS)

**I have no access to your actual Namecheap DNS zone or your email provider** — everything below is what must be checked and preserved, not a report of your current records (I cannot see them).

Before any nameserver or DNS change:

1. **Export/screenshot the current DNS zone from Namecheap in full** — every record, not just the obvious ones.
2. Specifically locate and record:
   - **MX records** — who currently handles `@lctuniversal.com` mail (Google Workspace? Microsoft 365? Namecheap Private Email? something else?) and their exact priority/target values.
   - **SPF** (a `TXT` record starting `v=spf1 ...`) — must be preserved exactly, or mail may start landing in spam/being rejected.
   - **DKIM** (one or more `TXT` records, often at a selector subdomain like `selector1._domainkey.lctuniversal.com`) — provider-specific, must be preserved exactly.
   - **DMARC** (`TXT` at `_dmarc.lctuniversal.com`) — must be preserved exactly.
   - Any other verification `TXT` records (Google Search Console site-verification, Microsoft 365 domain verification, etc.) — losing these can silently break unrelated tooling.
3. **If email stays on Namecheap while the website moves to Hostinger/Netlify**: the website migration only needs to change the records that control *web* traffic (typically the apex `A`/`ALIAS` record and/or `www` `CNAME`) — it must **not** touch `MX`, the SPF/DKIM/DMARC `TXT` records, or any mail-related subdomain records. If DNS management itself moves (e.g., nameservers change to Hostinger's), **every one of those non-web records must be recreated identically** at the new DNS host before cutover, or email breaks the moment the old zone stops resolving.
4. **Recommended safe sequence**: keep DNS management at Namecheap (don't change nameservers), and only update the specific web-facing record(s) to point at Netlify. This is the lowest-risk path — it touches nothing mail-related at all. Only consider moving full DNS management to Hostinger if there's a specific reason to; if you do, treat it as "recreate the entire zone, verify email works, *then* verify web," in that order.

---

## Part 6 — Integration Parity Table

| Integration | Old Website (lctuniversal.com) | New Website | Status | Migration Needed | Domain Dependency | Verified |
|---|---|---|---|---|---|---|
| Booking / reservations | MyLimoBiz iframe on `/book`, alias `luxlanetransports` | MyLimoBiz iframe on `/book`, same alias `luxlanetransports` | **MATCHED** | None | Independent of registrar; possible allowed-origin check with MyLimoBiz support | Verified — old site's `widget-loader.js` read directly; new site's own source read directly; same account |
| Pickup/Drop-off autocomplete | Google Places Autocomplete, entirely inside the MyLimoBiz iframe | Same — inside the same MyLimoBiz iframe | **MATCHED** | None | Same as above | Verified via the same MyLimoBiz iframe inspection |
| Quote/contact form address fields | Does not exist on old site (`/contact-us` has no functional form) | Exists (`LeadForm`), but plain free-text, no autocomplete | **IMPROVED** (new functionality, not full-featured) | Optional: add Places Autocomplete here too, requires a Google Maps/Places API key | N/A — new project code | Verified via old-site source (no form found) and new-site source |
| Supabase (form storage) | Not present on old site | `form_submissions` table, RLS-protected | **IMPROVED** (net-new capability) | None for migration | Independent of registrar; confirm CORS/allowed-origins includes the final domain | Verified via `src/integrations/supabase/client.ts` and migrations |
| Twilio SMS | Not found on old site (static analysis) | **Does not exist in this codebase** — confirmed via full-source grep | **MISSING** (on both, if it's supposed to exist) | Needs to be built if wanted — requires Twilio credentials | N/A | Verified absence in new codebase; could not verify old site short of testing a real booking flow (out of scope, would submit real data) |
| Resend email (booking confirmations / notifications) | Unknown — MyLimoBiz's own iframe app may send these internally, invisible to static analysis | **Does not exist in this codebase**; `form_submissions` has `company_email_status`/`customer_email_status` columns that default to `'pending'` and are never advanced — schema anticipates an email step that was never built | **REQUIRES CLIENT ACCESS** | If confirmation emails are expected from the lead-capture forms (not the MyLimoBiz booking itself), a Supabase Edge Function + Resend (or similar) needs to be built | N/A | Old site's actual confirmation-email behavior not verifiable without submitting a real booking through MyLimoBiz |
| Google Ads (`AW-17966850869`) | Fires via a GTM container (`GTM-NBQT4239`) | Fires via direct `gtag.js`, same conversion ID | **REPLACED INTENTIONALLY** (same tracking ID, simpler mechanism, no GTM container) | None functionally; optionally recreate the same container in GTM if you want tag-management flexibility later | Independent of registrar | Verified — old site's GTM/Ads ID read from its script tags; new site's ID read from `tracking.ts` — identical |
| Google Ads — GA4 tag | Possibly fires via the same GTM container (cannot confirm from static HTML — GTM tag configuration isn't visible in page source) | Present in code but **inert** — `VITE_GA4_MEASUREMENT_ID` is intentionally unset until a real GA4 property ID is provided | **REQUIRES CLIENT ACCESS** | Confirm whether the old site's GTM container fires a GA4 tag; if so, get that measurement ID and set `VITE_GA4_MEASUREMENT_ID` | Independent of registrar | Could not verify GTM's internal tag config from outside; new site's inert status confirmed from its own source |
| StatCounter (`13222021`) | Direct script | Direct script, same project ID | **MATCHED** | None | Independent of registrar | Verified — same project ID in both |
| Live chat widget | GoHighLevel's own embedded chat widget | **Does not exist** | **MISSING** | Client decision — add a chat widget if wanted; not something to guess into the build | N/A | Verified present on old site (`widgets.leadconnectorhq.com`); confirmed absent in new codebase |
| Social links | Facebook (`profile.php?id=...`), Instagram (`@luxlanetransports`) only — no TikTok/YouTube | Facebook (client-supplied new URL), Instagram (`@lctuniversal`), TikTok, YouTube | **IMPROVED** | None — already done this pass | Independent of registrar | Verified both sides via direct source inspection |
| SEO — canonical URLs | **None found anywhere on old site** | Present on every route, absolute URLs | **IMPROVED** | None | Independent of registrar/hosting | Verified — grepped old site HTML for `rel="canonical"`, found none; new site's `pageMeta()` confirmed |
| SEO — JSON-LD structured data | **None found** | `LocalBusiness` schema present, `sameAs` now includes all 4 social profiles | **IMPROVED** | None | Independent | Verified both sides |
| `robots.txt` | Returns 200 but is completely empty | Present, correct, references sitemap | **IMPROVED** | None | Independent | Verified both sides directly |
| `sitemap.xml` | Returns 200 but `<urlset>` is empty — zero URLs | Present, lists all indexable routes | **IMPROVED** | None | Independent | Verified both sides directly |
| Security headers / CSP | Unknown — not verifiable via static HTML fetch alone (headers aren't visible in page source) | `netlify.toml` + `public/_headers` + `public/.htaccess`, full CSP allow-listing every verified third-party domain | **IMPROVED** (assuming old site has weak/no CSP, typical for GoHighLevel-built sites) | None | Independent — headers are server config, not DNS-dependent | New site verified directly; old site's headers not checked (would require a raw HTTP HEAD request, not done this pass) — mark as **REQUIRES PRODUCTION TEST** if you want old-site headers confirmed too |
| SSL/HTTPS | Presumably active (site loads over HTTPS today) | Netlify auto-provisions Let's Encrypt once DNS points at it | **MATCHED** (expected) | None beyond normal DNS cutover | Depends on DNS pointing correctly at Netlify | **REQUIRES PRODUCTION TEST** after DNS cutover — can't verify a certificate that doesn't exist yet |
| Email (MX/SPF/DKIM/DMARC) | Live today (presumed working, business email in active use) | N/A — website hosting change should not touch these | **REQUIRES CLIENT ACCESS** | Export and preserve current records before any DNS change (see Part 5) | Fully DNS-dependent — this is the highest-risk item in the whole migration | Not verifiable without direct DNS zone access |

---

## Part 7 — Migration checklist

**Before touching DNS:**
- [ ] Export the full current Namecheap DNS zone (all records, not just A/CNAME) and save it somewhere safe.
- [ ] Confirm current MX/SPF/DKIM/DMARC records explicitly with whoever manages the business email account.
- [ ] Confirm with MyLimoBiz support whether their iframe embed is domain-restricted, and if so, get the new domain (and Netlify's preview subdomain, for pre-launch testing) allow-listed.
- [ ] Confirm Supabase project's CORS/allowed-origins settings include the production domain (Supabase dashboard → Authentication → URL Configuration, or API settings).
- [ ] Decide whether GA4 should be activated — if the old site's GTM container fires a GA4 tag, get that measurement ID from the client/GTM account and set `VITE_GA4_MEASUREMENT_ID`.
- [ ] Decide (client decision) whether a live-chat widget is wanted on the new site, since the old one has GoHighLevel's chat and the new one currently has none.
- [ ] Decide (client decision) whether booking-confirmation / driver-notification emails are expected outside of whatever MyLimoBiz itself sends — if yes, that's a new Supabase Edge Function + email provider (e.g. Resend) that needs to be built and tested before launch, not assumed to already exist.

**Deploying to Netlify (can happen independently of DNS — Netlify gives you a `*.netlify.app` URL immediately for testing):**
- [ ] Run `npm run build`, deploy `dist/` to Netlify (per the client's chosen method from the earlier localhost/redirect pass — manual `dist/` upload).
- [ ] On the Netlify preview URL, re-run the full QA pass (direct loads of every route, refresh on every route, internal nav, Book Now → MyLimoBiz iframe loads and its Places Autocomplete works, Contact form submits to Supabase, all 4 social links open correctly, no console errors, no CSP violations).
- [ ] Confirm `netlify.toml`'s `/* -> /index.html 200` redirect is active on the deployed preview (direct-load a deep route like `/fleet` on the `*.netlify.app` URL and confirm it doesn't 404).

**DNS cutover (only after the above is green):**
- [ ] Point `lctuniversal.com`'s web-facing record(s) (apex `A`/`ALIAS` and/or `www` `CNAME`) at Netlify, per Netlify's own custom-domain instructions — **do not** touch MX/SPF/DKIM/DMARC/other TXT records in the same change.
- [ ] Confirm Netlify has provisioned an SSL certificate for the domain (usually automatic within minutes of DNS propagating).
- [ ] Re-verify the live domain: direct loads of every route, MyLimoBiz booking flow, Supabase form submission, all tracking pixels firing, email still works (send a real test email to `reservations@lctuniversal.com` from an external address).
- [ ] Monitor for 24–48 hours (DNS propagation isn't instant everywhere) before considering the old host fully retired.

---

## Part 8 — Final Pre-Launch Answers

**1. Did every important integration from https://lctuniversal.com make it into the new website?**
The two integrations that actually matter operationally — **MyLimoBiz booking (including its Google Places-powered address autocomplete)** and the **tracking pixels (Google Ads, StatCounter)** — are matched exactly, same account IDs. SEO is meaningfully *better* on the new site (the old site has no canonical tags, no structured data, an empty `robots.txt`, and an empty `sitemap.xml`). Two things present on the old site are **not** in the new one: a live chat widget, and (unconfirmed) a GA4 tag if the old GTM container fires one.

**2. What is still missing?**
- A live chat widget (old site has GoHighLevel's; new site has none) — client decision, not rebuilt blindly.
- Confirmed GA4 tracking (present in new code but inert pending a real measurement ID).
- Confirmation/notification emails beyond whatever MyLimoBiz itself may send internally — no Twilio SMS or Resend/email-sending code exists in this project at all, and it's unverified whether the old site had this either.
- Places Autocomplete on the *secondary* quote/contact form (not the main booking flow) — not a regression, since the old site has no equivalent form, but flagged in case you want it anyway.

**3. What could break when the domain/DNS moves from Namecheap to Hostinger?**
The only genuine risk is **email** — if MX/SPF/DKIM/DMARC records aren't preserved exactly during a DNS change, business email can silently stop working or start landing in spam. Nothing else in this audit is DNS-fragile: Supabase, MyLimoBiz, Google Ads, and StatCounter all connect via fixed URLs/IDs independent of which host serves the website.

**4. What must be changed before DNS cutover?**
Nothing needs to change *before* cutover except verification: confirm MyLimoBiz and Supabase don't have domain-restriction settings that would block the new deployment, and have the current DNS zone exported so email records can be recreated exactly if DNS management itself moves.

**5. What must NOT be changed?**
MX, SPF, DKIM, DMARC, and any other mail- or verification-related DNS records — these should only ever be *copied forward* exactly, never edited or omitted, regardless of which host serves the website itself.

**6. Is it safe to point lctuniversal.com to the new website now?**
**Not yet** — not because anything found in this audit is broken, but because three items in the parity table are marked **REQUIRES CLIENT ACCESS** (GA4 tag confirmation, MyLimoBiz/Supabase allowed-origin settings, the actual DNS zone export) and one is marked **REQUIRES PRODUCTION TEST** (SSL provisioning and live-domain behavior, which can only be verified after DNS actually points at Netlify). Everything code-side is ready and has been verified as thoroughly as static/live-site analysis allows.

**7. If not, list the blockers in exact order.**
1. Export the current Namecheap DNS zone in full and confirm MX/SPF/DKIM/DMARC values with whoever manages email.
2. Confirm with MyLimoBiz support and in the Supabase dashboard that the new domain (and Netlify's preview subdomain, for testing) are allowed.
3. Client decision: GA4 (get the measurement ID if the old GTM container fires one, or explicitly decide not to), live chat widget (add or skip), and confirmation-email behavior (build it or confirm MyLimoBiz already handles it).
4. Deploy to Netlify's preview URL and run the full QA checklist in Part 7 there first.
5. Only then perform the DNS cutover, immediately followed by the live-domain re-verification pass in Part 7.

---

*Not deployed. DNS not changed. Old site not disconnected. This document is the audit and report only, as requested.*
