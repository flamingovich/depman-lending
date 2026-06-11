import { resolveLogoUrl } from "@/lib/logo-url";

type CardScreenshotBackdropProps = {
  url?: string | null;
  /** Which side keeps the screenshot visible; the opposite edge fades out. */
  fadeSide?: "left" | "right";
};

const MASK_FADE_RIGHT =
  "linear-gradient(125deg, transparent 0%, transparent 22%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.16) 40%, rgba(0,0,0,0.38) 50%, rgba(0,0,0,0.62) 60%, rgba(0,0,0,0.84) 70%, #000 78%)";

const MASK_FADE_LEFT =
  "linear-gradient(90deg, #000 0%, #000 28%, rgba(0, 0, 0, 0.15) 100%)";

export function CardScreenshotBackdrop({
  url,
  fadeSide = "right",
}: CardScreenshotBackdropProps) {
  const src = resolveLogoUrl(url ?? undefined);
  if (!src) return null;

  const mask = fadeSide === "left" ? MASK_FADE_LEFT : MASK_FADE_RIGHT;
  const backgroundPosition = fadeSide === "left" ? "38% center" : "62% center";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
      style={{
        backgroundImage: `url("${src}")`,
        backgroundSize: "cover",
        backgroundPosition,
        backgroundRepeat: "no-repeat",
        opacity: 0.12,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  );
}
