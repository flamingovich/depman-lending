"use client";

import { useEffect, useState } from "react";
import { cropToImgStyles, type CropRect } from "@/lib/image-crop";

type CroppedScreenshotProps = {
  src: string;
  crop: CropRect;
  alt?: string;
  className?: string;
};

export function CroppedScreenshot({
  src,
  crop,
  alt = "",
  className = "",
}: CroppedScreenshotProps) {
  const [imageAspect, setImageAspect] = useState<number | null>(null);

  useEffect(() => {
    setImageAspect(null);
    const img = new Image();
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      setImageAspect(img.naturalWidth / img.naturalHeight);
    };
    img.src = src;
  }, [src]);

  if (!imageAspect) {
    return (
      <div
        className={`bg-[#050e1c] ${className}`}
        style={{ aspectRatio: "16 / 9" }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: "16 / 9" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute max-w-none"
        style={cropToImgStyles(crop, imageAspect)}
      />
    </div>
  );
}
