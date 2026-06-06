export const PERSON_IMAGE_SIZE = 1340;

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

export async function processPersonImageInBrowser(file: File) {
  const image = await loadImage(file);
  const size = PERSON_IMAGE_SIZE;
  const scale = Math.min(size / image.width, size / image.height);
  const w = Math.max(1, Math.round(image.width * scale));
  const h = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas недоступен");
  }

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(image, size - w, size - h, w, h);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("Не удалось создать PNG")),
      "image/png",
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/, "") || "person";

  return new File([blob], `${baseName}.png`, { type: "image/png" });
}
