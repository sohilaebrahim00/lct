import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { BLOG_ARTICLES } from "@/lib/blog";
import { IMAGES } from "@/lib/image-map";
import { CONTACT } from "@/lib/site-data";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { revealClipImage } from "@/lib/reveal";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    ...pageMeta({
      title: "Insights — Executive Transportation in Dallas–Fort Worth — LCT Universal",
      description:
        "Guides on airport transfers, corporate transportation, fleet selection, and executive travel across the Dallas–Fort Worth Metroplex from LCT Universal.",
      ogTitle: "Insights — LCT Universal",
      ogDescription: "Executive transportation guides for Dallas–Fort Worth.",
      path: "/blog",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "LCT Universal Insights",
          description: "Executive transportation guides for the Dallas–Fort Worth Metroplex.",
          publisher: { "@type": "Organization", name: "LCT Universal Executive Transports" },
          url: `${CONTACT.siteUrl}/blog`,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${CONTACT.siteUrl}/` },
            { "@type": "ListItem", position: 2, name: "Insights", item: `${CONTACT.siteUrl}/blog` },
          ],
        }),
      },
    ],
  }),
  component: BlogIndex,
});

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function BlogIndex() {
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [featured, ...rest] = BLOG_ARTICLES;
  const featuredImage = IMAGES[featured.heroImage];

  useLayoutEffect(() => {
    const root = heroRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.from(".blog-hero-eyebrow", { autoAlpha: 0, y: 12, duration: 0.6, ease: "power2.out" });
      gsap.from(".blog-hero-title", { autoAlpha: 0, y: 20, duration: 0.7, delay: 0.1, ease: "power2.out" });
      gsap.from(".blog-hero-desc", { autoAlpha: 0, y: 16, duration: 0.6, delay: 0.22, ease: "power2.out" });
    }, root);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const root = gridRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      const featuredCard = root.querySelector(".blog-featured");
      if (featuredCard) revealClipImage(featuredCard.querySelector("img"), { edge: "left", start: "top 85%" });
      gsap.utils.toArray<HTMLElement>(".blog-card").forEach((card, i) => {
        gsap.from(card, {
          autoAlpha: 0,
          y: 28,
          duration: 0.6,
          delay: (i % 3) * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <SiteLayout>
      <section ref={heroRef} className="relative overflow-hidden border-b border-border pt-32 pb-16 md:pt-44 md:pb-20">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--champagne) 10%, transparent), transparent 70%)" }} />
        <div className="relative mx-auto max-w-3xl px-[var(--page-gutter)] text-center">
          <div className="blog-hero-eyebrow mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold/60" />
            <span className="eyebrow">Insights From the Road</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="blog-hero-title font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
            Executive travel, explained.
          </h1>
          <p className="blog-hero-desc mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Practical guides on airport transfers, corporate travel, and fleet selection across the
            Dallas–Fort Worth Metroplex — written for the people who book the trip, not search engines.
          </p>
        </div>
      </section>

      <div ref={gridRef} className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)] py-16 md:py-24">
        {/* Featured article — the newest post gets an editorial, image-led treatment */}
        <Link
          to="/blog/$slug"
          params={{ slug: featured.slug }}
          data-cursor="explore"
          className="blog-featured group grid gap-8 overflow-hidden rounded-sm border border-border lg:grid-cols-2 lg:items-stretch"
        >
          <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
            <img
              src={featuredImage.src}
              alt={featuredImage.alt}
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 [object-position:var(--img-pos-m)] md:[object-position:var(--img-pos-d)]"
              style={{ "--img-pos-m": featuredImage.objectPositionMobile, "--img-pos-d": featuredImage.objectPositionDesktop } as React.CSSProperties}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent lg:bg-gradient-to-r" />
          </div>
          <div className="flex flex-col justify-center bg-[color:var(--surface-elevated)] p-8 md:p-12">
            <span className="eyebrow text-gold">Featured Article</span>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              <span>{featured.category}</span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {featured.readingTime}
              </span>
            </div>
            <h2 className="mt-4 font-display text-3xl leading-tight text-foreground transition-colors group-hover:text-gold md:text-4xl">
              {featured.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{featured.excerpt}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
              Read the article
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
          </div>
        </Link>

        <div className="mt-16 md:mt-20">
          <SectionHeading eyebrow="Latest Insights" title="Every guide, in one place." />

          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => {
              const img = IMAGES[article.heroImage];
              return (
                <Link
                  key={article.slug}
                  to="/blog/$slug"
                  params={{ slug: article.slug }}
                  data-cursor="explore"
                  className="blog-card group flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 [object-position:var(--img-pos-m)] md:[object-position:var(--img-pos-d)]"
                      style={{ "--img-pos-m": img.objectPositionMobile, "--img-pos-d": img.objectPositionDesktop } as React.CSSProperties}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-widest text-gold">
                    <span>{article.category}</span>
                    <span aria-hidden className="text-muted-foreground">·</span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden />
                      {article.readingTime}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl leading-snug text-foreground transition-colors group-hover:text-gold">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
                  <span className="mt-3 text-xs text-muted-foreground/70">{formatDate(article.publishedAt)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <section className="border-t border-border bg-onyx py-20">
        <div className="mx-auto max-w-3xl px-[var(--page-gutter)] text-center">
          <SectionHeading
            align="center"
            eyebrow="Confirm Your Trip"
            title={
              <>
                Ready to <span className="italic text-metallic">book your ride?</span>
              </>
            }
            description="Every fare is calculated instantly through our live booking system."
          />
          <Link
            to="/book"
            data-cursor="book"
            className="mt-8 inline-flex rounded-sm bg-gold-gradient px-8 py-4 text-sm font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)]"
          >
            Book Your Ride
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
