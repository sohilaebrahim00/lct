import { TRUST_BADGES } from "@/lib/site-data";

type Badge = (typeof TRUST_BADGES)[number];

/**
 * Single badge mark, shared by the static `TrustBadges` (About/footer) and
 * the homepage `TrustStrip` composition, so the NLA contrast fix and sizing
 * logic exist in exactly one place.
 *
 * NLA legibility: four earlier attempts at a per-logo backing (cream plate,
 * cream gradient, opaque circle, warm-stone blurred oval, radial falloff)
 * all still read as a visible glow/halo behind that one logo once seen at
 * real size against black — explicitly rejected. Per the client's explicit
 * instruction there is now NO per-logo background/glow of any kind; the
 * transparent derivative (`badge-nla-transparent.png`, background canvas
 * removed, artwork itself untouched) sits directly on the section's own
 * ambient lighting like the other two marks. Direct on-black pixel
 * inspection of that derivative confirms the ring and "PROUD MEMBER" text
 * read clearly; the chrome "NLA" wordmark is real supplied artwork and is
 * preserved as-is rather than redrawn/recolored/backed.
 */
export function BadgeMark({
  badge,
  heightClass,
  maxWidthClass,
}: {
  badge: Badge;
  heightClass: string;
  maxWidthClass: string;
}) {
  return (
    <div className="relative flex items-center justify-center">
      <img
        src={badge.src}
        alt={badge.name}
        loading="lazy"
        className={`relative w-auto object-contain transition-[transform,filter] duration-300 ease-out hover:scale-[1.02] hover:brightness-110 hover:drop-shadow-[0_0_10px_rgba(212,175,102,0.22)] ${heightClass} ${maxWidthClass}`}
      />
    </div>
  );
}

/**
 * Static badge row — real BBB / GNET / NLA (see TRUST_BADGES in
 * site-data.ts). `size="compact"` — footer: small, quiet reinforcement.
 * `size="full"` — About page: the strongest, most generous static
 * presentation.
 */
export function TrustBadges({
  size = "compact",
  withNames = false,
}: {
  size?: "compact" | "full";
  withNames?: boolean;
}) {
  const badgeHeight = size === "full" ? "h-16 md:h-20" : "h-10 md:h-11";

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
      {TRUST_BADGES.map((badge) => (
        <div key={badge.name} className="flex flex-col items-center gap-2">
          <BadgeMark
            badge={badge}
            heightClass={badgeHeight}
            maxWidthClass={badge.name.startsWith("BBB") ? "max-w-[150px] md:max-w-[170px]" : "max-w-[100px] md:max-w-[115px]"}
          />
          {withNames && (
            <span className="text-center text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              {badge.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
