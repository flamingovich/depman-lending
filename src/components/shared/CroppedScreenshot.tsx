"use client";

import { useEffect, useState } from "react";
import type { CropRect } from "@/lib/image-crop";

const VIEWPORT_ASPECT = 16 / 9;

type CroppedScreenshotProps = {
  src: string;
  crop: CropRect;
  alt?: string;
  className?: string;
  draggable?: boolean;
};

function cropStyles(crop: CropRect, imageAspect: number) {
  const widthPct = 100 / crop.w;
  const leftPct = (-crop.x / crop.w) * 100;
  const topPct = (-crop.y / crop.w) * (VIEWPORT_ASPECT / imageAspect) * 100;

  return {
    width: `${widthPct}%`,
    height: "auto" as const,
    left: `${leftPct}%`,
    top: `${topPct}%`,
  };
}

export function CroppedScreenshot({
  src,
  crop,
  alt = "",
  className = "",
  draggable = false,
}: CroppedScreenshotProps) {
  const [imageAspect, setImageAspect] = useState(VIEWPORT_ASPECT);

  useEffect(() => {
    setImageAspect(VIEWPORT_ASPECT);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: "16 / 9" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={draggable}
        className="absolute max-w-none"
        style={cropStyles(crop, imageAspect)}
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          if (!naturalWidth || !naturalHeight) return;
          setImageAspect(naturalWidth / naturalHeight);
        }}
      />
    </div>
  );
}
