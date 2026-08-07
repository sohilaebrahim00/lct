import { Facebook, Instagram, Youtube } from "lucide-react";
import { CONTACT } from "@/lib/site-data";
import { TikTokIcon } from "@/components/icons/tiktok-icon";

const LINKS = [
  { url: CONTACT.instagramUrl, label: "LCT Universal on Instagram", Icon: Instagram },
  { url: CONTACT.tiktokUrl, label: "LCT Universal on TikTok", Icon: TikTokIcon },
  { url: CONTACT.youtubeUrl, label: "LCT Universal on YouTube", Icon: Youtube },
  { url: CONTACT.facebookUrl, label: "LCT Universal on Facebook", Icon: Facebook },
] as const;

/** Shared official social icon row — footer and Contact page both render this, so the markup/hover treatment never drifts between the two. */
export function SocialLinks({ className }: { className?: string }) {
  const active = LINKS.filter((l) => l.url);
  if (active.length === 0) return null;

  return (
    <div className={className ?? "flex gap-3"}>
      {active.map(({ url, label, Icon }) => (
        <a
          key={label}
          href={url!}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-foreground/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne hover:text-champagne hover:shadow-[var(--shadow-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon className="h-4 w-4" aria-hidden />
        </a>
      ))}
    </div>
  );
}
