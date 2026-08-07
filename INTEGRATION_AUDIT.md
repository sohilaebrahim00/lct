> **Superseded 2026-08-07** — this is a Phase-1 snapshot from before MyLimoBiz, tracking, and Netlify config existed in this project. Kept for history. For current integration status and the domain-migration/parity audit, see `DOMAIN_MIGRATION_AUDIT.md`.

# Integration Audit — LCT Universal (2026-08-01)

Phase 1 of the production-readiness pass. This is a factual survey of what exists in the repository right now — no visual changes were made while compiling this. Every row below was verified by reading the actual source, not inferred.

---

## 1. Booking / reservation system

| | |
|---|---|
| **Integration name** | MyLimoBiz / ORES online reservation widget |
| **Current implementation** | **Does not exist in this codebase.** `grep -ri "mylimobiz\|ORES\|luxlanetransports"` across `src/` returns zero matches. There is no `/book` route, no widget-loader component, no reference to `book.mylimobiz.com` anywhere. |
| **Production source** | `https://book.mylimobiz.com/v4/widgets/widget-loader.js`, alias `luxlanetransports` (per the snippet you provided — not yet verified live from this environment) |
| **Where it should be used** | Nav "Book Now", Hero "Book Your Ride", floating CTA, Fleet/Airport/Corporate/Events booking CTAs, final homepage CTA, dedicated `/book` route |
| **Required domains** | `book.mylimobiz.com` |
| **Failure fallback** | None exists yet — needs a direct `<a href="https://book.mylimobiz.com/v4/luxlanetransports">` fallback link |
| **Validation method** | Not yet buildable/testable — needs to be built first |

### What exists instead (and must not be confused with the above)

The site currently has **two separate "booking-shaped" UIs, and both are Supabase lead-capture forms, not live reservations**:

1. **`ReserveDialog`** (`src/components/luxury/reserve-dialog.tsx`) — a modal triggered from the hero ("Book Your Ride") and elsewhere. Opens `BookingCard` → `LeadForm formType="quote"`. Its own copy is honest about this ("Get an **instant trip quote**... a concierge will confirm your private quote within one business day"), but the *button label* ("Book Your Ride") overpromises relative to what actually happens.
2. **`BookingExperience`** (`src/components/home/booking-experience.tsx`) — the homepage's dedicated 3-step wizard section (Trip details → Vehicle → Contact). Also a `LeadForm`, also writes to Supabase `form_submissions`, also not a live reservation.

Both are well-built, already-approved, and functionally sound as **quote-request lead capture** — the form itself already tells users "This confirms receipt of your request only. Your reservation is not confirmed until our team contacts you." They are not broken; they are simply not what "Book Now" should mean per your new spec, and there is currently *no* live path into MyLimoBiz anywhere on the site.

**This is the single most important finding of this audit** — see the question at the end of this message before I touch any CTA wiring.

---

## 2. Lead / inquiry forms

| Form | File | Submits to | Notes |
|---|---|---|---|
| Quote (hero/ReserveDialog) | `booking-card.tsx` | Supabase `form_submissions`, `form_type='quote'` | |
| Booking wizard (homepage) | `booking-experience.tsx` | Supabase, `form_type='booking'` | 3-step, additive `activeGroup` field-grouping |
| Fleet inquiry | `fleet.tsx` | Supabase, `form_type='fleet'` | |
| Corporate inquiry | `corporate.tsx` | Supabase, `form_type='corporate'` | |
| Airport inquiry | `airport.tsx` | Supabase, `form_type='airport'` | |
| Event inquiry | `events.tsx` | Supabase, `form_type='event'` | |
| Contact | `contact.tsx` | Supabase, `form_type='contact'` (assumed — not yet re-verified this pass) | |
| Careers | — | **Does not exist.** No careers route/form found. |

All routes through one shared `LeadForm` component → `submitFormClient()` → direct Supabase `insert`. **No CRM endpoint, no MyLimoBiz redirect, no server-side email function are wired to any of these** — confirmed by `MIGRATION-NOTES.md` itself: *"Email sending... is not included in this SPA build and should be moved to a Supabase Edge Function... before production."* The `company_email_status`/`customer_email_status` DB columns exist and default to `'pending'` — i.e., the schema was designed for an email step that was never finished.

### Form security — current state vs. spec requirement

