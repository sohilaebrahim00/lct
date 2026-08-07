import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";

/**
 * Sitewide animated page transitions: intercepts left-clicks on same-origin
 * internal links, plays a dark-wipe "cover", navigates once covered, then
 * "reveals" the new page with the same wipe continuing in the same direction.
 * Browser back/forward (popstate) is intentionally left uncovered so it
 * doesn't fight the router's native scroll restoration.
 */
export function RouteTransition() {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigatingRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const overlay = overlayRef.current;
    if (!overlay) return;

    const onClick = (e: MouseEvent) => {
      if (navigatingRef.current) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;

      const anchor = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      e.preventDefault();
      navigatingRef.current = true;

      gsap.set(overlay, { scaleY: 0, transformOrigin: "bottom" });
      gsap.to(overlay, {
        scaleY: 1,
        duration: 0.4,
        ease: "power3.inOut",
        onComplete: () => {
          router.navigate({ to: url.pathname as never });
          requestAnimationFrame(() => {
            gsap.set(overlay, { transformOrigin: "top" });
            gsap.to(overlay, {
              scaleY: 0,
              duration: 0.5,
              ease: "power3.inOut",
              onComplete: () => {
                navigatingRef.current = false;
              },
            });
          });
        },
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[95] bg-[color:var(--surface-black)]"
      style={{ transform: "scaleY(0)" }}
      aria-hidden
    />
  );
}
