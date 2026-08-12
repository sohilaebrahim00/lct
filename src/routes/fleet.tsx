import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { CheckCircle2, ArrowRight, Phone } from "lucide-react";
import { FLEET_VEHICLES, CONTACT, type FleetVehicle } from "@/lib/site-data";
import { IMAGES } from "@/lib/image-map";
import { LeadForm } from "@/components/lead-form";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { revealClipImage } from "@/lib/reveal";
import { pageMeta } from "@/lib/seo";
import { track } from "@/lib/tracking";

/**
 * Fleet's wheel accent — was a continuously-rendering Three.js scene
 * (a permanent WebGL canvas + render-invalidate loop just to idle-rotate a
 * decorative rim). Per the performance-correction pass: this accent is
 * non-essential, so rather than optimize the WebGL version further, it's
 * replaced outright with the exact same visual as a plain CSS-animated SVG
 * — a GPU-composited transform with zero JS render loop, zero canvas,
 * zero Three.js chunk fetch, at effectively no cost. `motion-reduce:` stops
 * the spin entirely for reduced-motion visitors.
 */
function FleetWheelAccent() {
  const spokes = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    return {
      x1: 60 + Math.cos(angle) * 18,
      y1: 60 + Math.sin(angle) * 18,
      x2: 60 + Math.cos(angle) * 40,
      y2: 60 + Math.sin(angle) * 40,
    };
  });
  return (
    <svg
      viewBox="0 0 120 120"
      className="mx-auto h-full w-auto motion-safe:animate-[spin_26s_linear_infinite]"
      aria-hidden
    >
      <defs>
        <linearGradient id="fleetWheelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4dfa8" />
          <stop offset="55%" stopColor="#d4af6a" />
          <stop offset="100%" stopColor="#8a6a2f" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="45" fill="none" stroke="url(#fleetWheelGrad)" strokeWidth="9" />
      {spokes.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="url(#fleetWheelGrad)" strokeWidth="5" strokeLinecap="round" />
      ))}
      <circle cx="60" cy="60" r="15" fill="#141210" stroke="url(#fleetWheelGrad)" strokeWidth="2" />
    </svg>
  );
}

/** Anchor the sticky/in-chapter quote CTAs scroll to and prefill. */
const FLEET_INQUIRY_ID = "fleet-inquiry";

/** Exact CTA copy per vehicle, per the approved conversion-flow spec — not a generic template. */
const CTA_LABEL: Record<string, string> = {
  sedan: "Book This Vehicle",
  firstClassSedan: "Book This Vehicle",
  suv: "Book This Vehicle",
  luxurySuv: "Book This Vehicle",
  sprinter: "Request a Sprinter Quote",
  coachMini: "Request a Mini Coach Quote",
  coachLarge: "Request a Coach Quote",
};

/** Short supporting line per vehicle, placed right under the name — approved copy, not paragraphs. */
const VEHICLE_BLURB: Record<string, string> = {
  sedan: "Refined point-to-point travel for executives, airport transfers and private rides.",
  firstClassSedan: "The same S-Class, elevated — priority white-glove service for two.",
  suv: "Premium space for families, executives and luggage-heavy airport travel.",
  luxurySuv: "The Escalade at our premium service tier, for clients who want the very best.",
  sprinter: "Private group transportation with executive comfort and flexible capacity.",
  coachMini: "Right-sized group transportation for weddings, shuttles and corporate parties.",
  coachLarge: "Built for conventions, large weddings and coordinated large-scale group travel.",
};

function ctaLabel(v: FleetVehicle) {
  return CTA_LABEL[v.id] ?? (v.status === "bookable" ? "Book This Vehicle" : `Request a ${v.name} Quote`);
}

/**
 * Shared CTA behavior for both the in-chapter buttons and the sticky bar.
 * Bookable vehicles go straight to /book (MyLimoBiz). Quote-only vehicles
 * never claim to be directly bookable — they scroll to and prefill the
 * existing on-page Supabase fleet-inquiry form instead of navigating away,
 * so the vehicle context isn't lost.
 */
