import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

let registered = false;

export function ensureGsap() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin, DrawSVGPlugin);
    registered = true;
  }
  return { gsap, ScrollTrigger, SplitText, MotionPathPlugin, DrawSVGPlugin };
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isDesktopMotion() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(min-width: 1024px)").matches &&
    window.matchMedia("(pointer: fine)").matches &&
    !prefersReducedMotion()
  );
}

export function refreshScrollTriggers() {
  ensureGsap();
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
