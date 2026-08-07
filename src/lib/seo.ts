import { CONTACT } from "./site-data";

/** Used whenever a route doesn't supply its own — a real, already-approved brand photo, not a placeholder. */
const DEFAULT_OG_IMAGE = "/assets/official/group-coach-bus.jpg";

/**
 * One source of truth for a route's `head()` metadata — guarantees every
 * indexable page gets a unique title/description, an *absolute* canonical
 * and og:url (TanStack's per-route `head()` values were previously relative,
 * e.g. `"/fleet"`, which is invalid for canonical/og:url), and complete
 * Open Graph + Twitter Card tags instead of the partial set some routes had.
 */
export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  image?: string;
  noindex?: boolean;
}) {
  const url = `${CONTACT.siteUrl}${opts.path}`;
  const ogTitle = opts.ogTitle ?? opts.title;
  const ogDescription = opts.ogDescription ?? opts.description;
  const image = opts.image ?? DEFAULT_OG_IMAGE;
  const imageUrl = image.startsWith("http") ? image : `${CONTACT.siteUrl}${image}`;

  const meta = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDescription },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "LCT Universal" },
    { property: "og:image", content: imageUrl },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: ogTitle },
    { name: "twitter:description", content: ogDescription },
    { name: "twitter:image", content: imageUrl },
    ...(opts.noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
  ];

  return { meta, links: [{ rel: "canonical", href: url }] };
}
