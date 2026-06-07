"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { resolveLogoUrl } from "@/lib/logo-url";
import {
  clampCrop,
  defaultCrop16x9,
  type CropRect,
  DEFAULT_CROP,
} from "@/lib/image-crop";

type ScreenshotCropUploadFieldProps = {
  label: string;
  hint?: string;
  value: string;
  crop: CropRect;
  onChange: (url: string) => void;
  onCropChange: (crop: CropRect) => void;
};

function fileFromClipboardData(data: DataTransfer) {
  for (const item of data.items) {
    if (!item.type.startsWith("image/")) continue;
    const blob = item.getAsFile();
    if (!blob) continue;

    const ext = blob.type.includes("jpeg")
      ? "jpg"
      : blob.type.includes("webp")
        ? "webp"
        : "png";

    return new File([blob], `paste-${Date.now()}.${ext}`, {
      type: blob.type || "image/png",
    });
  }

  return null;
}

export function ScreenshotCropUploadField({
  label,
  hint,
  value,
  crop,
  onChange,
  onCropChange,
}: ScreenshotCropUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pasteZoneRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; cropX: number; cropY: number } | null>(
    null,
  );
  const pendingCropReset = useRef(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pasteFocused, setPasteFocused] = useState(false);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  const previewSrc = value ? resolveLogoUrl(value) : null;

  const measureFrame = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    setFrameSize({ width: frame.clientWidth, height: frame.clientHeight });
  }, []);

  useEffect(() => {
    if (!previewSrc) return;
    const frame = frameRef.current;
    if (!frame) return;

    measureFrame();
    const observer = new ResizeObserver(measureFrame);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [previewSrc, measureFrame]);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadError(null);

      const body = new FormData();
      body.append("file", file);
      body.append("prefix", "viewer-win");
      body.append("variant", "screenshot");

      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };

        if (!res.ok) {
          setUploadError(data.error ?? "Не удалось загрузить файл");
          return;
        }

        if (data.url) {
          pendingCropReset.current = true;
          onChange(data.url);
        }
      } catch {
        setUploadError("Не удалось загрузить файл");
      } finally {
        setUploading(false);
      }
    },
    [onChange, onCropChange],
  );

  function handleImageLoad() {
    const img = imageRef.current;
    if (!img) return;
    if (pendingCropReset.current) {
      pendingCropReset.current = false;
      onCropChange(defaultCrop16x9(img.naturalWidth, img.naturalHeight));
    }
    measureFrame();
  }

  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!frameSize.width || !frameSize.height) return;

    event.preventDefault();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      cropX: crop.x,
      cropY: crop.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || !frameSize.width || !frameSize.height) return;

    const dx = (event.clientX - drag.startX) / frameSize.width;
    const dy = (event.clientY - drag.startY) / frameSize.height;

    onCropChange(
      clampCrop({
        x: drag.cropX + dx,
        y: drag.cropY + dy,
        w: crop.w,
        h: crop.h,
      }),
    );
  }

  function pointerUp(event: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  async function pasteFromClipboard() {
    if (uploading) return;

    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (!imageType) continue;

        const blob = await item.getType(imageType);
        const ext = imageType.includes("jpeg")
          ? "jpg"
          : imageType.includes("webp")
            ? "webp"
            : "png";
        const file = new File([blob], `paste-${Date.now()}.${ext}`, {
          type: imageType,
        });
        await handleFile(file);
        return;
      }

      setUploadError("В буфере нет изображения");
    } catch {
      pasteZoneRef.current?.focus();
      setUploadError("Нажмите на блок и вставьте через Ctrl+V / ⌘V");
    }
  }

  function handlePaste(event: React.ClipboardEvent) {
    if (uploading) return;

    const file = fileFromClipboardData(event.clipboardData);
    if (!file) return;

    event.preventDefault();
    void handleFile(file);
  }

  const cropStyle =
    frameSize.width && frameSize.height
      ? {
          left: `${crop.x * 100}%`,
          top: `${crop.y * 100}%`,
          width: `${crop.w * 100}%`,
          height: `${crop.h * 100}%`,
        }
      : undefined;

  return (
    <div className="space-y-2 md:col-span-2">
      <span className="text-sm font-semibold">{label}</span>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}

      <div
        ref={pasteZoneRef}
        tabIndex={0}
        onPaste={handlePaste}
        onFocus={() => setPasteFocused(true)}
        onBlur={() => setPasteFocused(false)}
        className={`space-y-3 rounded-xl outline-none${
          pasteFocused ? " ring-1 ring-violet-500/40 ring-offset-2 ring-offset-[#0b1422]" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="admin-btn-secondary w-fit px-4 py-2 disabled:opacity-60"
          >
            {uploading ? "Загрузка..." : value ? "Заменить файл" : "Выбрать файл"}
          </button>

          <button
            type="button"
            onClick={() => void pasteFromClipboard()}
            disabled={uploading}
            className="admin-btn-secondary w-fit px-4 py-2 disabled:opacity-60"
          >
            Вставить из буфера
          </button>

          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange("");
                onCropChange(DEFAULT_CROP);
                setUploadError(null);
              }}
              className="w-fit px-4 py-2 text-sm font-medium text-red-400"
            >
              Удалить
            </button>
          ) : null}
        </div>

        {previewSrc ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              Перетащите рамку 16:9, чтобы выбрать область кропа
            </p>
            <div
              ref={frameRef}
              className="relative mx-auto max-w-full overflow-hidden rounded-xl border border-white/10 bg-[#050e1c]"
              style={{ maxHeight: 420 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={previewSrc}
                alt=""
                className="block max-h-[420px] w-full select-none object-contain"
                draggable={false}
                onLoad={handleImageLoad}
              />

              <div
                className="absolute cursor-move touch-none border-2 border-violet-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                style={cropStyle}
                onPointerDown={pointerDown}
                onPointerMove={pointerMove}
                onPointerUp={pointerUp}
                onPointerCancel={pointerUp}
              >
                <div className="pointer-events-none absolute inset-0 border border-white/70" />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            PNG или JPG до 8 МБ. Можно вставить из буфера (Ctrl+V / ⌘V).
          </p>
        )}

        {value ? <p className="break-all text-[11px] text-slate-500">{value}</p> : null}
        {uploadError ? <p className="text-xs text-red-400">{uploadError}</p> : null}
      </div>
    </div>
  );
}
