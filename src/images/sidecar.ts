import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { type ImageSpec, imagePath, sidecarPath } from "./catalog";

// Each image has a JSON sidecar recording how it was made. Canon is the source
// of truth for the prompt; the sidecar records which prompt the image on disk
// actually came from, and the hash that proves the image is unedited.

/** Where a portrait's head sits, as fractions of the image size. */
export interface Framing {
  readonly cx: number;
  readonly cy: number;
  /** Chin to the top of the hair. */
  readonly height: number;
}

export interface Sidecar {
  readonly id: string;
  readonly model: string;
  readonly prompt: string;
  readonly promptSha256: string;
  readonly imageSha256: string;
  readonly generatedOn: string;
  /** Portraits only: where the avatar crop centers. */
  readonly framing?: Framing;
}

export type ImageStatus =
  | "current"
  | "edited"
  | "missing"
  | "stale"
  | "unrecorded";

export function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function readSidecar(spec: ImageSpec): Sidecar | undefined {
  const path = sidecarPath(spec);
  return existsSync(path)
    ? (JSON.parse(readFileSync(path, "utf8")) as Sidecar)
    : undefined;
}

export function readImage(spec: ImageSpec): Uint8Array | undefined {
  const path = imagePath(spec);
  return existsSync(path) ? new Uint8Array(readFileSync(path)) : undefined;
}

/**
 * - missing: no image yet
 * - unrecorded: an image without a sidecar
 * - edited: the image no longer matches the sidecar's hash
 * - stale: canon's prompt changed since the image was made
 */
export function imageStatus(spec: ImageSpec): ImageStatus {
  const bytes = readImage(spec);
  if (!bytes) {
    return "missing";
  }
  const sidecar = readSidecar(spec);
  if (!sidecar) {
    return "unrecorded";
  }
  if (sidecar.imageSha256 !== sha256(bytes)) {
    return "edited";
  }
  return sidecar.promptSha256 === spec.promptSha256 ? "current" : "stale";
}
