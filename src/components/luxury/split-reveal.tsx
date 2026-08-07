import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Word-by-word reveal. Renders a <span> wrapping word-clipped children.
 */
export function SplitReveal({
  children,
  className = "",
  delay = 0,
  stagger = 0.05,
  trigger,
}: {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
  trigger?: "self" | "viewport";
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = el.querySelectorAll("[data-word]");
    gsap.set(words, { yPercent: 60, opacity: 0, filter: "blur(10px)" });
    const anim = gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 1.4,
      ease: "expo.out",
      stagger,
      delay,
      scrollTrigger:
        trigger === "viewport"
          ? { trigger: el, start: "top 85%", once: true }
          : undefined,
    });
    return () => {
      anim.kill();
    };
  }, [delay, stagger, trigger, children]);

  const parts = children.split(" ");
  return (
    <span ref={ref} className={className}>
      {parts.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ marginRight: "0.25em" }}
        >
          <span data-word className="inline-block will-change-transform">
            {w}
          </span>
        </span>
      ))}
    </span>
  );
}
