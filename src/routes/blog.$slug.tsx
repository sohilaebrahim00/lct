import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { ArrowRight, Clock, ChevronRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { BLOG_ARTICLES, getArticleBySlug, getRelatedArticles } from "@/lib/blog";
import { IMAGES } from "@/lib/image-map";
import { CONTACT } from "@/lib/site-data";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { revealLines } from "@/lib/reveal";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const article = getArticleBySlug(params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData: article }) => {
    if (!article) return {};
    const image = IMAGES[article.heroImage];
    const imageUrl = `${CONTACT.siteUrl}${image.src}`;
    return {
      ...pageMeta({
        title: article.seoTitle,
        description: article.seoDescription,
        ogTitle: article.title,
        ogDescription: article.excerpt,
        path: `/blog/${article.slug}`,
        image: image.src,
      }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt,
            image: imageUrl,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            author: { "@type": "Organization", name: "LCT Universal Executive Transports" },
            publisher: {
              "@type": "Organization",
              name: "LCT Universal Executive Transports",
              logo: { "@type": "ImageObject", url: `${CONTACT.siteUrl}/assets/lct-universal-logo-transparent.png` },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": `${CONTACT.siteUrl}/blog/${article.slug}` },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${CONTACT.siteUrl}/` },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${CONTACT.siteUrl}/blog` },
              { "@type": "ListItem", position: 3, name: article.title, item: `${CONTACT.siteUrl}/blog/${article.slug}` },
            ],
          }),
        },
      ],
    };
  },
  component: BlogArticlePage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-[var(--page-gutter)] py-40 text-center">
        <p className="eyebrow text-gold">404</p>
        <h1 className="mt-4 font-display text-4xl text-foreground">Article not found.</h1>
        <p className="mt-4 text-muted-foreground">This article may have moved. Browse all Insights below.</p>
        <Link to="/blog" className="mt-8 inline-flex rounded-sm bg-gold-gradient px-8 py-4 text-sm font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)]">
          View Insights
        </Link>
      </div>
    </SiteLayout>
  ),
});

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function BlogArticlePage() {
  const article = Route.useLoaderData();
  const rootRef = useRef<HTMLDivElement>(null);
  const image = IMAGES[article.heroImage];
  const related = getRelatedArticles(article, 3);
  const currentIndex = BLOG_ARTICLES.findIndex((a) => a.slug === article.slug);
  const prevArticle = currentIndex > 0 ? BLOG_ARTICLES[currentIndex - 1] : undefined;
  const nextArticle = currentIndex < BLOG_ARTICLES.length - 1 ? BLOG_ARTICLES[currentIndex + 1] : undefined;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    let split: ReturnType<typeof revealLines> = null;
    const ctx = gsap.context(() => {
      gsap.from(".article-meta", { autoAlpha: 0, y: 10, duration: 0.5, ease: "power2.out" });
      split = revealLines(root.querySelector(".article-title"), { start: "top 95%" });
      gsap.from(".article-hero-img", { autoAlpha: 0, scale: 1.04, duration: 0.9, delay: 0.1, ease: "power2.out" });
    }, root);
    return () => {
      split?.revert();
      ctx.revert();
    };
  }, []);

  return (
    <SiteLayout>
      <div ref={rootRef}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="border-b border-border/60 pt-28 md:pt-36">
          <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-[var(--page-gutter)] pb-6 text-xs text-muted-foreground">
            <Link to="/" className="transition hover:text-champagne">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
            <Link to="/blog" className="transition hover:text-champagne">
              Blog
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate text-foreground/70">{article.title}</span>
          </div>
        </nav>

        {/* Header */}
        <header className="mx-auto max-w-3xl px-[var(--page-gutter)] py-10 md:py-14">
          <div className="article-meta flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-widest text-gold">
            <span>{article.category}</span>
          </div>
          <h1 className="article-title mt-4 font-display text-4xl leading-[1.08] text-foreground md:text-6xl">
            {article.title}
          </h1>
          <p className="article-meta mt-5 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>
          <div className="article-meta mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden />
              {article.readingTime}
            </span>
          </div>
        </header>

        {/* Hero image */}
        <div className="mx-auto max-w-5xl px-[var(--page-gutter)]">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm md:aspect-[21/9]">
            <img
              src={image.src}
              alt={image.alt}
              loading="eager"
              className="article-hero-img absolute inset-0 h-full w-full object-cover [object-position:var(--img-pos-m)] md:[object-position:var(--img-pos-d)]"
              style={{ "--img-pos-m": image.objectPositionMobile, "--img-pos-d": image.objectPositionDesktop } as CSSProperties}
            />
          </div>
        </div>

        {/* Article body — 680-780px comfortable reading width */}
        <article className="mx-auto max-w-[42rem] px-[var(--page-gutter)] py-14 md:py-20">
          <div className="space-y-6 text-base leading-[1.8] text-foreground/85 md:text-lg">
            {article.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {article.sections.map((section) => (
            <section key={section.heading} className="mt-12">
              <h2 className="font-display text-2xl text-foreground md:text-3xl">{section.heading}</h2>
              <div className="mt-4 space-y-5 text-base leading-[1.8] text-foreground/80 md:text-lg">
                {section.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}

          {/* Contextual CTA */}
          <div className="mt-16 rounded-sm border border-gold/30 bg-[color:var(--surface-elevated)] p-8 text-center md:p-10">
            <h3 className="font-display text-2xl text-foreground">{article.ctaHeading}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{article.ctaBody}</p>
            <Link
              to={article.ctaTo}
              data-cursor="book"
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-gold-gradient px-7 py-3.5 text-xs font-semibold uppercase tracking-widest text-onyx shadow-[var(--shadow-gold)] transition hover:brightness-110"
            >
              {article.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {/* Internal links — genuine contextual navigation, not a keyword wall */}
          <div className="mt-12 border-t border-border/60 pt-8">
            <p className="text-sm text-muted-foreground">
              Explore more:{" "}
              <Link to="/fleet" className="text-gold underline underline-offset-2">
                Fleet
              </Link>
              {", "}
              <Link to="/rates" className="text-gold underline underline-offset-2">
                Rates
              </Link>
              {", "}
              <Link to="/service-areas" className="text-gold underline underline-offset-2">
                Service Areas
              </Link>
              {", or "}
              <Link to="/contact" className="text-gold underline underline-offset-2">
                Contact us
              </Link>
              .
            </p>
          </div>
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="border-t border-border bg-onyx py-16 md:py-20">
            <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
              <div className="eyebrow mb-8 text-gold">Related Insights</div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => {
                  const rImg = IMAGES[r.heroImage];
                  return (
                    <Link key={r.slug} to="/blog/$slug" params={{ slug: r.slug }} data-cursor="explore" className="group flex flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                        <img
                          src={rImg.src}
                          alt={rImg.alt}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 [object-position:var(--img-pos-m)] md:[object-position:var(--img-pos-d)]"
                          style={{ "--img-pos-m": rImg.objectPositionMobile, "--img-pos-d": rImg.objectPositionDesktop } as CSSProperties}
                        />
                      </div>
                      <h3 className="mt-4 font-display text-lg leading-snug text-foreground transition-colors group-hover:text-gold">
                        {r.title}
                      </h3>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Next / previous */}
        {(prevArticle || nextArticle) && (
          <nav aria-label="Article navigation" className="border-t border-border py-10">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-[var(--page-gutter)] sm:flex-row sm:items-center sm:justify-between">
              {prevArticle ? (
                <Link to="/blog/$slug" params={{ slug: prevArticle.slug }} className="group max-w-sm text-left">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Previous</span>
                  <div className="mt-1 text-sm text-foreground transition-colors group-hover:text-gold">{prevArticle.title}</div>
                </Link>
              ) : (
                <span />
              )}
              {nextArticle ? (
                <Link to="/blog/$slug" params={{ slug: nextArticle.slug }} className="group max-w-sm text-right sm:ml-auto">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Next</span>
                  <div className="mt-1 text-sm text-foreground transition-colors group-hover:text-gold">{nextArticle.title}</div>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </nav>
        )}
      </div>
    </SiteLayout>
  );
}