function useVehicleQuote(onQuote: (vehicleName: string) => void) {
  return (v: FleetVehicle) => {
    onQuote(v.name);
    track.fleetVehicleQuoteClick(v.id);
    document
      .getElementById(FLEET_INQUIRY_ID)
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  };
}

/**
 * TanStack Router's `<Link>` composes a user-supplied `onClick` with its own
 * internal navigation handler — but empirically (verified with a Playwright
 * repro on this exact page) that composed handler silently never invokes the
 * caller's `onClick` here, while `onClick` on a plain `<button>`/`<a>`
 * elsewhere on this same page fires normally. `onMouseDown` isn't part of
 * Link's composed prop set at all, so it passes straight through untouched
 * and fires reliably — used here specifically to guarantee the
 * `fleet_vehicle_book_click` event actually reaches analytics.
 */
function trackBookMouseDown(v: FleetVehicle) {
  return (e: ReactMouseEvent) => {
    if (e.button !== 0) return; // primary button only — not right/middle-click
    track.fleetVehicleBookClick(v.id);
  };
}

export const Route = createFileRoute("/fleet")({
  head: () =>
    pageMeta({
      title: "Fleet — Sedans, SUVs, Sprinters & Coaches — LCT Universal",
      description:
        "Executive Sedan, First Class Sedan, Executive SUV, Luxury SUV, Mercedes-Benz Sprinter, Executive Mini Coach and Executive Coach. Verified capacities and live rates from LCT Universal in Dallas–Fort Worth.",
      ogTitle: "Fleet — LCT Universal",
      ogDescription: "Executive vehicles with verified capacities.",
      path: "/fleet",
    }),
  component: Fleet,
});

