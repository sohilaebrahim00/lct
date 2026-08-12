import { lazy, Suspense, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MessageCircle, X } from "lucide-react";
import { track } from "@/lib/tracking";
import {
  getMobileMenuOpenServerSnapshot,
  getMobileMenuOpenSnapshot,
  subscribeMobileMenuOpen,
} from "@/lib/mobile-menu-state";

// The chat panel (Supabase client call, message list, quick actions) is not
// needed until the visitor actually opens the concierge — lazy-loaded on
// interaction so it never adds to the initial page bundle, per explicit
// "don't hurt LCP" instruction. Only this tiny button is eager.
const ConciergePanel = lazy(() => import("./concierge-panel"));

export function ConciergeLauncher() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const menuOpen = useSyncExternalStore(subscribeMobileMenuOpen, getMobileMenuOpenSnapshot, getMobileMenuOpenServerSnapshot);

  const closePanel = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  const openPanel = () => {
    setOpen(true);
    track.aiConciergeOpen(pathname);
  };

  // Hide the launcher (and close the panel, if a visitor somehow had it
  // open) while the mobile nav menu is open — the two must never compete
  // for the same screen real estate.
  useEffect(() => {
    if (menuOpen && open) setOpen(false);
  }, [menuOpen, open]);

  if (menuOpen) return null;

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={open ? closePanel : openPanel}
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={open ? "Close AI Concierge" : "Open AI Concierge"}
        className="fixed bottom-[calc(52px+env(safe-area-inset-bottom)+0.75rem)] left-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-[color:var(--surface-elevated)] text-gold shadow-[var(--shadow-gold)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:bottom-6"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <MessageCircle className="h-5 w-5" aria-hidden />}
      </button>

      {open && (
        <Suspense fallback={null}>
          <ConciergePanel onClose={closePanel} dialogId={dialogId} />
        </Suspense>
      )}
    </>
  );
}
