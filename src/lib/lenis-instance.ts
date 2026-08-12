import type Lenis from "lenis";

// Lenis drives scroll itself (its own rAF loop calling window.scrollTo),
// completely independent of CSS `overflow` — setting overflow:hidden on
// html/body does not stop it. Anything that needs to lock scrolling (the
// mobile nav overlay, a modal, etc.) must call stopLenis()/startLenis()
// here in addition to any CSS lock, or Lenis keeps driving scroll behind
// the overlay regardless of the CSS.
let instance: Lenis | null = null;

export function setLenisInstance(next: Lenis | null) {
  instance = next;
}

export function stopLenis() {
  instance?.stop();
}

export function startLenis() {
  instance?.start();
}
