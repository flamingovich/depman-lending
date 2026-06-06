"use client";

import { useCallback, useRef, useState } from "react";
import { resolveLogoUrl } from "@/lib/logo-url";

type LogoUploadFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  uploadPrefix?: string;
  previewTheme?: "light" | "dark";
  accept?: string;
  uploadVariant?: string;
  sizeHint?: string;
  enablePaste?: boolean;
};

const PREVIEW_BACKGROUNDS = {
  light: {
    bg: "#f3f4f9",
    border: "rgba(16, 17, 18, 0.12)",
    label: "Светлая тема",
  },
  dark: {
    bg: "#050e1c",
    border: "rgba(255, 255, 255, 0.12)",
    label: "Тёмная тема",
  },
} as const;

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

export function LogoUploadField({
  label,
  hint,
  value,
  onChange,
  uploadPrefix = "logo",
  previewTheme = "light",
  accept = "image/png,image/webp,.png,.webp",
  uploadVariant,
  sizeHint = "Рекомендуемый размер: 500×250 px, PNG без фона",
  enablePaste = false,
}: LogoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pasteZoneRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [pasteFocused, setPasteFocused] = useState(false);
  const preview = PREVIEW_BACKGROUNDS[previewTheme];
  const previewSrc = value ? resolveLogoUrl(value) : null;

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadError(null);
      setPreviewError(null);

      const body = new FormData();
      body.append("file", file);
      body.append("prefix", uploadPrefix);
      if (uploadVariant) body.append("variant", uploadVariant);

      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };

        if (!res.ok) {
          setUploadError(data.error ?? "Не удалось загрузить файл");
          return;
        }

        if (data.url) {
          onChange(data.url);
          setPreviewVersion((v) => v + 1);
        }
      } catch {
        setUploadError("Не удалось загрузить файл");
      } finally {
        setUploading(false);
      }
    },
    [onChange, uploadPrefix, uploadVariant],
  );

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
    if (!enablePaste || uploading) return;

    const file = fileFromClipboardData(event.clipboardData);
    if (!file) return;

    event.preventDefault();
    void handleFile(file);
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <span className="text-sm font-semibold">{label}</span>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}

      <div
        ref={pasteZoneRef}
        tabIndex={enablePaste ? 0 : undefined}
        onPaste={enablePaste ? handlePaste : undefined}
        onFocus={enablePaste ? () => setPasteFocused(true) : undefined}
        onBlur={enablePaste ? () => setPasteFocused(false) : undefined}
        className={`flex flex-wrap items-start gap-4 rounded-xl outline-none${
          enablePaste && pasteFocused
            ? " ring-1 ring-violet-500/40 ring-offset-2 ring-offset-[#0b1422]"
            : ""
        }`}
      >
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {preview.label}
          </span>
          <div
            className="flex h-[80px] w-[160px] items-center justify-center rounded-xl border p-2"
            style={{
              backgroundColor: preview.bg,
              borderColor: preview.border,
            }}
          >
            {previewSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={`${previewSrc}-${previewVersion}`}
                src={`${previewSrc}?v=${previewVersion}`}
                alt=""
                className="block max-h-[72px] max-w-full object-contain"
                onError={() =>
                  setPreviewError("Файл загружен, но превью не открылось")
                }
                onLoad={() => setPreviewError(null)}
              />
            ) : (
              <span
                className="text-center text-[11px]"
                style={{
                  color: previewTheme === "dark" ? "rgba(255,255,255,0.4)" : "#94a3b8",
                }}
              >
                Нет файла
              </span>
            )}
          </div>
        </div>

        <div className="flex min-w-[180px] flex-1 flex-col gap-2 pt-5">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
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

            {enablePaste ? (
              <button
                type="button"
                onClick={() => void pasteFromClipboard()}
                disabled={uploading}
                className="admin-btn-secondary w-fit px-4 py-2 disabled:opacity-60"
              >
                Вставить из буфера
              </button>
            ) : null}
          </div>

          <p className="text-xs text-slate-400">{sizeHint}</p>

          {enablePaste ? (
            <p className="text-xs text-slate-500">
              Или кликните сюда и нажмите Ctrl+V / ⌘V
            </p>
          ) : null}

          {value ? (
            <>
              <p className="break-all text-[11px] text-slate-500">{value}</p>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setPreviewError(null);
                }}
                className="w-fit text-xs font-medium text-red-400"
              >
                Удалить
              </button>
            </>
          ) : null}

          {previewError ? (
            <p className="text-xs text-amber-400">{previewError}</p>
          ) : null}

          {uploadError ? (
            <p className="text-xs text-red-400">{uploadError}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
