"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type LogoUploadFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  uploadPrefix?: string;
  previewTheme?: "light" | "dark";
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

export function LogoUploadField({
  label,
  hint,
  value,
  onChange,
  uploadPrefix = "logo",
  previewTheme = "light",
}: LogoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const preview = PREVIEW_BACKGROUNDS[previewTheme];

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);

    const body = new FormData();
    body.append("file", file);
    body.append("prefix", uploadPrefix);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok) {
        setUploadError(data.error ?? "Не удалось загрузить файл");
        return;
      }

      if (data.url) onChange(data.url);
    } catch {
      setUploadError("Не удалось загрузить файл");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <span className="text-sm font-semibold">{label}</span>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}

      <div className="flex flex-wrap items-start gap-4">
        <div className="space-y-1.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-wide text-slate-500"
          >
            {preview.label}
          </span>
          <div
            className="flex h-[80px] w-[160px] items-center justify-center rounded-xl border p-2"
            style={{
              backgroundColor: preview.bg,
              borderColor: preview.border,
            }}
          >
            {value ? (
              <Image
                src={value}
                alt=""
                width={152}
                height={76}
                className="max-h-[72px] max-w-full object-contain"
                unoptimized
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
            accept="image/png,image/webp"
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
            className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            {uploading ? "Загрузка..." : value ? "Заменить файл" : "Выбрать файл"}
          </button>

          <p className="text-xs text-slate-500">Рекомендуемый размер: 500×250 px, PNG без фона</p>

          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="w-fit text-xs font-medium text-red-600"
            >
              Удалить
            </button>
          ) : null}

          {uploadError ? (
            <p className="text-xs text-red-600">{uploadError}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
