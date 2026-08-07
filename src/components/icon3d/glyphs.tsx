import type { Icon3DName } from "./registry";

/**
 * Premium SVG glyph set for the LCT icon medallions.
 *
 * Design rules:
 *  - Every glyph is drawn on a 64x64 canvas with ~6px padding, so all icons
 *    share scale, distance, and perspective (unified "camera").
 *  - Strokes are 2.25 wide, round caps/joins — sharp silhouettes, no jitter.
 *  - Fills and strokes use a shared metallic gold gradient per instance,
 *    plus a soft inner highlight and a hairline dark undershadow for depth.
 *  - Custom compositions for the icons the brief calls out explicitly:
 *      wedding → interlocking rings
 *      VIP     → crowned shield
 *      long    → open road with destination pin
 *      group   → executive sprinter silhouette
 *      cap     → chauffeur cap with badge
 *      events  → invitation with spotlight beam
 *      airport → plane with runway line
 */

type GlyphProps = { gradientId: string };

function Frame({
  gradientId,
  children,
}: GlyphProps & { children: React.ReactNode }) {
  const gid = `g-${gradientId}`;
  const hid = `h-${gradientId}`;
  const sid = `s-${gradientId}`;
  return (
    <svg
      viewBox="0 0 64 64"
      width="100%"
      height="100%"
      fill="none"
      stroke={`url(#${gid})`}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Champagne gold — softer, less saturated */}
        <linearGradient id={gid} x1="14" y1="10" x2="50" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F6E3B8" />
          <stop offset="35%" stopColor="#E4C68A" />
          <stop offset="70%" stopColor="#B8935A" />
          <stop offset="100%" stopColor="#7A5A30" />
        </linearGradient>
        <linearGradient id={hid} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F6E9CB" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#E4C68A" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={sid} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
        </linearGradient>
        <filter id={`f-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0.8" stdDeviation="0.7" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter={`url(#f-${gradientId})`}>{children}</g>
    </svg>
  );
}

// Fill helper that uses the metallic gradient by id
const gfill = (id: string) => `url(#g-${id})`;

/* ---------------- glyphs ---------------- */

function Bell({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path d="M32 10v3" />
      <path d="M18 44c-2 0-3-1.4-1.6-3 2.6-2.9 3.6-6.3 3.6-11 0-6.6 5.4-12 12-12s12 5.4 12 12c0 4.7 1 8.1 3.6 11 1.4 1.6.4 3-1.6 3H18Z" fill={gfill(id)} fillOpacity="0.18" />
      <path d="M28 48a4 4 0 0 0 8 0" />
    </Frame>
  );
}

function Clock({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <circle cx="32" cy="32" r="20" fill={gfill(id)} fillOpacity="0.14" />
      <path d="M32 20v13l8 5" />
      <circle cx="32" cy="32" r="1.6" fill={gfill(id)} />
    </Frame>
  );
}

// Chauffeur cap — visor + crown + badge
function Cap({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      {/* crown */}
      <path d="M14 34c2-8 8-13 18-13s16 5 18 13" fill={gfill(id)} fillOpacity="0.2" />
      {/* band */}
      <path d="M12 36h40" />
      {/* visor */}
      <path d="M9 40h46l-3 5H12l-3-5Z" fill={gfill(id)} fillOpacity="0.28" />
      {/* badge */}
      <circle cx="32" cy="30" r="2.6" fill={gfill(id)} />
    </Frame>
  );
}

// Executive sedan — sleek luxury silhouette
function Sedan({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      {/* body */}
      <path d="M8 40l4-9c1-2.4 3.3-4 6-4h28c2.7 0 5 1.6 6 4l4 9v6H8v-6Z" fill={gfill(id)} fillOpacity="0.2" />
      {/* greenhouse */}
      <path d="M17 31l4-6c1-1.5 2.6-2.4 4.4-2.4h13.2c1.8 0 3.4.9 4.4 2.4l4 6" />
      <path d="M32 22.6V31" />
      {/* wheels */}
      <circle cx="20" cy="46" r="4" fill={gfill(id)} />
      <circle cx="44" cy="46" r="4" fill={gfill(id)} />
      <circle cx="20" cy="46" r="1.4" fill="#0b0b0b" stroke="none" />
      <circle cx="44" cy="46" r="1.4" fill="#0b0b0b" stroke="none" />
    </Frame>
  );
}

// Plane over runway
function Plane({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path d="M10 30l14 2 10-14 4 1-5 15 12 3 3-3 2 1-3 6-2 2-6-3-15 5-1-4 14-10-14 2-3 3-2-1 2-5Z" fill={gfill(id)} fillOpacity="0.22" />
      {/* runway */}
      <path d="M10 54h44" strokeDasharray="3 4" opacity="0.85" />
    </Frame>
  );
}

// Briefcase — corporate
function Briefcase({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <rect x="10" y="20" width="44" height="30" rx="3" fill={gfill(id)} fillOpacity="0.18" />
      <path d="M24 20v-4a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4" />
      <path d="M10 34h44" />
      <rect x="28" y="32" width="8" height="4" rx="1" fill={gfill(id)} />
    </Frame>
  );
}

// VIP — crowned shield
function Shield({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      {/* crown atop shield */}
      <path d="M22 14l4 4 6-6 6 6 4-4v6H22v-6Z" fill={gfill(id)} fillOpacity="0.35" />
      <circle cx="26" cy="14" r="1.4" fill={gfill(id)} />
      <circle cx="32" cy="12" r="1.6" fill={gfill(id)} />
      <circle cx="38" cy="14" r="1.4" fill={gfill(id)} />
      {/* shield body */}
      <path d="M32 22c6 3 10 4 16 4v10c0 10-7 16-16 20-9-4-16-10-16-20V26c6 0 10-1 16-4Z" fill={gfill(id)} fillOpacity="0.18" />
      {/* check emblem */}
      <path d="M25 38l5 5 10-11" />
    </Frame>
  );
}

function Globe({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <circle cx="32" cy="32" r="20" fill={gfill(id)} fillOpacity="0.12" />
      <ellipse cx="32" cy="32" rx="8" ry="20" />
      <path d="M12 32h40" />
      <path d="M14 22h36M14 42h36" opacity="0.7" />
    </Frame>
  );
}

function Calendar({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <rect x="10" y="14" width="44" height="40" rx="3" fill={gfill(id)} fillOpacity="0.14" />
      <path d="M10 24h44" />
      <path d="M20 10v8M44 10v8" />
      <path d="M22 38l6 6 12-14" />
    </Frame>
  );
}

function Phone({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path d="M20 10h5a2 2 0 0 1 2 1.6l2 8a2 2 0 0 1-.6 2L25 25a24 24 0 0 0 14 14l3.4-3.4a2 2 0 0 1 2-.6l8 2A2 2 0 0 1 54 39v5a10 10 0 0 1-10 10A34 34 0 0 1 10 20a10 10 0 0 1 10-10Z" fill={gfill(id)} fillOpacity="0.22" />
    </Frame>
  );
}

function Star({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path d="M32 8l7.4 15.1 16.6 2.4-12 11.7 2.8 16.5L32 45.9 17.2 53.7 20 37.2 8 25.5l16.6-2.4L32 8Z" fill={gfill(id)} fillOpacity="0.35" />
    </Frame>
  );
}

// Events — invitation with spotlight beam
function Spotlight({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      {/* spotlight beam */}
      <path d="M4 6l18 10-6 10L4 6Z" fill={gfill(id)} fillOpacity="0.18" opacity="0.9" />
      {/* invitation card */}
      <rect x="18" y="22" width="34" height="26" rx="2.5" fill={gfill(id)} fillOpacity="0.2" />
      <path d="M18 22l17 12 17-12" />
      {/* ribbon */}
      <path d="M35 48v6M31 52h8" />
    </Frame>
  );
}

function Location({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path d="M32 6c9 0 15 6.6 15 15 0 11-15 30-15 30S17 32 17 21c0-8.4 6-15 15-15Z" fill={gfill(id)} fillOpacity="0.2" />
      <circle cx="32" cy="21" r="5" fill={gfill(id)} />
    </Frame>
  );
}

function Building({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path d="M12 54V20l14-8v10l14-6v38H12Z" fill={gfill(id)} fillOpacity="0.18" />
      <path d="M40 26h12v28H40" />
      {/* windows */}
      <path d="M18 26v4M18 34v4M18 42v4M28 26v4M28 34v4M28 42v4M44 32v4M44 40v4M48 32v4M48 40v4" />
    </Frame>
  );
}

function Trend({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path d="M8 46l14-14 8 8 14-18" />
      <path d="M36 22h12v12" />
    </Frame>
  );
}

// Group — executive sprinter silhouette
function Users({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      {/* van body */}
      <path d="M8 44V26c0-2.2 1.8-4 4-4h32l10 10v12H8Z" fill={gfill(id)} fillOpacity="0.2" />
      {/* windows */}
      <path d="M14 28h10v8H14zM26 28h10v8H26zM38 28h6l6 6h-12v-6Z" fill={gfill(id)} fillOpacity="0.35" />
      {/* wheels */}
      <circle cx="20" cy="46" r="4" fill={gfill(id)} />
      <circle cx="46" cy="46" r="4" fill={gfill(id)} />
      <circle cx="20" cy="46" r="1.4" fill="#0b0b0b" stroke="none" />
      <circle cx="46" cy="46" r="1.4" fill="#0b0b0b" stroke="none" />
    </Frame>
  );
}

// Wedding — interlocking rings
function Heart({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <circle cx="24" cy="36" r="14" fill={gfill(id)} fillOpacity="0.14" />
      <circle cx="42" cy="36" r="14" fill={gfill(id)} fillOpacity="0.14" />
      {/* diamond accents on top of each ring */}
      <path d="M22 20l2-3 2 3-2 3-2-3ZM40 20l2-3 2 3-2 3-2-3Z" fill={gfill(id)} />
    </Frame>
  );
}

function Award({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <circle cx="32" cy="26" r="14" fill={gfill(id)} fillOpacity="0.2" />
      <path d="M32 18l2.6 5.4 6 .8-4.4 4.2 1 6-5.2-2.8-5.2 2.8 1-6-4.4-4.2 6-.8L32 18Z" fill={gfill(id)} />
      <path d="M23 38l-3 16 12-6 12 6-3-16" />
    </Frame>
  );
}

function Envelope({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <rect x="8" y="16" width="48" height="32" rx="3" fill={gfill(id)} fillOpacity="0.16" />
      <path d="M8 20l24 18L56 20" />
    </Frame>
  );
}

// Point to Point — elegant arc between two destinations
function Route({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      {/* origin */}
      <circle cx="14" cy="48" r="3.2" fill={gfill(id)} fillOpacity="0.9" />
      <circle cx="14" cy="48" r="1.1" fill="#0b0b0b" stroke="none" />
      {/* destination */}
      <circle cx="50" cy="18" r="3.2" fill={gfill(id)} fillOpacity="0.9" />
      <circle cx="50" cy="18" r="1.1" fill="#0b0b0b" stroke="none" />
      {/* elegant arc path */}
      <path d="M14 48 C 22 22, 38 12, 50 18" fill="none" strokeDasharray="1.5 3.5" opacity="0.9" />
    </Frame>
  );
}

// Long distance — open highway toward horizon
function Truck({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path d="M8 54h48" opacity="0.6" />
      <path d="M22 54 L30 22 L34 22 L42 54 Z" fill={gfill(id)} fillOpacity="0.16" />
      <path d="M32 46v-4M32 38v-4M32 30v-4" opacity="0.85" />
      <path d="M28 16h8" opacity="0.7" />
    </Frame>
  );
}

function Crown({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path d="M8 22l8 18h32l8-18-11 9-9-16-9 16-11-9Z" fill={gfill(id)} fillOpacity="0.28" />
      <path d="M14 46h36" />
      <circle cx="16" cy="20" r="2" fill={gfill(id)} />
      <circle cx="32" cy="14" r="2.4" fill={gfill(id)} />
      <circle cx="48" cy="20" r="2" fill={gfill(id)} />
    </Frame>
  );
}

function Sparkles({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path d="M22 10l3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z" fill={gfill(id)} fillOpacity="0.3" />
      <path d="M44 28l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill={gfill(id)} fillOpacity="0.3" />
      <path d="M40 12l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" fill={gfill(id)} />
    </Frame>
  );
}

function Check({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <circle cx="32" cy="32" r="22" fill={gfill(id)} fillOpacity="0.16" />
      <path d="M20 33l8 8 16-18" />
    </Frame>
  );
}

// WhatsApp — official mark, drawn in gold
function WhatsApp({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path
        d="M32 8C18.7 8 8 18.7 8 32c0 4.2 1.1 8.3 3.2 11.9L8 56l12.4-3.2A24 24 0 1 0 32 8Zm14 34.2c-.6 1.7-3.4 3.2-4.7 3.4-1.2.2-2.7.3-4.4-.3-1-.3-2.4-.7-4.1-1.5-7.2-3.1-11.9-10.4-12.3-10.9-.4-.5-2.9-3.9-2.9-7.4 0-3.6 1.9-5.3 2.6-6 .7-.7 1.4-.9 1.9-.9h1.4c.4 0 1.1-.2 1.7 1.3.6 1.5 2.1 5.3 2.3 5.7.2.4.3.9 0 1.4-.2.5-.4.8-.7 1.3-.4.4-.8 1-1.1 1.3-.4.4-.8.8-.3 1.6.4.8 2 3.3 4.3 5.4 3 2.7 5.5 3.5 6.3 3.9.8.4 1.2.3 1.7-.2s2-2.3 2.5-3.1c.5-.8 1-.6 1.7-.4.7.3 4.5 2.1 5.2 2.5.8.4 1.3.6 1.5.9.2.4.2 2-.4 3.6Z"
        fill={gfill(id)}
        stroke="none"
      />
    </Frame>
  );
}

function Message({ gradientId: id }: GlyphProps) {
  return (
    <Frame gradientId={id}>
      <path d="M10 14h44a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H24l-10 8V17a3 3 0 0 1 3-3Z" fill={gfill(id)} fillOpacity="0.18" />
      <path d="M20 24h24M20 30h16" opacity="0.85" />
    </Frame>
  );
}

const map: Record<Icon3DName, (p: GlyphProps) => React.ReactElement> = {
  bell: Bell,
  clock: Clock,
  cap: Cap,
  sedan: Sedan,
  plane: Plane,
  briefcase: Briefcase,
  shield: Shield,
  globe: Globe,
  calendar: Calendar,
  phone: Phone,
  star: Star,
  spotlight: Spotlight,
  location: Location,
  building: Building,
  trend: Trend,
  users: Users,
  heart: Heart,
  award: Award,
  envelope: Envelope,
  route: Route,
  truck: Truck,
  crown: Crown,
  sparkles: Sparkles,
  check: Check,
  whatsapp: WhatsApp,
  message: Message,
};

export function IconGlyph({
  name,
  gradientId,
}: {
  name: Icon3DName;
  gradientId: string;
}) {
  const C = map[name] ?? Star;
  return <C gradientId={gradientId} />;
}
