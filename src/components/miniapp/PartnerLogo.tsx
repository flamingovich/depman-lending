"use client";

import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { resolveLogoUrl } from "@/lib/logo-url";

type PartnerLogoProps = {
  name: string;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  accentColor: string;
  variant?: "strip" | "grid" | "gridHeader" | "compact" | "detail";
  className?: string;
  forceTheme?: "light" | "dark";
};

const LOGO_SIZES = {
  strip: { width: 64, height: 26 },
  grid: { width: 72, height: 28 },
  gridHeader: { width: 80, height: 32 },
  compact: { width: 72, height: 36 },
  detail: { width: 140, height: 44 },
} as const;

export function PartnerLogo({
  name,
  logoUrl,
  logoLightUrl,
  logoDarkUrl,
  accentColor,
  variant = "grid",
  className = "",
  forceTheme,
}: PartnerLogoProps) {
  const { theme } = useTheme();
  const { width, height } = LOGO_SIZES[variant];
  const resolvedTheme = forceTheme ?? theme;

  const themedLogo = resolveLogoUrl(
    resolvedTheme === "dark"
      ? logoDarkUrl || logoUrl
      : logoLightUrl || logoUrl,
  );

  const alignClass =
    variant === "strip" ||
    variant === "detail" ||
    variant === "gridHeader"
      ? "object-center"
      : "object-left";

  if (themedLogo) {
    if (variant === "strip") {
      return (
        <div className="new-bonus-logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={themedLogo}
            alt=""
            className={`new-bonus-logo-img object-contain ${className}`}
            aria-hidden
          />
        </div>
      );
    }

    if (variant === "detail") {
      return (
        <DetailLogoImage src={themedLogo} className={className} />
      );
    }

    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={themedLogo}
        alt=""
        width={width}
        height={height}
        className={`block object-contain ${alignClass} ${className}`}
        style={{ maxHeight: height, maxWidth: width }}
        aria-hidden
      />
    );
  }

  const sizeClass =
    variant === "strip"
      ? "text-[11px] leading-[1.05]"
      : variant === "compact"
        ? "text-xs leading-tight"
        : variant === "gridHeader"
          ? "truncate text-[10px] leading-none"
          : variant === "detail"
            ? "text-sm leading-tight"
            : "text-[10px] leading-tight";

  const parts = name.split(/\s+/);
  if (parts.length > 1 && variant === "strip") {
    return (
      <span
        className={`block text-center font-black uppercase tracking-tight ${sizeClass} ${className}`}
        style={{ color: accentColor }}
      >
        {parts.map((part) => (
          <span key={part} className="block">
            {part}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span
      className={`block font-black uppercase tracking-tight ${variant === "detail" ? "text-center" : ""} ${sizeClass} ${className}`}
      style={{ color: accentColor }}
    >
      {name}
    </span>
  );
}

function resolveThemedLogo(
  theme: "light" | "dark",
  logoUrl?: string | null,
  logoLightUrl?: string | null,
  logoDarkUrl?: string | null,
) {
  return theme === "dark"
    ? logoDarkUrl || logoUrl
    : logoLightUrl || logoUrl;
}

export function usePartnerLogoSrc(
  logoUrl?: string | null,
  logoLightUrl?: string | null,
  logoDarkUrl?: string | null,
) {
  const { theme } = useTheme();
  return resolveLogoUrl(
    resolveThemedLogo(theme, logoUrl, logoLightUrl, logoDarkUrl),
  );
}

function DetailLogoImage({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const [paddedCanvas, setPaddedCanvas] = useState(false);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt=""
      className={`partner-detail-logo-img${paddedCanvas ? " partner-detail-logo-img--padded" : ""} ${className}`.trim()}
      aria-hidden
      onLoad={(event) => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        if (!naturalWidth || !naturalHeight) return;
        setPaddedCanvas(naturalWidth / naturalHeight > 1.75);
      }}
    />
  );
}
