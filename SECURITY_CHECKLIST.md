# Security Checklist — LCT Universal

Status as of the pre-launch QC pass (2026-08-02). Every item below reflects what was actually implemented and verified in this repository — not aspirational.

**Re-verified unchanged, 2026-08-02 (pre-launch QC pass):** the QC pass's own regression check confirmed zero new CSP violations and no duplicated tracking scripts across an extensive navigation sequence (see `PROJECT_SPEC.md` §1c-6, item 15). Nothing in this checklist below was modified by that pass — form field `id`/`name`/`aria-*` attributes were added for accessibility (label association), not security, and don't change validation, rate-limiting, or sanitization behavior.

**Re-verified unchanged, 2026-08-08 (final correction pass, see `PROJECT_SPEC.md` §1c-15):** the non-functional `pickupAddress`/`dropoffAddress` plain-text inputs (no real autocomplete, `autoComplete="off"`) were removed from the `/contact`, `/airport`, and `/events` `LeadForm` instances — a UX/data-quality fix, not a security change. Those forms still submit through the exact same `submitFormClient` → Supabase RLS `WITH CHECK` path; `pickupAddress`/`dropoffAddress` simply arrive as empty strings now on those three forms instead of free-typed (unvalidated-format) text, which if anything narrows the input surface, not widens it. The duplicate-submission `submission_hash` (which incorporates pickup/dropoff) still computes deterministically with empty values — no hash-collision or dedupe-bypass risk introduced. Honeypot, rate limiting, sanitization, RLS least-privilege, and every other control below are unchanged and unaffected.

## Forms

