"use client";

import { useRef, useState } from "react";
import { resolveLogoUrl } from "@/lib/logo-url";

type PersonImageUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  uploadPrefix?: string;
};

export function PersonImageUploadField({
  value,
  onChange,
  uploadPrefix = "person",
}: PersonImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const previewSrc = value ? resolveLogoUrl(value) : null;

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    setPreviewError(null);

    const body = new FormData();
    body.append("file", file);
    body.append("prefix", uploadPrefix);
    body.append("variant", "person");

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
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <span className="text-sm font-semibold">Фото в карточке (YouTube)</span>
      <p className="text-xs text-slate-400">
        PNG с прозрачностью. Автоматически приводится к 1340×1340 px.
        Если меньше — увеличится, расположение справа снизу сохранится.
      </p>

      <div className="flex flex-wrap items-start gap-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Превью
          </span>
          <div className="flex h-[120px] w-[120px] items-end justify-end overflow-hidden rounded-xl border border-white/12 bg-[#050e1c] p-2">
            {previewSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={`${previewSrc}-${previewVersion}`}
                src={`${previewSrc}?v=${previewVersion}`}
                alt=""
                className="block max-h-full max-w-full object-contain object-bottom-right"
                onError={() =>
                  setPreviewError("Файл загружен, но превью не открылось")
                }
                onLoad={() => setPreviewError(null)}
              />
            ) : (
              <span className="w-full text-center text-[11px] text-white/40">
                По умолчанию depman.png
              </span>
            )}
          </div>
        </div>

        <div className="flex min-w-[180px] flex-1 flex-col gap-2 pt-5">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="admin-btn-secondary w-fit px-4 py-2 disabled:opacity-60"
          >
            {uploading ? "Загрузка..." : value ? "Заменить фото" : "Загрузить фото"}
          </button>

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
                Сбросить (вернуть depman.png)
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
