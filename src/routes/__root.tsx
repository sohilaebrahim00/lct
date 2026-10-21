import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, HeadContent, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { BrandLoader } from "@/components/luxury/brand-loader";
import { RouteTransition } from "@/components/route-transition";
import { Cursor } from "@/components/luxury/cursor";
import { MyLimoBizWidgetHost } from "@/components/booking/mylimobiz-widget";
import { Analytics } from "@/components/analytics";
import { ROOT_JSON_LD, ROOT_META } from "@/lib/site-head";

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
    meta: ROOT_META,
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
    scripts: ROOT_JSON_LD.map((data) => ({
      type: "application/ld+json",
      children: JSON.stringify(data),
    })),
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
