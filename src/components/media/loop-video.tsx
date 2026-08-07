import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

export interface LoopVideoProps {
  src: string;
  className?: string;
  /** Hero media loads eagerly (already above the fold); everything else waits until it's about to enter the viewport. */
  eager?: boolean;
}

/**
 * Muted/looping decorative video accent, shared by every "premium media"
 * placement (Hero letterform, Book Now detail, 24/7 section). Renders
 * nothing under reduced-motion — no element, no network request — since
 * these are all pure decoration with real text/CTA content underneath.
 */
export function LoopVideo({ src, className, eager = false }: LoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (eager || reduced || shouldLoad) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [eager, reduced, shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) return;
    const v = videoRef.current;
    if (!v) return;
    const onVisibility = () => {
      if (document.hidden) v.pause();
      else v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [shouldLoad]);

  if (reduced) return null;

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      {shouldLoad && (
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full object-cover"
          muted
          autoPlay
          loop
          playsInline
          preload={eager ? "auto" : "none"}
        />
      )}
    </div>
  );
}
