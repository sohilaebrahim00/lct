import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Embeds a real production Clienity CRM form (the client's actual driver /
 * partner / referral application pipeline — see PROJECT_SPEC.md §1c-34).
 * Clienity is cross-origin (link.clienity.com) with no official resize
 * script or postMessage height protocol observed on any of the 3 forms
 * (checked 2026-08-11: no iFrameResizer/parentIFrame hints in the served
 * document, and the only postMessage received was a one-time "iframeLoaded"
 * signal, not a continuous height update). Cross-origin same-origin-policy
 * also means our own JS can never read the framed document's real height at
 * runtime. So instead of an arbitrary fixed height, `minHeightMobile` /
 * `minHeightDesktop` below are real measured content heights (Playwright,
 * 5 widths from 360–1440px) plus an ~8% safety margin, per form — tall
 * enough that the iframe never needs its own internal scrollbar in normal
 * use, so the page scrolls as one continuous surface instead of nesting two
 * scrollbars. If Clienity's own content changes enough to exceed this, the
 * iframe's native overflow (not suppressed) shows its own scrollbar as a
 * graceful fallback rather than clipping content.
 */
export function ClienityEmbed({
  url,
  title,
  minHeightMobile,
  minHeightDesktop,
}: {
  url: string;
  title: string;
  minHeightMobile: number;
  minHeightDesktop: number;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full overflow-hidden rounded-sm border border-border bg-white">
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-[color:var(--surface-elevated)] text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-gold" aria-hidden />
          Loading application form…
        </div>
      ) : null}
      <iframe
        src={url}
        title={title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className="block w-full border-0 h-[var(--h-m)] md:h-[var(--h-d)]"
        style={
          {
            "--h-m": `${minHeightMobile}px`,
            "--h-d": `${minHeightDesktop}px`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
