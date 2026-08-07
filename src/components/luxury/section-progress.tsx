import { useEffect, useState } from "react";

type Section = { id: string; label: string };

/**
 * Slim right-side desktop indicator. Highlights the section currently in view
 * and lets the user jump to any section. Uses IntersectionObserver — no
 * per-frame listeners.
 */
export function SectionProgress({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (!elements.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Choose the entry closest to the viewport center that is intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Section progress"
      className="pointer-events-auto fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
    >
      {sections.map((s, i) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            className="group flex items-center gap-3"
            aria-current={isActive ? "true" : undefined}
            aria-label={`Go to ${s.label}`}
          >
            <span
              className={`font-mono text-[0.6rem] tracking-widest transition-colors ${
                isActive ? "text-gold" : "text-foreground/30 group-hover:text-foreground/60"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={`block h-px transition-all duration-500 ${
                isActive ? "w-10 bg-gold" : "w-4 bg-foreground/25 group-hover:w-6 group-hover:bg-foreground/50"
              }`}
            />
            <span
              className={`text-[0.65rem] uppercase tracking-[0.25em] transition-opacity ${
                isActive ? "text-foreground/80 opacity-100" : "text-foreground/40 opacity-0 group-hover:opacity-100"
              }`}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
