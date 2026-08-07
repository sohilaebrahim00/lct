/**
 * Shared material tokens for every 3D scene — the same champagne-gold /
 * onyx palette already established by the 2D cursor pin (`cursor.tsx`) and
 * loader vehicle (`brand-loader.tsx`) SVGs, so nothing 3D introduces a new
 * brand color. Hex, not CSS `oklch()` custom properties, since Three.js
 * materials need literal JS-side values.
 */
export const GOLD_SOFT = "#f4dfa8";
export const GOLD_MID = "#d4af6a";
export const GOLD_DEEP = "#8a6a2f";
export const GOLD_GLINT = "#fff8e8";
export const ONYX_UPPER = "#2a2620";
export const ONYX_CORE = "#141210";
export const ONYX_LOWER = "#070605";

// Brighter base than the original `GOLD_MID` — that read as a slightly
// muddy brown once lit at normal monitor brightness. `GOLD_SOFT` plus a
// sharper (lower) roughness gives a clearer metallic highlight; the
// "darker bronze sides" look comes from lighting (a bright front key + a
// dim `GOLD_DEEP`-tinted rim light), not a second material — see each
// scene's light rig. Deliberately no `clearcoat` (a `MeshPhysicalMaterial`-
// only, per-pixel-expensive extra shading layer) — measured to meaningfully
// increase render cost on this project's continuously-idling pin without a
// visible quality gain worth that cost; `metalness`/`roughness` alone on a
// plain `MeshStandardMaterial` already reads as clean brushed/polished gold.
export const GOLD_PHYSICAL_PROPS = {
  color: GOLD_SOFT,
  metalness: 0.88,
  roughness: 0.22,
} as const;

export const ONYX_STANDARD_PROPS = {
  color: ONYX_CORE,
  metalness: 0.35,
  roughness: 0.55,
} as const;
