import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/lct-universal-logo-transparent.png.asset.json";

export const LOGO_URL = logoAsset.url;
export const LOGO_ALT = "LCT Universal Executive Transports";

type LogoProps = {
  className?: string;
  imgClassName?: string;
  linked?: boolean;
  priority?: boolean;
  onClick?: () => void;
};

export function Logo({
  className = "",
  imgClassName = "h-14 w-auto",
  linked = true,
  priority = false,
  onClick,
}: LogoProps) {
  const img = (
    <img
      src={LOGO_URL}
      alt={LOGO_ALT}
      className={`${imgClassName} select-none object-contain`}
      draggable={false}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );

  if (!linked) return <span className={`inline-flex items-center ${className}`}>{img}</span>;

  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={LOGO_ALT}
      className={`inline-flex items-center transition-opacity hover:opacity-90 ${className}`}
    >
      {img}
    </Link>
  );
}
