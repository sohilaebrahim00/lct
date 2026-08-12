import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, HeadContent, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { BrandLoader } from "@/components/luxury/brand-loader";
import { RouteTransition } from "@/components/route-transition";
import { Cursor } from "@/components/luxury/cursor";
import { MyLimoBizWidgetHost } from "@/components/booking/mylimobiz-widget";
import { Analytics } from "@/components/analytics";
import { COMPANY, CONTACT, SERVICE_AREA_GROUPS } from "@/lib/site-data";

function NotFoundComponent() {
  // A static-hosted SPA fallback (see public/.htaccess) always serves this
  // route with an HTTP 200 — there is no server-side way to know a path is
  // invalid before index.html loads. This is the closest correct signal
  // achievable without a serverless/edge function: mark the *document* as
  // not-indexable once the client confirms the route doesn't exist, so a
  // crawler that executes JS (Googlebot does) still gets a noindex signal
  // instead of a false "200 OK" for content that says "not found".
  useEffect(() => {
    document.title = "Page Not Found — LCT Universal";
    let tag = document.querySelector('meta[name="robots"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "robots");
      document.head.appendChild(tag);
    }
    const prev = tag.getAttribute("content");
    tag.setAttribute("content", "noindex, follow");
    return () => {
      if (prev) tag!.setAttribute("content", prev);
      else tag!.remove();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LCT Universal — Executive Transportation in Dallas–Fort Worth" },
      {
        name: "description",
        content:
          "LCT Universal Executive Transports — premium chauffeured transportation in Dallas–Fort Worth and Grapevine, Texas. Airport transfers, corporate travel, and VIP service. Available 24/7.",
      },
      { name: "author", content: "LCT Universal" },
      { name: "theme-color", content: "#141210" },
      {
        property: "og:title",
        content: "LCT Universal — Executive Transportation in Dallas–Fort Worth",
      },
      {
        property: "og:description",
        content:
          "Premium chauffeured transportation in Dallas–Fort Worth and Grapevine, Texas. Airport transfers, corporate travel, and VIP service.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "LCT Universal" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "LCT Universal — Executive Transportation in Dallas–Fort Worth",
      },
      {
        name: "twitter:description",
        content: "Premium chauffeured transportation in Dallas–Fort Worth and Grapevine, Texas.",
      },
      { property: "og:image", content: `${CONTACT.siteUrl}/assets/official/group-coach-bus.jpg` },
    ],
    links: [
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      // No root-level canonical here: `links` entries aren't deduped by
      // `rel` the way `meta` is deduped by name/property, so a root
      // canonical would sit alongside — not override — each leaf route's
      // own (verified: without this, /fleet rendered two conflicting
      // <link rel="canonical"> tags). Every route supplies its own via
      // `pageMeta()`, so this fallback isn't needed as long as that stays true.
      // Font preconnect + stylesheet are loaded statically in index.html
      // instead (fires before JS parses, and avoids fetching the exact
      // same Google Fonts CSS twice — verified this was happening: this
      // block used to duplicate index.html's now-corrected static link).
      //
      // A sitewide `rel="preload"` for group-coach-bus.jpg used to live
      // here — a leftover from when that file was the Hero image, before
      // the 2026-08-07 swap to hero-fleet-lineup.jpg (see image-map.ts).
      // It was never updated, so every one of the 17 routes was
      // force-fetching a large image at high priority even on the 16
      // routes that never render it at all. Removed 2026-08-08
      // (mobile-first performance pass) — the actual Hero image now has
      // its own correct, breakpoint-specific preload in index.tsx.
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: COMPANY.legalName,
          alternateName: COMPANY.name,
          image: `${CONTACT.siteUrl}/assets/official/group-coach-bus.jpg`,
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
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
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
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: COMPANY.name,
          url: CONTACT.siteUrl,
        }),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <BrandLoader />
      <RouteTransition />
      <Cursor />
      <MyLimoBizWidgetHost />
      <Analytics />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
