import { MAX_LOGO_UPLOAD_BYTES } from "@/lib/upload-limits";

const COIN_MAX_DIMENSION = 768;

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось прочитать изображение"));
    };
    image.src = url;
  });
}

async function renderCoinPng(image: HTMLImageElement, maxDimension: number) {
  const scale = Math.min(
    maxDimension / image.width,
    maxDimension / image.height,
    1,
  );
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas недоступен");
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("Не удалось создать PNG")),
      "image/png",
    );
  });
}

export async function processCoinImageInBrowser(file: File) {
  if (file.size <= MAX_LOGO_UPLOAD_BYTES) {
    return file;
  }

  const image = await loadImage(file);
  let maxDimension = COIN_MAX_DIMENSION;

  while (maxDimension >= 128) {
    const blob = await renderCoinPng(image, maxDimension);
    if (blob.size <= MAX_LOGO_UPLOAD_BYTES) {
      const baseName = file.name.replace(/\.[^.]+$/, "") || "coin";
      return new File([blob], `${baseName}.png`, { type: "image/png" });
    }
    maxDimension = Math.round(maxDimension * 0.75);
  }

  const blob = await renderCoinPng(image, 128);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "coin";
  return new File([blob], `${baseName}.png`, { type: "image/png" });
}
