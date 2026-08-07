import { createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { ShieldCheck, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { BOOKING, CONTACT } from "@/lib/site-data";
import { IMAGES } from "@/lib/image-map";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { MYLIMOBIZ_SLOT_ID, useMyLimoBizStatus } from "@/components/booking/mylimobiz-widget";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/book")({
  head: () =>
    pageMeta({
      title: "Book Your Ride — LCT Universal Executive Transports",
      description:
        "Reserve executive chauffeured transportation in Dallas–Fort Worth and Grapevine, Texas. Secure online booking, available 24/7.",
      ogTitle: "Book Your Ride — LCT Universal",
      ogDescription: "Reserve executive chauffeured transportation in Dallas–Fort Worth and Grapevine, Texas.",
      path: "/book",
    }),
  component: BookPage,
});

function BookPage() {
  const rootRef = useRef<HTMLElement>(null);
  const status = useMyLimoBizStatus();
  const experience = IMAGES.bookExperience;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.from(".book-intro > *", {
        y: 18,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      });
      gsap.from(".book-panel", {
        y: 24,
        autoAlpha: 0,
        duration: 0.7,
        delay: 0.2,
        ease: "power3.out",
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <SiteLayout>
      <section ref={rootRef} className="mx-auto max-w-4xl px-[var(--page-gutter)] pt-36 pb-24 md:pt-44">
        <div className="book-intro text-center">
          <div className="mx-auto mb-6 h-20 w-20 overflow-hidden rounded-full ring-1 ring-champagne/40 shadow-[var(--shadow-luxe)]">
            <img
              src={experience.src}
              alt={experience.alt}
              className="h-full w-full object-cover"
              style={{ objectPosition: experience.objectPositionDesktop }}
              loading="lazy"
            />
          </div>
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold/60" />
            <span className="eyebrow">Reservations</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="font-display text-4xl leading-[1.05] text-foreground md:text-6xl">
            Reserve your ride.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Live availability and instant confirmation across {CONTACT.serviceRegion}. Booking is
            handled by our secure reservation partner.
          </p>
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 text-xs text-muted-foreground/80">
            <ShieldCheck className="h-4 w-4 shrink-0 text-champagne" aria-hidden />
            <span>Encrypted checkout, operated by MyLimoBiz — LCT Universal's booking system</span>
          </div>
        </div>

        <div className="book-panel luxe-card mt-12 overflow-hidden rounded-sm p-2 md:p-4">
          <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-2 md:px-4">
            <span className="text-xs text-muted-foreground">Secure booking window</span>
            <a
              href={BOOKING.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-champagne"
            >
              Open in a new tab
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>

          <div className="relative min-h-[900px] w-full overflow-hidden rounded-sm bg-background/40">
            {(status === "idle" || status === "loading") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-champagne" aria-hidden />
                <p className="text-sm text-muted-foreground">Loading the reservation system…</p>
              </div>
            )}

            {(status === "timeout" || status === "error") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <AlertTriangle className="h-6 w-6 text-gold" aria-hidden />
                <div>
                  <p className="font-display text-xl text-foreground">
                    The booking window is taking longer than expected to load.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You can open the reservation system directly, or call us to book by phone.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={BOOKING.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-sm bg-gold-gradient px-6 py-3 text-xs font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)]"
                  >
                    Open Reservation System
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                  <a
                    href={CONTACT.phoneTel}
                    className="inline-flex items-center gap-2 rounded-sm border border-champagne/35 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-foreground transition hover:border-champagne hover:text-champagne"
                  >
                    Call {CONTACT.phoneDisplay}
                  </a>
                </div>
              </div>
            )}

            {/* Live widget portals in here via #mylimobiz-slot once loaded */}
            <div id={MYLIMOBIZ_SLOT_ID} className="relative w-full" />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Prefer to speak with someone directly?{" "}
          <a href={CONTACT.phoneTel} className="text-champagne hover:underline">
            {CONTACT.phoneDisplay}
          </a>{" "}
          · {CONTACT.dispatchHours}
        </p>
      </section>
    </SiteLayout>
  );
}
