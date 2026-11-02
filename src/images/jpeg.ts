import { imageSize } from "../render/imageSize";
import { dataUri, rasterize, toJpeg } from "../render/raster";

// Images are stored as JPEG no larger than Balebase needs. A photographic PNG
// runs several times the size of the same JPEG, and every image stays in
// history, so imports are transcoded and, when oversized, scaled down.

export const MAX_EDGE = 1536;
const QUALITY = 90;

export function storedJpeg(bytes: Uint8Array): Uint8Array {
  const { height, mimeType, width } = imageSize(bytes);
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  if (mimeType === "image/jpeg" && scale === 1) {
    return bytes;
  }
  // Flatten any transparency onto white; JPEG has no alpha.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#ffffff"/><image width="${width}" height="${height}" href="${dataUri(mimeType, bytes)}"/></svg>`;
  return toJpeg(rasterize(svg, Math.round(width * scale)), QUALITY);
}
