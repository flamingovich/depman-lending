import sharp from "sharp";

/**
 * Роль картинки определяет, насколько сильно её можно ужать.
 * Скриншот на фоне карточки виден под прозрачностью 12% — ему хватает 720px,
 * а скрин заноса зритель разглядывает, поэтому он крупнее и качественнее.
 */
export type UploadRole = "logo" | "coin" | "person" | "cardBackdrop" | "viewerWin";

const PRESETS: Record<UploadRole, { maxDimension: number; quality: number }> = {
  logo: { maxDimension: 512, quality: 90 },
  coin: { maxDimension: 512, quality: 85 },
  person: { maxDimension: 1000, quality: 82 },
  cardBackdrop: { maxDimension: 720, quality: 62 },
  viewerWin: { maxDimension: 1280, quality: 78 },
};

export function resolveUploadRole(
  variant: string | undefined,
  prefix: string | undefined,
): UploadRole {
  const name = (prefix ?? "").toLowerCase();

  if (variant === "person") return "person";
  if (variant === "screenshot") {
    return name.startsWith("viewer-win") ? "viewerWin" : "cardBackdrop";
  }
  if (name.endsWith("-coin")) return "coin";
  return "logo";
}

export type OptimizedImage = {
  data: Uint8Array;
  ext: "webp";
  width: number;
  height: number;
};

export async function optimizeUploadImage(
  input: Buffer,
  role: UploadRole,
): Promise<OptimizedImage> {
  const { maxDimension, quality } = PRESETS[role];

  const pipeline = sharp(input, { failOn: "none" })
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 5 });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return { data, ext: "webp", width: info.width, height: info.height };
}