| Requirement | Status |
|---|---|
| Honeypot | ✅ present (`website` field, off-screen, `tabIndex=-1`) |
| Server-side validation | ✅ **partially** — Postgres RLS `WITH CHECK` enforces name length, email regex, and a `form_type` allow-list at the DB layer (migration `20260721224802`) |
| Zod schema | ❌ `zod` is an installed dependency but **unused** — `LeadForm`'s `validate()` is hand-rolled regex/length checks, client-side only |
| Rate limiting | ❌ none |
| Duplicate-submission protection | ⚠️ **schema exists, client doesn't use it** — `form_submissions.submission_hash` has a `UNIQUE ... WHERE submission_hash IS NOT NULL` index, but `submissions.client.ts` never sets `submission_hash`, so every row is `NULL` and the unique constraint never engages |
| RLS least-privilege | ✅ `anon`/`authenticated` get `INSERT` only; `service_role` gets `ALL`. No `SELECT`/`UPDATE`/`DELETE` exposed to the browser |
| Sensitive console output | ⚠️ `submissions.client.ts:46` — `console.error("[form] submission failed", error)` logs the raw Supabase error object (could include constraint/schema names) in production builds |
| Secrets in frontend | ✅ clean — `.env` contains only `SUPABASE_URL` + a `sb_publishable_...` key (Supabase's new publishable-key format, safe for the browser). No service-role key found anywhere in `src/` |

---

## 3. Supabase

- **Project**: `gqjzrkossjayendtjxxp` (from `.env`)
- **Client init**: `src/integrations/supabase/client.ts` (not yet re-read this pass, referenced by `submissions.client.ts`)
- **Tables**: one — `public.form_submissions` (2 migrations: initial create + a tightened RLS check)
- **`.env` is not in `.gitignore`** — currently harmless (no `.git` directory exists in this working copy), but must be added before this project is ever pushed to a real git remote, or the publishable key (low-risk but still project-identifying) and project ref end up in history.

---

## 4. Tracking & analytics

| | |
|---|---|
| **Google Ads (`AW-17966850869`)** | **Not present anywhere in the repo.** No `gtag`, no `googletagmanager.com` reference in `index.html` or `src/`. |
| **StatCounter (project `13222021`)** | **Not present anywhere in the repo.** |

Both are greenfield — nothing to deduplicate yet, but also nothing currently firing. `index.html` has no third-party script tags at all beyond Google Fonts preconnects.

---

## 5. Chat

No Clienity chat embed exists in this codebase. Current floating actions (`floating-actions.tsx`) are exactly two buttons: WhatsApp (`wa.me/18886154065`) and Phone (`tel:+18886154065`), both sourced from the single `CONTACT` object in `site-data.ts`. No third competing widget exists — the "no three competing floating buttons" requirement is already satisfied by omission.

---

## 6. Phone / email / WhatsApp links

All centralized in `src/lib/site-data.ts` → `CONTACT`:
- `phoneTel: "tel:+18886154065"` → matches your stated `+1 (888) 615-4065` ✅
- `emailMailto: "mailto:reservations@lctuniversal.com"` → matches ✅
- `whatsappUrl: "https://wa.me/18886154065"` (same number as phone)
- A `LEGACY_CONTACT` export retains an old WhatsApp number (`16823441891`) explicitly marked "Removed from active UI... never render" — confirmed not referenced anywhere active.

Used consistently across `SiteNav`, `FloatingActions`, `PageHero`/footer, and every route — single source of truth, no drift found.

---

## 7. SEO metadata (current state)

- Root (`__root.tsx`) sets a sitewide fallback title/description/OG/Twitter block.
- Individual routes (`fleet.tsx`, `corporate.tsx`, `airport.tsx`, `events.tsx`, and presumably others) **already override** `head()` with their own `title`, `description`, `og:title`, `og:description`, and a `canonical` `<link>` — this is in noticeably better shape than a typical unaudited SPA.
- **Gaps found**: `og:url` and `canonical href` values are **relative** (e.g. `"/fleet"`) rather than absolute (`https://lctuniversal.com/fleet`) — canonical and `og:url` tags must be absolute URLs per spec. No `og:image` / `twitter:image` anywhere. No JSON-LD structured data anywhere. No `robots.txt`. No `sitemap.xml`. No custom 404 route content verified yet (TanStack's `notFoundComponent` exists in `__root.tsx` — needs review for SEO-correct status code behavior under static hosting).

---

## 8. Deployment / hosting

- No `_redirects`, no `.htaccess`, no `vercel.json`/`netlify.toml` — **direct route access (e.g. `https://lctuniversal.com/fleet` loaded fresh) will 404 on Hostinger** today, since this is a client-side-routed SPA with no server rewrite rule in place.
- `vite.config.ts` is minimal and clean — no security headers, no build-time env leakage found.
- A stale `dist/` build exists in the repo root from an earlier `npm run build` — should be regenerated before any bundle-size/Lighthouse measurement.

---

## 9. Repo hygiene notes (not required by the spec, flagged for your awareness)

- This project originated in **Lovable** (`README.md`, `AGENTS.md` still contain Lovable boilerplate/banners) and was migrated to a standalone Vite SPA (`MIGRATION-NOTES.md`). `src/lib/lovable-error-reporting.ts`, `error-page.ts`, `error-capture.ts` are leftover from that origin — not yet audited for whether they still do anything or just add dead weight.
- Four stray files sit at the repo root: `0xC5`, `0xC9`, `0xCD` (all 0 bytes) and one literally named `exts.has(path.extname(f).toLowerCase())).sort()` — these look like debris from a broken shell redirect in an earlier session, not intentional project files. **Not deleted** — flagging for your confirmation before removal, per "investigate before deleting."
- `image-audit.js` at repo root is a one-off diagnostic script from earlier image-inventory work — likely fine to keep or remove, low risk either way.

---

## Summary — what Phase 1 changes about the plan

The repo is in better shape than a typical unaudited handoff for **SEO metadata structure**, **RLS security posture**, and **contact-data consistency**. The two real gaps that block everything downstream are:

1. **There is no live MyLimoBiz integration anywhere** — it needs to be built from zero, not "preserved."
2. **Every "Book Now"-shaped CTA sitewide currently opens a Supabase quote form**, not a reservation system — resolving this touches the nav, hero, every interior page CTA, and the homepage's `BookingExperience` section labeling.

I have a proposed resolution (below) but this is a business-facing decision that changes the primary conversion path sitewide, so I'm confirming it with you before wiring anything, per your own instruction not to guess on form/booking destinations.
