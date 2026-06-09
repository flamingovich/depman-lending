"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { CroppedScreenshot } from "@/components/shared/CroppedScreenshot";
import { resolveLogoUrl } from "@/lib/logo-url";
import {
  applyCropZoom,
  clampCrop,
  cropToOverlayPixels,
  cropZoomLevel,
  defaultCrop16x9,
  getObjectContainLayout,
  MAX_CROP_ZOOM,
  MIN_CROP_ZOOM,
  reconcileCrop,
  type CropRect,
  type ImageLayout,
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
  const reconciledSrc = useRef<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pasteFocused, setPasteFocused] = useState(false);
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);
  const [zoom, setZoom] = useState(MIN_CROP_ZOOM);

  const previewSrc = value ? resolveLogoUrl(value) : null;

  const measureLayout = useCallback(() => {
    const frame = frameRef.current;
    const img = imageRef.current;
    if (!frame || !img?.naturalWidth || !img.naturalHeight) return;

    setImageLayout(
      getObjectContainLayout(
        frame.clientWidth,
        frame.clientHeight,
        img.naturalWidth,
        img.naturalHeight,
      ),
    );
  }, []);

  useEffect(() => {
    if (!previewSrc) {
      setImageLayout(null);
      reconciledSrc.current = null;
      return;
    }

    const frame = frameRef.current;
    if (!frame) return;

    measureLayout();
    const observer = new ResizeObserver(measureLayout);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [previewSrc, measureLayout]);

  useEffect(() => {
    const img = imageRef.current;
    if (!img?.naturalWidth || !img.naturalHeight) return;
    setZoom(cropZoomLevel(crop, img.naturalWidth, img.naturalHeight));
  }, [crop, previewSrc]);

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
          reconciledSrc.current = null;
          onChange(data.url);
        }
      } catch {
        setUploadError("Не удалось загрузить файл");
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  function handleImageLoad() {
    const img = imageRef.current;
    if (!img?.naturalWidth || !img.naturalHeight) return;

    if (pendingCropReset.current) {
      pendingCropReset.current = false;
      const next = defaultCrop16x9(img.naturalWidth, img.naturalHeight);
      onCropChange(next);
      setZoom(MIN_CROP_ZOOM);
      reconciledSrc.current = previewSrc;
    } else if (previewSrc && reconciledSrc.current !== previewSrc) {
      const next = reconcileCrop(crop, img.naturalWidth, img.naturalHeight);
      onCropChange(next);
      setZoom(cropZoomLevel(next, img.naturalWidth, img.naturalHeight));
      reconciledSrc.current = previewSrc;
    }

    measureLayout();
  }

  function changeZoom(nextZoom: number) {
    const img = imageRef.current;
    if (!img?.naturalWidth || !img.naturalHeight) return;
    const clamped = Math.min(MAX_CROP_ZOOM, Math.max(MIN_CROP_ZOOM, nextZoom));
    onCropChange(applyCropZoom(crop, img.naturalWidth, img.naturalHeight, clamped));
    setZoom(clamped);
  }

  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!imageLayout) return;

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
    if (!drag || !imageLayout) return;

    const dx = (event.clientX - drag.startX) / imageLayout.width;
    const dy = (event.clientY - drag.startY) / imageLayout.height;

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

  const cropOverlay =
    imageLayout ? cropToOverlayPixels(crop, imageLayout) : null;

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
                setImageLayout(null);
                setZoom(MIN_CROP_ZOOM);
                reconciledSrc.current = null;
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
              className="relative mx-auto w-fit max-w-full overflow-hidden rounded-xl border border-white/10 bg-[#050e1c]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={previewSrc}
                alt=""
                className="block max-h-[420px] w-auto max-w-full select-none"
                draggable={false}
                onLoad={handleImageLoad}
              />

              {cropOverlay ? (
                <div
                  className="absolute cursor-move touch-none border-2 border-violet-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                  style={{
                    left: cropOverlay.left,
                    top: cropOverlay.top,
                    width: cropOverlay.width,
                    height: cropOverlay.height,
                  }}
                  onPointerDown={pointerDown}
                  onPointerMove={pointerMove}
                  onPointerUp={pointerUp}
                  onPointerCancel={pointerUp}
                >
                  <div className="pointer-events-none absolute inset-0 border border-white/70" />
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-500">Масштаб</span>
              <button
                type="button"
                onClick={() => changeZoom(zoom - 0.25)}
                disabled={zoom <= MIN_CROP_ZOOM}
                className="admin-btn-secondary flex h-8 w-8 items-center justify-center disabled:opacity-40"
                aria-label="Отдалить"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="range"
                min={MIN_CROP_ZOOM}
                max={MAX_CROP_ZOOM}
                step={0.05}
                value={zoom}
                onChange={(e) => changeZoom(Number(e.target.value))}
                className="h-1.5 w-36 cursor-pointer accent-violet-500"
                aria-label="Масштаб кропа"
              />
              <button
                type="button"
                onClick={() => changeZoom(zoom + 0.25)}
                disabled={zoom >= MAX_CROP_ZOOM}
                className="admin-btn-secondary flex h-8 w-8 items-center justify-center disabled:opacity-40"
                aria-label="Приблизить"
              >
                <Plus className="h-4 w-4" />
              </button>
              <span className="min-w-[3ch] text-xs font-semibold text-slate-300">
                {zoom.toFixed(1)}×
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500">Так будет на главной</p>
              <CroppedScreenshot
                src={previewSrc}
                crop={crop}
                className="w-full max-w-sm rounded-lg border border-white/10"
              />
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
