import sharp from "sharp";

export const PERSON_IMAGE_SIZE = 1340;

export async function processPersonImage(input: Buffer) {
  return sharp(input)
    .resize(PERSON_IMAGE_SIZE, PERSON_IMAGE_SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      position: "southeast",
    })
    .png()
    .toBuffer();
}