function VehicleCta({
  v,
  onQuote,
  showDispatchCall,
}: {
  v: FleetVehicle;
  onQuote: (vehicle: FleetVehicle) => void;
  /** Only the Coach chapter gets the secondary "Call Dispatch" action, per the approved spec. */
  showDispatchCall?: boolean;
}) {
  const bookable = v.status === "bookable";
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      {bookable ? (
        <Link
          to="/book"
          data-cursor="book"
          onMouseDown={trackBookMouseDown(v)}
          className="group inline-flex w-fit items-center gap-2 rounded-sm bg-gold-gradient px-6 py-3 text-sm font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition hover:brightness-110"
        >
          {ctaLabel(v)}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </Link>
      ) : (
        <button
          type="button"
          data-cursor="explore"
          onClick={() => onQuote(v)}
          className="group inline-flex w-fit items-center gap-2 rounded-sm bg-gold-gradient px-6 py-3 text-sm font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition hover:brightness-110"
        >
          {ctaLabel(v)}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </button>
      )}
      {showDispatchCall && (
        <a
          href={CONTACT.phoneTel}
          onClick={() => track.fleetCallDispatchClick()}
          className="inline-flex w-fit items-center gap-2 rounded-sm border border-champagne/40 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-foreground transition hover:border-champagne hover:text-champagne"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call Dispatch
        </a>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 py-3">
      <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      <span className="font-display text-xl text-gold-gradient">{value}</span>
    </div>
  );
}

/**
 * Restrained sticky conversion bar — desktop and mobile — that updates to
 * the vehicle currently in view. Replaces the generic sitewide MobileBookBar
 * on this page (see `MobileBookBar`'s own /fleet check) rather than stacking
 * a second bottom bar; `FloatingActions` shifts up to clear it (see that
 * component's own /fleet check) so it never overlaps the WhatsApp/phone FABs.
 */
function FleetConversionBar({
  vehicle,
  onQuote,
}: {
  vehicle: FleetVehicle;
  onQuote: (v: FleetVehicle) => void;
}) {
  const bookable = vehicle.status === "bookable";
  // Compact label — the vehicle name is already shown beside it, so the full
  // "Request a Sprinter Quote" would be redundant here.
  const label = bookable ? "Book This Vehicle" : "Request a Quote";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-champagne/25 bg-[color:var(--surface-elevated)]/97 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      style={{ boxShadow: "0 -8px 24px -8px rgba(0,0,0,0.35)" }}
    >
      <div className="mx-auto flex h-16 max-w-[var(--container-max)] items-center justify-between gap-3 px-4 lg:px-10">
        <div className="min-w-0">
          <div className="truncate font-display text-sm text-foreground md:text-base">{vehicle.name}</div>
          <div className="truncate text-[0.7rem] text-muted-foreground">
            {vehicle.pax} passengers · {vehicle.priceLabel}
          </div>
        </div>
        {bookable ? (
          <Link
            to="/book"
            data-cursor="book"
            onMouseDown={trackBookMouseDown(vehicle)}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-sm bg-gold-gradient px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {label}
          </Link>
        ) : (
          <button
            type="button"
            data-cursor="explore"
            onClick={() => onQuote(vehicle)}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-sm bg-gold-gradient px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {label}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Mobile-only "swipe to explore" strip — added per explicit client feedback
 * that 7 full-bleed vehicle chapters stacking straight down felt like "a
 * long amateur-looking page" on mobile. Does NOT restructure the chapters
 * themselves (each remains a normal stacked `<section>`): the sticky
 * `FleetConversionBar` below tracks "current chapter" via an
 * `IntersectionObserver` keyed to vertical scroll position, and every
 * chapter has its own GSAP `ScrollTrigger` reveal timeline — both would
 * break if chapters were converted into actual horizontal-scroll slides.
 * Instead, this is a purely additive native scroll-snap filmstrip (same
 * technique as the existing `/events` "drag to explore" gallery) that lets
 * a visitor preview all 7 vehicles up front and tap one to smooth-scroll
 * straight to its full chapter — desktop is completely unaffected (`lg:hidden`).
 */
function MobileFleetShowcase({ vehicles }: { vehicles: readonly FleetVehicle[] }) {
  return (
    <section className="border-b border-border py-8 lg:hidden">
      <div className="mb-4 px-6">
        <span className="eyebrow">Swipe to explore the fleet</span>
      </div>
      <div className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2">
        {vehicles.map((v) => {
          const img = IMAGES[v.imageKey];
          return (
            <a
              key={v.id}
              href={`#fleet-${v.id}`}
              data-cursor="explore"
              className="group relative aspect-[3/4] w-[62vw] shrink-0 snap-start overflow-hidden rounded-sm sm:w-[42vw]"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-active:scale-105 [object-position:var(--img-pos-m)]"
                style={{ "--img-pos-m": img.objectPositionMobile } as CSSProperties}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="font-display text-lg leading-tight text-off-white">{v.name}</div>
                <div className="mt-1 text-xs text-off-white/75">
                  {v.pax} passengers · {v.priceLabel}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function Fleet() {
  // Looked up by id, not array position — FLEET_VEHICLES grew from 5 to 7
  // entries (2026-08-08 fleet/pricing audit) and positional indices would
  // silently pull the wrong vehicle into the wrong chapter after that.
  const find = (id: string) => FLEET_VEHICLES.find((v) => v.id === id)!;
  const sedan = find("sedan");
  const firstClassSedan = find("firstClassSedan");
  const suv = find("suv");
  const luxurySuv = find("luxurySuv");
  const sprinter = find("sprinter");
  const coachMini = find("coachMini");
  const coachLarge = find("coachLarge");
  const heroImg = IMAGES.fleetHero;

  const [inquiryVehicle, setInquiryVehicle] = useState<string | undefined>();
  const inquiryInitialValues = useMemo(
    () => (inquiryVehicle ? { vehiclePreference: inquiryVehicle } : undefined),
    [inquiryVehicle],
  );
  const handleQuote = useVehicleQuote(setInquiryVehicle);

  const [activeId, setActiveId] = useState<string>(sedan.id);
  const rootRef = useRef<HTMLDivElement>(null);

  // Active-vehicle tracking for the sticky conversion bar — functional, not
  // decorative, so it runs identically regardless of reduced-motion.
  useLayoutEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-vehicle-chapter]"),
    );
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        // Prefer the entry closest to vertical center of the viewport.
        const best = visible.reduce((a, b) =>
          Math.abs(a.boundingClientRect.top) < Math.abs(b.boundingClientRect.top) ? a : b,
        );
        const id = best.target.getAttribute("data-vehicle-chapter");
        if (id) setActiveId(id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const { gsap, ScrollTrigger } = ensureGsap();
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduce) return;

      // Chapter 1 — Sedan: full-bleed reveal, diagonal wipe
      revealClipImage(".ch-sedan-media", { edge: "diagonal", start: "top 78%" });
      gsap.from(".ch-sedan-copy > *", {
        y: 24,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: ".ch-sedan", start: "top 70%" },
      });

      // Chapter 1b — First Class Sedan: same full-bleed language as Sedan,
      // mirrored wipe direction so the two adjacent sedan chapters don't
      // read as an identical repeated beat.
      revealClipImage(".ch-fcs-media", { edge: "diagonal-reverse", start: "top 78%" });
      gsap.from(".ch-fcs-copy > *", {
        y: 24,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: ".ch-fcs", start: "top 70%" },
      });

      // Chapter 2 — SUV: split spec panel + one-shot light sweep
      revealClipImage(".ch-suv-media", { edge: "left", start: "top 78%" });
      gsap.from(".ch-suv-copy > *", {
        y: 24,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.65,
        ease: "power3.out",
        scrollTrigger: { trigger: ".ch-suv", start: "top 75%" },
      });
      ScrollTrigger.create({
        trigger: ".ch-suv-media",
        start: "top 70%",
        once: true,
        onEnter: () =>
          gsap.fromTo(
            ".ch-suv-sweep",
            { xPercent: -140, autoAlpha: 0.9 },
            { xPercent: 220, autoAlpha: 0, duration: 1.1, ease: "power1.inOut", delay: 0.3 },
          ),
      });

      // Chapter 2b — Luxury SUV: same split-panel language as SUV, image on
      // the right instead of the left so the pair doesn't feel copy-pasted.
      revealClipImage(".ch-lsuv-media", { edge: "right", start: "top 78%" });
      gsap.from(".ch-lsuv-copy > *", {
        y: 24,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.65,
        ease: "power3.out",
        scrollTrigger: { trigger: ".ch-lsuv", start: "top 75%" },
      });
      ScrollTrigger.create({
        trigger: ".ch-lsuv-media",
        start: "top 70%",
        once: true,
        onEnter: () =>
          gsap.fromTo(
            ".ch-lsuv-sweep",
            { xPercent: 140, autoAlpha: 0.9 },
            { xPercent: -220, autoAlpha: 0, duration: 1.1, ease: "power1.inOut", delay: 0.3 },
          ),
      });

      // Chapter 3 — Sprinter: asymmetric inset, oversized type behind
      gsap.from(".ch-sprinter-numeral", {
        autoAlpha: 0,
        x: -30,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".ch-sprinter", start: "top 72%" },
      });
      revealClipImage(".ch-sprinter-media", { edge: "up", start: "top 75%" });
      gsap.from(".ch-sprinter-copy > *", {
        y: 20,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.65,
        ease: "power3.out",
        scrollTrigger: { trigger: ".ch-sprinter", start: "top 68%" },
      });

      // Chapter 4 — Mini Coach: wide panoramic banner, slow horizontal drift
      revealClipImage(".ch-coach-media", { edge: "right", start: "top 80%", duration: 1.3 });
      gsap.to(".ch-coach-media img", {
        xPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: ".ch-coach", start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.from(".ch-coach-copy > *", {
        y: 20,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: ".ch-coach", start: "top 75%" },
      });

      // Chapter 5 — Executive Coach: same panoramic banner language as Mini
      // Coach (both are "wide vehicle" chapters), drifting the opposite
      // direction so the two don't read as an identical repeated beat.
      revealClipImage(".ch-coach-large-media", { edge: "left", start: "top 80%", duration: 1.3 });
      gsap.to(".ch-coach-large-media img", {
        xPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: ".ch-coach-large", start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.from(".ch-coach-large-copy > *", {
        y: 20,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: ".ch-coach-large", start: "top 75%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="The Fleet"
        title="Vehicles held to a single measure."
        description="Every LCT Universal vehicle is meticulously maintained and prepared before dispatch — because to each client, it is the only one that matters."
        image={heroImg.src}
        imagePosition={heroImg.objectPositionDesktop}
        imagePositionMobile={heroImg.objectPositionMobile}
        imageEdge="diagonal-reverse"
      />

      {/* One lightweight 3D accent for the whole page, per the brief — an
          abstract rotating alloy rim, purely decorative. Photography in the
          chapters below remains the primary content; this never replaces it. */}
      <div className="mx-auto flex h-24 w-24 max-w-[var(--container-max)] items-center justify-center px-[var(--page-gutter)] pb-2 pt-4 md:h-28 md:w-28">
        <FleetWheelAccent />
      </div>

      <MobileFleetShowcase vehicles={FLEET_VEHICLES} />

      <div ref={rootRef}>
        {/* Chapter 1 — Sedan: full-bleed vehicle-first reveal, text in lower-left negative space */}
        <section id="fleet-sedan" className="ch-sedan relative overflow-hidden" data-vehicle-chapter="sedan">
          <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
            <img
              src={IMAGES.fleetSedan.src}
              alt={IMAGES.fleetSedan.alt}
              loading="lazy"
              className="ch-sedan-media absolute inset-0 h-full w-full object-cover [object-position:var(--img-pos-m)] md:[object-position:var(--img-pos-d)]"
              style={
                {
                  "--img-pos-m": IMAGES.fleetSedan.objectPositionMobile,
                  "--img-pos-d": IMAGES.fleetSedan.objectPositionDesktop,
                } as CSSProperties
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          </div>
          <div className="ch-sedan-copy mx-auto max-w-[var(--container-max)] px-6 pb-16 pt-8 lg:px-10">
            <div className="eyebrow text-champagne">{sedan.model}</div>
            <h2 className="mt-3 font-display text-4xl md:text-6xl">{sedan.name}</h2>
            <p className="mt-3 max-w-md text-sm text-foreground/80">{VEHICLE_BLURB.sedan}</p>
            <div className="mt-6 flex flex-wrap items-end gap-8 border-y border-border py-4">
              <div>
                <div className="eyebrow text-[0.6rem]">Passengers</div>
                <div className="mt-1 font-display text-2xl text-gold-gradient">{sedan.pax}</div>
              </div>
              <div>
                <div className="eyebrow text-[0.6rem]">Luggage</div>
                <div className="mt-1 font-display text-2xl text-gold-gradient">{sedan.bags}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="eyebrow text-[0.6rem]">Pricing</div>
                <div className="mt-1 font-display text-2xl text-gold-gradient">{sedan.priceLabel}</div>
              </div>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {sedan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground/85">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-champagne" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <VehicleCta v={sedan} onQuote={handleQuote} />
          </div>
        </section>

        {/* Chapter 1b — First Class Sedan: same full-bleed template as Sedan
            (same verified S-Class, different real photograph — a white-glove
            chauffeur portrait rather than the exterior valet shot). */}
        <section id="fleet-firstClassSedan" className="ch-fcs relative overflow-hidden border-t border-border" data-vehicle-chapter="firstClassSedan">
          <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
            <img
              src={IMAGES.fleetFirstClassSedan.src}
              alt={IMAGES.fleetFirstClassSedan.alt}
              loading="lazy"
              className="ch-fcs-media absolute inset-0 h-full w-full object-cover [object-position:var(--fcs-pos-m)] md:[object-position:var(--fcs-pos-d)]"
              style={
                {
                  "--fcs-pos-m": IMAGES.fleetFirstClassSedan.objectPositionMobile,
                  "--fcs-pos-d": IMAGES.fleetFirstClassSedan.objectPositionDesktop,
                } as CSSProperties
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          </div>
          <div className="ch-fcs-copy mx-auto max-w-[var(--container-max)] px-6 pb-16 pt-8 lg:px-10">
            <div className="eyebrow text-champagne">{firstClassSedan.model}</div>
            <h2 className="mt-3 font-display text-4xl md:text-6xl">{firstClassSedan.name}</h2>
            <p className="mt-3 max-w-md text-sm text-foreground/80">{VEHICLE_BLURB.firstClassSedan}</p>
            <div className="mt-6 flex flex-wrap items-end gap-8 border-y border-border py-4">
              <div>
                <div className="eyebrow text-[0.6rem]">Passengers</div>
                <div className="mt-1 font-display text-2xl text-gold-gradient">{firstClassSedan.pax}</div>
              </div>
              <div>
                <div className="eyebrow text-[0.6rem]">Luggage</div>
                <div className="mt-1 font-display text-2xl text-gold-gradient">{firstClassSedan.bags}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="eyebrow text-[0.6rem]">Pricing</div>
                <div className="mt-1 font-display text-2xl text-gold-gradient">{firstClassSedan.priceLabel}</div>
              </div>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {firstClassSedan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground/85">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-champagne" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <VehicleCta v={firstClassSedan} onQuote={handleQuote} />
          </div>
        </section>

        {/* Chapter 2 — SUV: split spotlight specification panel */}
        <section id="fleet-suv" className="ch-suv border-t border-border" data-vehicle-chapter="suv">
          <div className="mx-auto grid max-w-[var(--container-max)] gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:py-28">
            <div className="ch-suv-media relative overflow-hidden rounded-sm luxe-card">
              <img
                src={IMAGES.fleetSuv.src}
                alt={IMAGES.fleetSuv.alt}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover [object-position:var(--img-pos-m)] md:[object-position:var(--img-pos-d)]"
                style={
                  {
                    "--img-pos-m": IMAGES.fleetSuv.objectPositionMobile,
                    "--img-pos-d": IMAGES.fleetSuv.objectPositionDesktop,
                  } as CSSProperties
                }
              />
              <div className="ch-suv-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 opacity-0" style={{ background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--champagne) 55%, white), transparent)", mixBlendMode: "screen" }} />
            </div>
            <div className="ch-suv-copy rounded-sm border border-border/60 bg-[color:var(--surface-elevated)]/40 p-8">
              <div className="eyebrow">{suv.model}</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">{suv.name}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{VEHICLE_BLURB.suv}</p>
              <div className="mt-6">
                <SpecRow label="Passengers" value={suv.pax} />
                <SpecRow label="Luggage" value={suv.bags ?? "—"} />
                <SpecRow label="Pricing" value={suv.priceLabel} />
              </div>
              <VehicleCta v={suv} onQuote={handleQuote} />
            </div>
          </div>
        </section>

        {/* Chapter 2b — Luxury SUV: same split-panel template as SUV, image
            and copy columns swapped so the adjacent pair doesn't feel
            copy-pasted (same verified Escalade, different real photograph —
            rear 3/4 vs. SUV's front 3/4). */}
        <section id="fleet-luxurySuv" className="ch-lsuv border-t border-border" data-vehicle-chapter="luxurySuv">
          <div className="mx-auto grid max-w-[var(--container-max)] gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:py-28">
            <div className="ch-lsuv-copy order-2 rounded-sm border border-border/60 bg-[color:var(--surface-elevated)]/40 p-8 lg:order-1">
              <div className="eyebrow">{luxurySuv.model}</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">{luxurySuv.name}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{VEHICLE_BLURB.luxurySuv}</p>
              <div className="mt-6">
                <SpecRow label="Passengers" value={luxurySuv.pax} />
                <SpecRow label="Luggage" value={luxurySuv.bags ?? "—"} />
                <SpecRow label="Pricing" value={luxurySuv.priceLabel} />
              </div>
              <VehicleCta v={luxurySuv} onQuote={handleQuote} />
            </div>
            <div className="ch-lsuv-media relative order-1 overflow-hidden rounded-sm luxe-card lg:order-2">
              <img
                src={IMAGES.fleetLuxurySuv.src}
                alt={IMAGES.fleetLuxurySuv.alt}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover [object-position:var(--img-pos-m)] md:[object-position:var(--img-pos-d)]"
                style={
                  {
                    "--img-pos-m": IMAGES.fleetLuxurySuv.objectPositionMobile,
                    "--img-pos-d": IMAGES.fleetLuxurySuv.objectPositionDesktop,
                  } as CSSProperties
                }
              />
              <div className="ch-lsuv-sweep pointer-events-none absolute inset-y-0 right-0 w-1/3 opacity-0" style={{ background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--champagne) 55%, white), transparent)", mixBlendMode: "screen" }} />
            </div>
          </div>
        </section>

        {/* Chapter 3 — Sprinter: asymmetric inset image, oversized type */}
        <section
          id="fleet-sprinter"
          className="ch-sprinter relative overflow-hidden border-t border-border py-20 lg:py-28"
          data-vehicle-chapter="sprinter"
        >
          <div
            className="ch-sprinter-numeral pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 select-none font-display text-[26vw] leading-none text-off-white/[0.04] lg:text-[16vw]"
            aria-hidden
          >
            Sprinter
          </div>
          <div className="relative mx-auto grid max-w-[var(--container-max)] gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-10">
            <div className="ch-sprinter-copy order-2 lg:order-1">
              <div className="eyebrow text-champagne">{sprinter.model}</div>
              <h2 className="mt-3 font-display text-4xl text-off-white md:text-5xl">{sprinter.name}</h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-off-white/70">
                {VEHICLE_BLURB.sprinter}
              </p>
              <ul className="mt-6 space-y-3">
                {sprinter.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-off-white/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-end gap-8">
                <div>
                  <div className="eyebrow text-[0.6rem] text-off-white/50">Passengers</div>
                  <div className="mt-1 font-display text-2xl text-gold-gradient">{sprinter.pax}</div>
                </div>
                <div>
                  <div className="eyebrow text-[0.6rem] text-off-white/50">Pricing</div>
                  <div className="mt-1 font-display text-2xl text-gold-gradient">{sprinter.priceLabel}</div>
                </div>
              </div>
              <VehicleCta v={sprinter} onQuote={handleQuote} />
            </div>
            <div className="ch-sprinter-media order-1 overflow-hidden rounded-sm luxe-card lg:order-2 lg:ml-12">
              <img
                src={IMAGES.sprinterInterior.src}
                alt={IMAGES.sprinterInterior.alt}
                loading="lazy"
                className="aspect-[3/2] w-full object-cover [object-position:var(--img-pos-m)] md:[object-position:var(--img-pos-d)]"
                style={
                  {
                    "--img-pos-m": IMAGES.sprinterInterior.objectPositionMobile,
                    "--img-pos-d": IMAGES.sprinterInterior.objectPositionDesktop,
                  } as CSSProperties
                }
              />
            </div>
          </div>
        </section>

        {/* Chapter 4 — Executive Mini Coach: wide panoramic banner */}
        <section id="fleet-coachMini" className="ch-coach relative overflow-hidden border-t border-border" data-vehicle-chapter="coachMini">
          <div className="ch-coach-media relative aspect-[16/9] w-full overflow-hidden md:aspect-[24/9]">
            <img
              src={IMAGES.fleetCoach.src}
              alt={IMAGES.fleetCoach.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-[112%] object-cover [object-position:var(--img-pos-m)] md:[object-position:var(--img-pos-d)]"
              style={
                {
                  "--img-pos-m": IMAGES.fleetCoach.objectPositionMobile,
                  "--img-pos-d": IMAGES.fleetCoach.objectPositionDesktop,
                } as CSSProperties
              }
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/15 to-transparent" />
          </div>
          <div className="ch-coach-copy mx-auto max-w-[var(--container-max)] px-6 pb-16 pt-8 lg:px-10">
            <div className="eyebrow">{coachMini.model}</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">{coachMini.name}</h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">{VEHICLE_BLURB.coachMini}</p>
            <div className="mt-6 flex flex-wrap items-end gap-8">
              <div>
                <div className="eyebrow text-[0.6rem]">Passengers</div>
                <div className="mt-1 font-display text-2xl text-gold-gradient">{coachMini.pax}</div>
              </div>
              <div>
                <div className="eyebrow text-[0.6rem]">Pricing</div>
                <div className="mt-1 font-display text-2xl text-gold-gradient">{coachMini.priceLabel}</div>
              </div>
            </div>
            <VehicleCta v={coachMini} onQuote={handleQuote} showDispatchCall />
          </div>
        </section>

        {/* Chapter 5 — Executive Coach: wide panoramic banner, full-size motorcoach */}
        <section
          id="fleet-coachLarge"
          className="ch-coach-large relative overflow-hidden border-t border-border"
          data-vehicle-chapter="coachLarge"
        >
          <div className="ch-coach-large-media relative aspect-[16/9] w-full overflow-hidden md:aspect-[24/9]">
            <img
              src={IMAGES.groupCoachStory.src}
              alt={IMAGES.groupCoachStory.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-[112%] object-cover [object-position:var(--img-pos-m)] md:[object-position:var(--img-pos-d)]"
              style={
                {
                  "--img-pos-m": IMAGES.groupCoachStory.objectPositionMobile,
                  "--img-pos-d": IMAGES.groupCoachStory.objectPositionDesktop,
                } as CSSProperties
              }
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/15 to-transparent" />
          </div>
          <div className="ch-coach-large-copy mx-auto max-w-[var(--container-max)] px-6 pb-16 pt-8 lg:px-10">
            <div className="eyebrow">{coachLarge.model}</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">{coachLarge.name}</h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">{VEHICLE_BLURB.coachLarge}</p>
            <div className="mt-6 flex flex-wrap items-end gap-8">
              <div>
                <div className="eyebrow text-[0.6rem]">Passengers</div>
                <div className="mt-1 font-display text-2xl text-gold-gradient">{coachLarge.pax}</div>
              </div>
              <div>
                <div className="eyebrow text-[0.6rem]">Pricing</div>
                <div className="mt-1 font-display text-2xl text-gold-gradient">{coachLarge.priceLabel}</div>
              </div>
            </div>
            <VehicleCta v={coachLarge} onQuote={handleQuote} showDispatchCall />
          </div>
        </section>
      </div>

      <section id={FLEET_INQUIRY_ID} className="scroll-mt-24 border-t border-border bg-onyx py-24">
        <div className="mx-auto max-w-3xl px-[var(--page-gutter)]">
          <SectionHeading
            align="center"
            eyebrow="Fleet Inquiry"
            title={
              <>
                Ask about a <span className="italic text-gold-gradient">specific vehicle.</span>
              </>
            }
            description="Questions about a particular vehicle, group capacity, or availability? Send us an inquiry."
          />
          <div className="mt-12">
            <LeadForm
              formType="fleet"
              submitLabel="Send Fleet Inquiry"
              initialValues={inquiryInitialValues}
              fields={[
                { name: "customerName", label: "Full Name", required: true, colSpan: 1 },
                {
                  name: "customerEmail",
                  label: "Email",
                  type: "email",
                  required: true,
                  colSpan: 1,
                },
                { name: "phone", label: "Phone", type: "tel", colSpan: 2 },
                {
                  name: "vehiclePreference",
                  label: "Vehicle of Interest",
                  type: "select",
                  colSpan: 2,
                  options: FLEET_VEHICLES.map((f) => f.name),
                },
                { name: "passengers", label: "Passengers", type: "number", colSpan: 1 },
                { name: "luggage", label: "Luggage", type: "number", colSpan: 1 },
                {
                  name: "specialRequests",
                  label: "Your Question",
                  type: "textarea",
                  rows: 4,
                  colSpan: 2,
                },
              ]}
            />
          </div>
        </div>
      </section>

      <FleetConversionBar
        vehicle={FLEET_VEHICLES.find((v) => v.id === activeId) ?? sedan}
        onQuote={handleQuote}
      />
    </SiteLayout>
  );
}
