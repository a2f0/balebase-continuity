import type { World } from "../canon/types";
import { PATHS } from "../export/balebaseSeed";
import { imageSpecs } from "../images/catalog";
import { imageStatus, readImage, readSidecar } from "../images/sidecar";
import { renderAvatar } from "../render/avatar";

// Copies every reviewed photograph into genesis/ and cuts each person's
// avatar from their portrait. Genesis refuses to build around a missing,
// stale, or edited image: screenshots must never show an unreviewed face.

export function renderImages(world: World, files: Map<string, Uint8Array>) {
  const problems: string[] = [];
  for (const spec of imageSpecs(world)) {
    const status = imageStatus(spec);
    const bytes = readImage(spec);
    if (status !== "current" || !bytes) {
      problems.push(`${spec.id} is ${status}`);
      continue;
    }
    if (spec.kind !== "portrait") {
      // Identical bytes share one Git blob, so these copies cost nothing.
      files.set(PATHS.photo(spec.id), bytes);
      continue;
    }
    const framing = readSidecar(spec)?.framing;
    if (!framing) {
      problems.push(`${spec.id} portrait has no framing`);
      continue;
    }
    files.set(PATHS.portrait(spec.id), bytes);
    files.set(PATHS.avatar(spec.id), renderAvatar(bytes, framing));
  }
  if (problems.length > 0) {
    throw new Error(
      `Images need attention (see \`bun run images\`):\n${problems.map((item) => `- ${item}`).join("\n")}`,
    );
  }
}
