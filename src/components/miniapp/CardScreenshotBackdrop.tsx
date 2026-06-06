import { resolveLogoUrl } from "@/lib/logo-url";

type CardScreenshotBackdropProps = {
  url?: string | null;
};

const SCREENSHOT_MASK =
  "linear-gradient(125deg, transparent 0%, transparent 22%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.16) 40%, rgba(0,0,0,0.38) 50%, rgba(0,0,0,0.62) 60%, rgba(0,0,0,0.84) 70%, #000 78%)";

export function CardScreenshotBackdrop({ url }: CardScreenshotBackdropProps) {
  const src = resolveLogoUrl(url ?? undefined);
  if (!src) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
      style={{
        backgroundImage: `url("${src}")`,
        backgroundSize: "cover",
        backgroundPosition: "62% center",
        backgroundRepeat: "no-repeat",
        opacity: 0.12,
        WebkitMaskImage: SCREENSHOT_MASK,
        maskImage: SCREENSHOT_MASK,
      }}
    />
  );
}
