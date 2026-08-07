import { isDesktopMotion, prefersReducedMotion } from "@/lib/motion";

let webglSupportCache: boolean | null = null;

function detectWebGL(): boolean {
  if (webglSupportCache !== null) return webglSupportCache;
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    webglSupportCache = !!gl;
  } catch {
    webglSupportCache = false;
  }
  return webglSupportCache;
}

interface NavigatorConnection {
  saveData?: boolean;
  effectiveType?: string;
}

interface ExtendedNavigator extends Navigator {
  deviceMemory?: number;
  connection?: NavigatorConnection;
}

/**
 * Gate for every decorative 3D scene sitewide. WebGL is never load-bearing —
 * this reuses the exact same bar as the rest of the site's premium GSAP
 * motion (desktop-class fine pointer, no reduced-motion preference) plus an
 * explicit WebGL support check, PLUS the broader device-capability signals
 * this correction pass added: low device memory, low CPU core count,
 * Save-Data, and slow-connection visitors all fall back to the static
 * SVG/CSS version even if they otherwise look like a qualifying desktop —
 * pointer type alone was not a sufficient signal.
 */
export function shouldUse3D(): boolean {
  if (!isDesktopMotion() || !detectWebGL()) return false;

  const nav = navigator as ExtendedNavigator;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory > 0 && nav.deviceMemory < 4) return false;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency < 4) {
    return false;
  }
  const conn = nav.connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && /^(slow-2g|2g|3g)$/.test(conn.effectiveType)) return false;

  return true;
}

/** True only for devices that also comfortably clear a higher capability bar — gates DPR up to 1.5 instead of 1.25. */
export function isHighCapabilityDevice(): boolean {
  const nav = navigator as ExtendedNavigator;
  const memoryOk = typeof nav.deviceMemory !== "number" || nav.deviceMemory >= 8;
  const coresOk = typeof nav.hardwareConcurrency !== "number" || nav.hardwareConcurrency >= 8;
  return memoryOk && coresOk;
}

/** [min, max] device-pixel-ratio range for a `<Canvas dpr={...}>` — capped at 1.25 unless the device clears the higher bar. */
export function dprRange(): [number, number] {
  return [1, isHighCapabilityDevice() ? 1.5 : 1.25];
}

/** Re-checked on resize, matching the pattern used by `isDesktopMotion` call sites elsewhere. */
export function watchShouldUse3D(callback: (value: boolean) => void): () => void {
  const check = () => callback(shouldUse3D());
  check();
  window.addEventListener("resize", check);
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener?.("change", check);
  return () => {
    window.removeEventListener("resize", check);
    mq.removeEventListener?.("change", check);
  };
}

export { prefersReducedMotion };
