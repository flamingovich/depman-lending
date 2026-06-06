import { Jimp } from "jimp";

export const PERSON_IMAGE_SIZE = 1340;

export async function processPersonImage(input: Buffer) {
  const size = PERSON_IMAGE_SIZE;
  const image = await Jimp.read(input);
  image.scaleToFit({ w: size, h: size });

  const canvas = new Jimp({ width: size, height: size, color: 0x00000000 });
  canvas.composite(image, size - image.width, size - image.height);

  return canvas.getBuffer("image/png");
}
