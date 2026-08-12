import { ReactNode, useLayoutEffect, useRef, type CSSProperties } from "react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";
import { FloatingActions } from "./floating-actions";
import { MobileBookBar } from "./mobile-book-bar";
import { ScrollProgress } from "./luxury/scroll-progress";
import { ConciergeLauncher } from "./concierge/concierge-launcher";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { revealLines, revealClipImage } from "@/lib/reveal";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-[52px] text-foreground lg:pb-0">
      <ScrollProgress />
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
      <FloatingActions />
      <MobileBookBar />
      <ConciergeLauncher />
    </div>
  );
}

type PageHeroEdge = "left" | "right" | "up" | "down" | "diagonal" | "diagonal-reverse";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imagePosition,
  imagePositionMobile,
  imageEdge = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  image?: string;
  /** Desktop (`md:` and up) object-position. */
  imagePosition?: string;
  /** Below-`md` object-position — falls back to `imagePosition` when omitted, never a bare default center crop. */
  imagePositionMobile?: string;
  imageEdge?: PageHeroEdge;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const { gsap } = ensureGsap();
    const reduce = prefersReducedMotion();
    let split: ReturnType<typeof revealLines> = null;

    const ctx = gsap.context(() => {
      if (reduce) return;
      const img = root.querySelector(".pagehero-media");
      if (img) revealClipImage(img, { edge: imageEdge, start: "top 90%" });

      gsap.from(".pagehero-line", {
        scaleX: 0,
        transformOrigin: "center",
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 85%" },
      });
      gsap.from(".pagehero-eyebrow", {
        autoAlpha: 0,
        y: 12,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 85%" },
      });

      const titleEl = root.querySelector(".pagehero-title");
      split = revealLines(titleEl, { start: "top 85%" });

      gsap.from(".pagehero-desc", {
        autoAlpha: 0,
        y: 16,
        duration: 0.7,
        delay: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 85%" },
      });
    }, root);

    return () => {
      split?.revert();
      ctx.revert();
    };
  }, [imageEdge]);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28"
    >
      {image && (
        <>
          <img
            src={image}
            alt=""
            className="pagehero-media absolute inset-0 h-full w-full object-cover opacity-70 [object-position:var(--pagehero-pos-m)] md:[object-position:var(--pagehero-pos-d)]"
            style={
              imagePosition || imagePositionMobile
                ? ({
                    "--pagehero-pos-m": imagePositionMobile ?? imagePosition,
                    "--pagehero-pos-d": imagePosition ?? imagePositionMobile,
                  } as CSSProperties)
                : undefined
            }
          />
          {/* Localized: a soft spotlight behind the centered title/copy keeps
              text readable without darkening the whole photo — the edges
              (where the actual subject usually sits) stay visible. A gentle
              top/bottom fade blends into the nav and the next section
              instead of a near-opaque flat panel. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 65% at 50% 50%, color-mix(in oklab, var(--background) 68%, transparent), transparent 72%), linear-gradient(to bottom, color-mix(in oklab, var(--background) 50%, transparent) 0%, transparent 30%, transparent 64%, color-mix(in oklab, var(--background) 60%, transparent) 100%)",
            }}
          />
        </>
      )}
      {/* A soft text-shadow (inert on the flat-background pages that pass no
          `image`) guarantees legibility against any photo's busiest spots
          without having to darken the whole image to cover worst-case
          content — the localized gradient above handles the general mood,
          this handles the guarantee. */}
      <div
        className="relative mx-auto max-w-5xl px-6 text-center lg:px-10"
        style={image ? { textShadow: "0 2px 20px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.65)" } : undefined}
      >
        <div className="mb-5 flex items-center justify-center gap-3">
          <span className="pagehero-line h-px w-8 bg-gold/60" />
          <span className="pagehero-eyebrow eyebrow">{eyebrow}</span>
          <span className="pagehero-line h-px w-8 bg-gold/60" />
        </div>
        <h1 className="pagehero-title font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
          {title}
        </h1>
        {description && (
          <p className="pagehero-desc mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
