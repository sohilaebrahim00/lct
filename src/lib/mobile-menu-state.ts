/**
 * Tiny external store so `SiteNav`'s mobile-menu open/closed state can be
 * read by sibling floating UI (WhatsApp/phone FABs, the AI Concierge
 * launcher, the sticky Book Now bar) without prop-drilling or a new state
 * library — `useSyncExternalStore` is the built-in React primitive for
 * exactly this "shared mutable value outside the component tree" case.
 * Fixes a real bug: those floating elements previously stayed visible AND
 * clickable on top of the open mobile nav overlay (same z-index, later in
 * DOM order), overlapping the menu's own contact block.
 */
let isOpen = false;
const listeners = new Set<() => void>();

export function setMobileMenuOpen(open: boolean) {
  if (isOpen === open) return;
  isOpen = open;
  listeners.forEach((l) => l());
}

export function subscribeMobileMenuOpen(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMobileMenuOpenSnapshot() {
  return isOpen;
}

const getServerSnapshot = () => false;
export { getServerSnapshot as getMobileMenuOpenServerSnapshot };