| Control | Status | Notes |
|---|---|---|
| Honeypot | ✅ | `website` field, off-screen, `tabIndex=-1`, checked first in `submitFormClient` |
| Client-side validation (UX) | ✅ | `src/lib/forms/schema.ts` — Zod schema, was previously hand-rolled regex only |
| Server-side validation | ✅ | Supabase RLS `WITH CHECK` — email format, name length, `form_type` allow-list, per-field max lengths (migration `20260802010000_form_submission_hardening.sql`) |
| Input sanitization | ✅ | `sanitizeText()` strips non-printing control characters before every free-text field is stored |
| Duplicate-submission protection | ✅ | SHA-256 `submission_hash` of (form type, email, name, pickup/dropoff, pickup time) computed client-side via `crypto.subtle`, enforced by the pre-existing unique DB index — previously the column existed but was never populated, so it never engaged |
| Rate limiting | ✅ server-side + soft client-side | DB: `SECURITY DEFINER` trigger rejects a 4th submission from the same email within 10 minutes. Client: a 15s localStorage cooldown gives immediate UX feedback before hitting the network |
| CSRF | ✅ not applicable, documented | Submissions use the Supabase anon key as a per-request `apikey` header, not ambient cookie-based auth — there is no session for a forged cross-site request to ride on. No CSRF token was added because there is no session to protect |
| Sensitive logging | ✅ | Removed the raw `console.error(error)` that logged the full Supabase error object (could include email/name) in production; replaced with a dev-only `console.warn` of just the error code |
| Secrets in frontend | ✅ verified clean | `.env` contains only `VITE_SUPABASE_URL` and a `sb_publishable_...` key (Supabase's new public-safe key format). No service-role key anywhere in `src/` |
| RLS least-privilege | ✅ verified | `anon`/`authenticated` have `INSERT` only on `form_submissions`; `service_role` has `ALL`. No `SELECT` exposed to the browser |
| Oversized payload protection | ✅ | RLS `WITH CHECK` now enforces a max length on every free-text column (name 200, email 320, phone 40, addresses 500, notes 2000, etc.) |
| File upload | N/A | No file upload exists anywhere in the app |

**Not yet applied to the live database**: the hardening migration (`supabase/migrations/20260802010000_form_submission_hardening.sql`) exists in this repo but requires `supabase db push` (or running it via the Supabase dashboard SQL editor) against the real project — this environment has no Supabase CLI credentials to do that remotely. **This is a required step before launch.**

## Environment variables

| Variable | Exposed to browser? | Risk |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes (by design, `VITE_` prefix) | None — this is a public project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes (by design) | None — Supabase's publishable key is designed to be public; RLS is the actual access boundary |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` (no `VITE_` prefix) | No | Unused duplicates in `.env`, kept as a server-side fallback in `client.ts` for non-Vite contexts; harmless |
| `VITE_GA4_MEASUREMENT_ID` | Not set | GA4 is wired to activate the moment this is set — see `src/lib/tracking.ts` |

No service-role key, no database password, no API secret of any kind exists in this codebase. `.env` is **not currently in `.gitignore`** — harmless today (no `.git` directory exists in this working copy) but must be added before this project is ever pushed to a real git remote.

## Third-party scripts — full inventory

| Script | Owner | Domain | Loading | Failure behavior |
|---|---|---|---|---|
| ORES widget loader | MyLimoBiz | `book.mylimobiz.com` | Lazy, only on first `/book` visit, single injection guarded by a module-level flag + DOM query | Timeout (9s) or `error` event shows a branded fallback with a direct link — see `mylimobiz-widget.tsx` |
| gtag.js | Google | `googletagmanager.com` | Single injection via `initTracking()`, mounted once from `__root.tsx` | Silently no-ops if blocked (ad blockers) — `window.gtag` calls are all optional-chained |
| StatCounter | StatCounter | `statcounter.com` | Same single-init path as gtag | Same — no-op if blocked |
| Google Fonts CSS | Google | `fonts.googleapis.com`/`fonts.gstatic.com` | Static `<link>` in `index.html`, loaded before JS parses | Falls back to the CSS `ui-serif`/`ui-sans-serif` stack already declared |

No other external script exists anywhere in this codebase (verified via full-repo grep). No `<script>` tag is duplicated between `index.html` and React — tracking is the *only* place any of the above are injected.

## Content-Security-Policy

Implemented in `public/.htaccess` (Apache/Hostinger) and mirrored in `nginx.conf.example` for reference. No wildcards. `script-src` has **no** `unsafe-inline`/`unsafe-eval` — verified there is no inline `<script>`, no `eval()`, and no `dangerouslySetInnerHTML` anywhere in the app (the one prior usage, an unused shadcn `chart.tsx` component, was confirmed dead code and deleted).

`style-src 'unsafe-inline'` is a **deliberate, documented exception** — this codebase styles many elements via inline `style={{}}` React props (dynamic gradients, GSAP-driven transforms). Removing it would require rewriting that styling approach app-wide; out of scope for this pass, called out explicitly rather than silently accepted.

Every domain in the CSP allowlist corresponds to a verified integration above — nothing speculative.

## Other security headers (`.htaccess`)

- `Strict-Transport-Security` — 2-year max-age, includeSubDomains, preload-ready
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'` in CSP
- `Permissions-Policy` — everything denied except `geolocation` (scoped to `self` and the MyLimoBiz origin, since the ORES iframe requests it via its `allow` attribute)
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` (allows the MyLimoBiz iframe's own popups/redirects to function)
- `Cross-Origin-Resource-Policy: same-site`
- HTTPS enforced via a 301 redirect rule

## Dependency / supply-chain

- `npm audit` — see `LAUNCH_CHECKLIST.md` for the run performed as part of this pass.
- No arbitrary/trivial npm packages were added — the only new runtime dependency introduced by this pass is none (Zod was already installed but unused; it's now actually used).

## Known risks / requires client action before launch

1. **The rate-limit/dedupe/length-cap migration must be applied to the live Supabase project.** Not yet done — no CLI credentials available in this environment.
2. **`.env` should be added to `.gitignore`** before this project is ever connected to a git remote.
3. CSP's exact StatCounter beacon domain (`c.statcounter.com` for image-pixel fallback) was included based on their documented pattern but not verified against a live StatCounter account — confirm no CSP violations appear in the browser console after a real deploy, and adjust if StatCounter's current infrastructure differs.
4. No cookie-consent banner exists. Given the business's Texas/US market, this is not currently a legal blocker, but if the site ever serves EU/UK or California traffic at meaningful volume, a consent mechanism for Google Ads/GA4/StatCounter would need to be added — flagged, not built, since it wasn't in scope for this pass and a non-functional placeholder banner would be worse than none.
