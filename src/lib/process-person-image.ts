export const PERSON_IMAGE_SIZE = 1340;

export async function processPersonImage(input: Buffer) {
  const { Jimp, HorizontalAlign, VerticalAlign } = await import("jimp");
  const image = await Jimp.read(input);
  image.background = 0x00000000;
  image.contain({
    w: PERSON_IMAGE_SIZE,
    h: PERSON_IMAGE_SIZE,
    align: HorizontalAlign.RIGHT | VerticalAlign.BOTTOM,
  });

  return image.getBuffer("image/png");
}
