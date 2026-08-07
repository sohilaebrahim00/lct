/**
 * Stylized local map background for the Contact page's signature pin —
 * pure SVG/CSS, no Three.js, no map SDK, no screenshot. Sits behind the 3D
 * (or, on the fallback path, 2D) pin so the pin reads as marking a place
 * on a map rather than floating in an empty void. The composition is
 * deliberately abstract (a stylized road network, not a surveyed street
 * grid) — same standard already used by the Service Areas diagram: real
 * verified places (Grapevine, DFW Airport), stylized positions.
 *
 * The main intersection sits at the exact center of the 400x240 viewBox,
 * which is where the 3D pin's camera naturally renders it — no pixel
 * alignment hack needed between the two layers.
 */
export function ContactMapBackdrop() {
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="contactMapRoute" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4dfa8" />
          <stop offset="100%" stopColor="#d4af6a" />
        </linearGradient>
        <radialGradient id="contactMapVignette" cx="50%" cy="48%" r="65%">
          <stop offset="0%" stopColor="#1a1712" stopOpacity="0" />
          <stop offset="100%" stopColor="#050403" stopOpacity="0.85" />
        </radialGradient>
      </defs>

      {/* Near-black charcoal map surface */}
      <rect x="0" y="0" width="400" height="240" fill="#0e0c09" />

      {/* Secondary roads — low-opacity silver */}
      <g stroke="#8a8478" strokeOpacity="0.22" strokeWidth="1.5" fill="none">
        <path d="M0,60 L400,45" />
        <path d="M0,190 L400,205" />
        <path d="M120,0 L100,240" />
        <path d="M320,0 L340,240" />
      </g>

      {/* Primary roads — restrained warm-gray */}
      <g stroke="#a89a7c" strokeOpacity="0.4" strokeWidth="2.25" fill="none">
        <path d="M0,120 C120,116 280,124 400,120" />
        <path d="M200,0 C196,80 204,160 200,240" />
      </g>

      {/* Primary route — the one subtle champagne-gold connector, airport → Grapevine */}
      <path
        d="M92,52 C130,70 165,95 200,120"
        fill="none"
        stroke="url(#contactMapRoute)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* DFW Airport reference marker + label */}
      <g transform="translate(92,52)">
        <circle r="3.5" fill="none" stroke="#d4af6a" strokeOpacity="0.6" strokeWidth="1" />
        <circle r="2" fill="#d4af6a" fillOpacity="0.85" />
      </g>
      <text
        x="92"
        y="38"
        textAnchor="middle"
        className="font-display"
        style={{ fill: "#c9bfa8", fontSize: 10, letterSpacing: "0.05em" }}
      >
        DFW AIRPORT
      </text>

      {/* Grapevine label — offset below the pin's tip (the pin itself marks
          the intersection at center; the label sits clear of it rather
          than behind it) */}
      <text
        x="200"
        y="222"
        textAnchor="middle"
        className="font-display"
        style={{ fill: "#e8ddc4", fontSize: 13, letterSpacing: "0.08em" }}
      >
        GRAPEVINE
      </text>

      {/* Vignette so the roads/labels stay restrained and the pin remains the focal point */}
      <rect x="0" y="0" width="400" height="240" fill="url(#contactMapVignette)" />
    </svg>
  );
}
