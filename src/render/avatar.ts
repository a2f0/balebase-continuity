import { imageSize } from "./imageSize";
import { dataUri, rasterize, toJpeg } from "./raster";

// A square profile photo cut from a person's canonical portrait. Balebase
// shows people as small round avatars, so the crop is a tight head and
// shoulders shot centered on the recorded face.

const AVATAR_SIZE = 512;
const AVATAR_QUALITY = 88;
/** Face height as a fraction of the crop's side. */
const FACE_FRACTION = 0.6;
/** Where the face center sits, as a fraction of the crop's side. */
const FACE_Y = 0.47;

/** Where the head sits in the source, as fractions of its width and height. */
export interface FaceFraming {
  readonly cx: number;
  readonly cy: number;
  readonly height: number;
}

export interface Crop {
  readonly x: number;
  readonly y: number;
  readonly side: number;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** A square around the face, shifted (and if need be shrunk) to stay inside. */
export function avatarCrop(
  width: number,
  height: number,
  framing: FaceFraming,
): Crop {
  const side = Math.min(
    (framing.height * height) / FACE_FRACTION,
    width,
    height,
  );
  const clamp = (value: number, max: number) =>
    Math.min(Math.max(value, 0), max);
  return {
    side: round(side),
    x: round(clamp(framing.cx * width - side / 2, width - side)),
    y: round(clamp(framing.cy * height - side * FACE_Y, height - side)),
  };
}

export function renderAvatar(
  portrait: Uint8Array,
  framing: FaceFraming,
  size = AVATAR_SIZE,
): Uint8Array {
  const { height, mimeType, width } = imageSize(portrait);
  const crop = avatarCrop(width, height, framing);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${crop.x} ${crop.y} ${crop.side} ${crop.side}"><image width="${width}" height="${height}" href="${dataUri(mimeType, portrait)}"/></svg>`;
  return toJpeg(rasterize(svg, size), AVATAR_QUALITY);
}
