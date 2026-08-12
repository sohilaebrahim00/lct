import { Link, useRouterState } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";
import {
  getMobileMenuOpenServerSnapshot,
  getMobileMenuOpenSnapshot,
  subscribeMobileMenuOpen,
} from "@/lib/mobile-menu-state";

/**
 * Mobile-only sticky booking CTA — full-width bottom bar, not a floating
 * circle, so it never visually competes with the WhatsApp/phone FAB stack.
 * Hidden on /book itself (already the booking page) and on /fleet, which has
 * its own vehicle-aware `FleetConversionBar` in that same bottom slot — this
 * avoids stacking two bottom bars or showing a generic "Book Now" alongside
 * a vehicle-specific one.
 */
export function MobileBookBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const menuOpen = useSyncExternalStore(subscribeMobileMenuOpen, getMobileMenuOpenSnapshot, getMobileMenuOpenServerSnapshot);
  if (pathname === "/book" || pathname === "/fleet" || menuOpen) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-champagne/25 bg-gold-gradient pb-[env(safe-area-inset-bottom)] lg:hidden"
      style={{ boxShadow: "0 -8px 24px -8px rgba(0,0,0,0.35)" }}
    >
      <Link
        to="/book"
        data-cursor="book"
        className="flex min-h-[52px] items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-onyx"
      >
        Book Now
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
