import { COMPANY, CONTACT, NAV_LINKS, SERVICE_AREA_GROUPS, SERVICES_VERIFIED } from "./site-data";

/**
 * Sitewide head metadata and structured data, shared by two consumers:
 *
 * - `__root.tsx`'s `head()`, which renders them at runtime (each route's own
 *   `head()` overrides the defaults per page);
 * - the `staticCrawlerContent` plugin in `vite.config.ts`, which writes the
 *   same tags, plus a plain-HTML summary of the business, into the built
 *   `index.html`.
 *
 * Why the static copy exists: the SPA ships an empty `<div id="root">`, so
 * anything that reads the page without running JavaScript (security-vendor
 * categorization crawlers, ISP router filters, link-preview scrapers) used to
 * see no title, no description and no text at all, only script tags. That is
 * the profile of a phishing kit, and `lctuniversal.com` was left with no
 * category at any vendor and blocked by business/ISP filters (see
 * DOMAIN_RECATEGORIZATION.md). `main.tsx` removes the static copy before
 * React renders, so the live page never has duplicate tags.
 */

const OG_IMAGE = `${CONTACT.siteUrl}/assets/official/group-coach-bus.jpg`;
const SITE_TITLE = "LCT Universal — Executive Transportation in Dallas–Fort Worth";

export const ROOT_META: Array<
  | { charSet: string }
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
> = [
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { title: SITE_TITLE },
  {
    name: "description",
    content:
      "LCT Universal Executive Transports — premium chauffeured transportation in Dallas–Fort Worth and Grapevine, Texas. Airport transfers, corporate travel, and VIP service. Available 24/7.",
  },
  { name: "author", content: "LCT Universal" },
  { name: "theme-color", content: "#141210" },
  { property: "og:title", content: SITE_TITLE },
  {
    property: "og:description",
    content:
      "Premium chauffeured transportation in Dallas–Fort Worth and Grapevine, Texas. Airport transfers, corporate travel, and VIP service.",
  },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: "LCT Universal" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: SITE_TITLE },
  {
    name: "twitter:description",
    content: "Premium chauffeured transportation in Dallas–Fort Worth and Grapevine, Texas.",
  },
  { property: "og:image", content: OG_IMAGE },
];

export const ROOT_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: COMPANY.legalName,
    alternateName: COMPANY.name,
    image: OG_IMAGE,
    url: CONTACT.siteUrl,
    telephone: CONTACT.phoneDisplay,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: CONTACT.city,
      addressRegion: "TX",
      postalCode: CONTACT.zip,
      addressCountry: "US",
    },
    // Updated 2026-08-11 — was a single free-text string
    // (CONTACT.serviceRegion); the client explicitly asked for the
    // full DFW Metroplex coverage list to be represented in
    // structured data via `areaServed`. An array of real City names
    // does not claim a physical branch office in each one (that
    // claim only exists in the single `address` field above, which
    // is untouched) — schema.org's own guidance is that `areaServed`
    // states coverage, not location.
    areaServed: SERVICE_AREA_GROUPS.flatMap((g) => g.cities).map((name) => ({
      "@type": "City",
      name,
    })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    // Symbolic tier indicator, not a literal quoted figure — the old
    // site's fixed "$100/hour" style rates were confirmed inaccurate
    // against the live booking system (2026-08-08) and dropped
    // site-wide; schema.org's priceRange accepts this "$"-style
    // symbolic form specifically for cases like this.
    priceRange: "$$$",
    sameAs: [
      CONTACT.facebookUrl,
      CONTACT.instagramUrl,
      CONTACT.tiktokUrl,
      CONTACT.youtubeUrl,
    ].filter((url): url is string => Boolean(url)),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: COMPANY.name,
    url: CONTACT.siteUrl,
  },
];

