import { ReactNode, useLayoutEffect, useRef } from "react";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { revealLines } from "@/lib/reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    let split: ReturnType<typeof revealLines> = null;

    const ctx = gsap.context(() => {
      gsap.from(".sh-line", {
        scaleX: 0,
        transformOrigin: align === "center" ? "center" : "left",
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 85%" },
      });
      gsap.from(".sh-eyebrow", {
        autoAlpha: 0,
        y: 10,
        duration: 0.55,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 85%" },
      });
      split = revealLines(root.querySelector(".sh-title"), { start: "top 85%" });
      gsap.from(".sh-desc", {
        autoAlpha: 0,
        y: 14,
        duration: 0.6,
        delay: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 85%" },
      });
    }, root);

    return () => {
      split?.revert();
      ctx.revert();
    };
  }, [align]);

  return (
    <div ref={rootRef} className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <div className="mb-4 flex items-center gap-3">
          {align === "center" && <span className="sh-line h-px w-8 bg-gold/60" />}
          <span className="sh-eyebrow eyebrow">{eyebrow}</span>
          <span className="sh-line h-px w-8 bg-gold/60" />
        </div>
      )}
      <h2 className="sh-title font-display text-4xl leading-[1.05] text-foreground md:text-6xl">
        {title}
      </h2>
      {description && (
        <p className="sh-desc mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
