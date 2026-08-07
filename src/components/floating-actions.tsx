import { useRouterState } from "@tanstack/react-router";
import { CONTACT } from "@/lib/site-data";

/**
 * Floating call & WhatsApp actions.
 * Uses centralized CONTACT numbers only.
 */
export function FloatingActions() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // /fleet has its own 64px sticky conversion bar (desktop + mobile, not just
  // mobile like MobileBookBar) — shift up on both breakpoints there so the
  // FABs never sit on top of it.
  const onFleet = pathname === "/fleet";

  return (
    <div
      className={
        onFleet
          ? "fixed right-4 bottom-[calc(64px+env(safe-area-inset-bottom)+0.75rem)] z-40 flex flex-col gap-3 lg:right-6 lg:bottom-[calc(64px+0.75rem)]"
          : "fixed right-4 bottom-[calc(52px+env(safe-area-inset-bottom)+0.75rem)] z-40 flex flex-col gap-3 lg:right-6 lg:bottom-6"
      }
    >
      <a
        href={CONTACT.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Message us on WhatsApp"
        className="fab-btn"
      >
        <WhatsAppGlyph />
        <span aria-hidden className="fab-dot" />
      </a>
      <a
        href={CONTACT.phoneTel}
        aria-label={`Call ${CONTACT.phoneDisplay}`}
        className="fab-btn fab-btn--gold"
      >
        <PhoneGlyph />
      </a>
    </div>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 32 32" width="24" height="24" fill="#fff" aria-hidden>
      <path d="M16.02 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.72 6.4L3.2 28.8l6.6-1.72a12.72 12.72 0 006.22 1.6h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 00-9.06-3.63zm0 23.35c-1.9 0-3.77-.5-5.4-1.47l-.39-.23-3.92 1.02 1.05-3.82-.25-.4a10.55 10.55 0 01-1.63-5.65c0-5.85 4.77-10.62 10.63-10.62 2.84 0 5.5 1.1 7.5 3.11a10.55 10.55 0 013.11 7.52c0 5.86-4.77 10.54-10.7 10.54zm5.83-7.9c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.68.08-.32-.16-1.35-.5-2.57-1.59a9.63 9.63 0 01-1.78-2.21c-.19-.32-.02-.5.14-.66.15-.15.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.98-2.38-.26-.62-.52-.54-.72-.55l-.62-.01c-.21 0-.55.08-.85.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.08 1.3 3.29.16.21 2.24 3.42 5.42 4.79.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.51.27-.74.27-1.37.19-1.51-.08-.13-.29-.21-.6-.37z" />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