/** Marks every static tag so `main.tsx` can remove them before React renders. */
export const STATIC_HEAD_ATTR = "data-static-head";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** `<head>` tags for the built index.html. charset/viewport are already static there. */
export function staticHeadHtml(): string {
  const tags: string[] = [];
  for (const m of ROOT_META) {
    if ("title" in m) tags.push(`<title ${STATIC_HEAD_ATTR}>${esc(m.title)}</title>`);
    else if ("name" in m && m.name !== "viewport")
      tags.push(`<meta ${STATIC_HEAD_ATTR} name="${esc(m.name)}" content="${esc(m.content)}" />`);
    else if ("property" in m)
      tags.push(
        `<meta ${STATIC_HEAD_ATTR} property="${esc(m.property)}" content="${esc(m.content)}" />`,
      );
  }
  for (const data of ROOT_JSON_LD) {
    // `<` escaped so no string value can close the script element early.
    const json = JSON.stringify(data).replace(/</g, "\\u003c");
    tags.push(`<script type="application/ld+json" ${STATIC_HEAD_ATTR}>${json}</script>`);
  }
  return tags.join("\n    ");
}

/**
 * Plain-HTML business summary placed inside `<div id="root">`. React replaces
 * it on its first render, so visitors only glimpse the top block (styled like
 * the brand loader); without JavaScript it stays as a usable page.
 */
export function staticShellHtml(): string {
  const nav = [...NAV_LINKS, { to: "/book", label: "Book Now" }]
    .map((l) => `<a href="${l.to}">${esc(l.label)}</a>`)
    .join("");
  const services = SERVICES_VERIFIED.map(
    (s) => `<li><strong>${esc(s.title)}</strong> — ${esc(s.desc)}</li>`,
  ).join("");
  const areas = SERVICE_AREA_GROUPS.map((g) => esc(g.title)).join(" · ");
  const phone = `<a href="${CONTACT.phoneTel}">${esc(CONTACT.phoneDisplay)}</a>`;
  const email = `<a href="${CONTACT.emailMailto}">${esc(CONTACT.email)}</a>`;

  return `
      <style>
        .lct-static{background:#141210;color:#f4efe6;font-family:"Manrope Variable",system-ui,sans-serif;line-height:1.6}
        .lct-static a{color:#d4b46a}
        .lct-static__hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;padding:0 1rem;text-align:center}
        .lct-static__hero p:first-child{letter-spacing:.3em;text-transform:uppercase;font-size:.75rem;color:#d4b46a}
        .lct-static h1{font-family:"Cormorant Garamond",Georgia,serif;font-weight:500;font-size:clamp(2rem,6vw,3.5rem);line-height:1.1}
        .lct-static h2{font-family:"Cormorant Garamond",Georgia,serif;font-weight:500;font-size:1.5rem;margin-bottom:.5rem}
        .lct-static__body{max-width:48rem;margin:0 auto;padding:0 1rem 4rem;display:grid;gap:2rem;font-size:.95rem}
        .lct-static nav{display:flex;flex-wrap:wrap;gap:.5rem 1.25rem}
        .lct-static ul{display:grid;gap:.5rem}
      </style>
      <div class="lct-static">
        <header class="lct-static__hero">
          <p>${esc(COMPANY.name)}</p>
          <h1>${esc(COMPANY.legalName)}</h1>
          <p>Executive chauffeured transportation in ${esc(CONTACT.serviceRegion)}. Available ${esc(CONTACT.dispatchHours)}.</p>
          <noscript><p>This site needs JavaScript. To book or request a quote, call ${phone} or email ${email}.</p></noscript>
        </header>
        <div class="lct-static__body">
          <nav aria-label="Site">${nav}</nav>
          <section>
            <h2>About</h2>
            <p>${esc(COMPANY.shortDescription)} Airport transfers, corporate travel, events and group transportation across ${esc(CONTACT.serviceRegion)}.</p>
          </section>
          <section>
            <h2>Services</h2>
            <ul>${services}</ul>
          </section>
          <section>
            <h2>Service areas</h2>
            <p>${areas}</p>
          </section>
          <section>
            <h2>Contact</h2>
            <p>${phone} · ${email} · ${esc(CONTACT.locationLine)}</p>
          </section>
        </div>
      </div>
    `;
}
