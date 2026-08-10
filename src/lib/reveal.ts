/**
 * Shared cinematic reveal presets built on the real GSAP plugins (SplitText,
 * DrawSVGPlugin) registered in `motion.ts` — one implementation per technique,
 * reused across the homepage and interior pages instead of re-implementing
 * the same tween inline in every section.
 *
 * Every preset is a no-op under prefers-reduced-motion (the element simply
 * keeps its default, fully visible styling).
 */
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";

type Edge = "left" | "right" | "up" | "down" | "diagonal" | "diagonal-reverse";
type Direction = "left" | "right" | "up" | "down";
type Target = Element | Element[] | NodeListOf<Element> | string | null;

const CLIP_FROM: Record<Exclude<Edge, "diagonal" | "diagonal-reverse">, string> = {
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
  up: "inset(100% 0% 0% 0%)",
  down: "inset(0% 0% 100% 0%)",
};

function staggerOffset(from: Direction, distance: number): { x?: number; y?: number } {
  switch (from) {
    case "left":
      return { x: -distance };
    case "right":
      return { x: distance };
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
  }
}

function hasTarget(t: Target) {
  if (!t) return false;
  if (typeof t === "string") return true;
  if (Array.isArray(t) || t instanceof NodeList) return t.length > 0;
  return true;
}

/**
 * Splits a heading into lines (or words/chars) and reveals them with a
 * masked upward wipe. Returns the SplitText instance so the caller can
 * `.revert()` it in their own effect cleanup alongside `gsap.context().revert()`.
 */
export function revealLines(
  el: Element | null,
  opts: { type?: "lines" | "words" | "chars"; stagger?: number; start?: string } = {},
) {
  if (!el || prefersReducedMotion()) return null;
  const { gsap, SplitText } = ensureGsap();
  const type = opts.type ?? "lines";
  const split = new SplitText(el, { type, mask: type });
  const targets = type === "chars" ? split.chars : type === "words" ? split.words : split.lines;

  gsap.from(targets, {
    yPercent: 110,
    autoAlpha: 0,
    duration: 0.9,
    stagger: opts.stagger ?? (type === "chars" ? 0.02 : 0.06),
    ease: "power4.out",
    scrollTrigger: {
      trigger: el,
      start: opts.start ?? "top 82%",
      toggleActions: "play none none reverse",
    },
  });

  return split;
}

/**
 * Clip-path image wipe. `diagonal`/`diagonal-reverse` sweep across at a true
 * slanted angle (the leading edge's two corners are given different travel
 * distances over the same duration, so they arrive at different times and
 * the cut line reads as visibly diagonal throughout — not just a straight
 * wipe dressed up as a polygon). The rest wipe from a flat edge.
 */
export function revealClipImage(
  el: Target,
  opts: { edge?: Edge; start?: string; duration?: number; angle?: number } = {},
) {
  if (!hasTarget(el) || prefersReducedMotion()) return;
  const { gsap } = ensureGsap();
  const edge = opts.edge ?? "left";
  const scrollTrigger = {
    trigger: el as gsap.DOMTarget,
    start: opts.start ?? "top 78%",
    toggleActions: "play none none reverse",
  };

  if (edge === "diagonal" || edge === "diagonal-reverse") {
    const a = opts.angle ?? 16;
    // "diagonal": grows left→right, bottom edge leads.
    // "diagonal-reverse": grows right→left, top edge leads — a mirrored
    // slant so it never reads as the same motif as "diagonal".
    const from =
      edge === "diagonal"
        ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
        : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
    const to =
      edge === "diagonal"
        ? `polygon(0% 0%, 100% 0%, ${100 + a}% 100%, 0% 100%)`
        : `polygon(${-a}% 0%, 100% 0%, 100% 100%, 0% 100%)`;
    gsap.fromTo(
      el,
      { clipPath: from },
      {
        clipPath: to,
        duration: opts.duration ?? 1.15,
        ease: "power3.inOut",
        scrollTrigger,
      },
    );
    return;
  }

  gsap.fromTo(
    el,
    { clipPath: CLIP_FROM[edge] },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: opts.duration ?? 1.1,
      ease: "power3.inOut",
      scrollTrigger,
    },
  );
}

/** Directional grid/list stagger — replaces the plain `y:48` fade-up used everywhere. */
export function revealStagger(
  els: Target,
  opts: { from?: Direction; amount?: number; start?: string; duration?: number; trigger?: Target; distance?: number } = {},
) {
  if (!hasTarget(els) || prefersReducedMotion()) return;
  const { gsap } = ensureGsap();
  const offset = staggerOffset(opts.from ?? "up", opts.distance ?? 44);
  // ScrollTrigger's `trigger` must be a single element/selector, not an array —
  // fall back to the first item when `els` is a list and no explicit trigger given.
  const trigger =
    opts.trigger ??
    (typeof els === "string" || !(Array.isArray(els) || els instanceof NodeList)
      ? els
      : (els as ArrayLike<Element>)[0]);

  gsap.from(els, {
    ...offset,
    autoAlpha: 0,
    duration: opts.duration ?? 0.85,
    stagger: opts.amount ?? 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: trigger as gsap.DOMTarget,
      start: opts.start ?? "top 82%",
      toggleActions: "play none none reverse",
    },
  });
}

/** DrawSVGPlugin stroke draw for gold-line / route-line SVG paths (not plain divs). */
export function drawLine(el: Target, opts: { start?: string; duration?: number } = {}) {
  if (!hasTarget(el)) return;
  const { gsap } = ensureGsap();
  if (prefersReducedMotion()) {
    gsap.set(el, { drawSVG: "100%" });
    return;
  }
  gsap.fromTo(
    el,
    { drawSVG: "0%" },
    {
      drawSVG: "100%",
      duration: opts.duration ?? 0.9,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: el as gsap.DOMTarget,
        start: opts.start ?? "top 85%",
        toggleActions: "play none none reverse",
      },
    },
  );
}
