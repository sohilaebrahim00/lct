import { type ReactNode } from "react";

/**
 * Shared premium legal-page shell — used by /privacy, /terms,
 * /cancellation-policy, /zero-tolerance. Replaces the previous per-page
 * `prose prose-invert ...` classes, which did nothing: `@tailwindcss/
 * typography` was never installed in this project (confirmed — not in
 * package.json or node_modules), so those classes were inert dead weight
 * and every heading/paragraph fell back to unstyled browser defaults —
 * the actual root cause of the cramped, no-hierarchy look. This shell
 * uses the site's own existing design tokens (`.eyebrow`, `font-display`,
 * `.luxe-card`) instead of a generic plugin, so it matches the rest of
 * the site rather than a generic reading theme.
 *
 * Legal text itself is never authored here — each route still owns its
 * own section content and passes it straight through as `children`. This
 * component only supplies structure, spacing, numbering, and the table
 * of contents; it never rewrites or summarizes the legal wording.
 */

export type LegalSectionSpec = {
  id: string;
  title: string;
  content: ReactNode;
};

function LegalToc({ sections, showLabel = true }: { sections: LegalSectionSpec[]; showLabel?: boolean }) {
  return (
    <nav aria-label="Table of contents" className="text-sm">
      {showLabel ? <div className="eyebrow mb-4">On This Page</div> : null}
      <ol className="space-y-2.5">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="group flex items-baseline gap-3 text-muted-foreground transition hover:text-gold"
            >
              <span className="text-xs tabular-nums text-gold/50 transition group-hover:text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-snug">{s.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function LegalArticle({
  intro,
  sections,
  contact,
}: {
  /** Optional lead-in statement before the numbered sections and TOC — e.g. an opening compliance/ordinance notice that needs to stay prominent, not be filed under "contact". */
  intro?: ReactNode;
  sections: LegalSectionSpec[];
  /** Rendered as the final, visually distinct block — phone/email/contact-form links. */
  contact?: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-[var(--container-max)] px-6 pb-24 pt-16 lg:px-10">
      {intro ? (
        <div className="mx-auto mb-14 max-w-3xl text-[0.95rem] leading-relaxed text-muted-foreground md:text-base [&_strong]:text-foreground">
          {intro}
        </div>
      ) : null}
      <div className="grid gap-14 lg:grid-cols-[220px_1fr] lg:gap-20">
        {/* Desktop: sticky sidebar TOC. Mobile: a collapsible accordion up
            top instead of eating screen real estate before any content —
            matches the site's existing <details>/<summary> accordion
            convention (mobile nav dropdowns, FAQ page). */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <LegalToc sections={sections} />
          </div>
        </div>
        <details className="group luxe-card rounded-sm px-5 py-4 lg:hidden">
          <summary className="eyebrow flex cursor-pointer list-none items-center justify-between">
            On This Page
            <span className="text-gold transition group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-4">
            <LegalToc sections={sections} showLabel={false} />
          </div>
        </details>

        <div className="min-w-0">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-28 border-t border-border/50 pt-10 first:mt-0 first:border-t-0 first:pt-0 lg:pt-12"
            >
              <div className="flex items-baseline gap-4">
                <span className="hidden font-display text-2xl text-gold/40 md:inline">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-2xl leading-tight text-foreground md:text-3xl">
                  {s.title}
                </h2>
              </div>
              <div className="mt-5 max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-muted-foreground md:text-base [&_a]:text-gold [&_a]:transition [&_a:hover]:text-champagne [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                {s.content}
              </div>
            </section>
          ))}

          {contact ? (
            <section className="mt-14 rounded-sm border border-gold/25 bg-[color:var(--surface-elevated)] p-6 md:p-8">
              <div className="eyebrow mb-3">Questions About This Policy</div>
              <div className="text-[0.95rem] leading-relaxed text-muted-foreground md:text-base [&_a]:text-gold [&_a]:transition [&_a:hover]:text-champagne">
                {contact}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
