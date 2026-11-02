import type { World } from "../canon/types";
import { repoPath } from "../paths";
import {
  equipmentPrompt,
  portraitPrompt,
  promptDigest,
  sitePrompt,
} from "./prompt";

// Every photograph canon calls for: one portrait per person, one inventory
// photo per equipment item, and one site photo per issue that has a photo
// direction. Each is generated once, reviewed, and committed with a sidecar
// recording the prompt it came from.

export type ImageKind = "equipment" | "portrait" | "site";

export interface ImageSpec {
  /** The canon ID the image depicts; its file name. */
  readonly id: string;
  readonly kind: ImageKind;
  readonly prompt: string;
  readonly promptSha256: string;
}

export function imageSpecs(world: World): readonly ImageSpec[] {
  const spec = (id: string, kind: ImageKind, prompt: string): ImageSpec => ({
    id,
    kind,
    prompt,
    promptSha256: promptDigest(prompt),
  });
  return [
    ...world.people.map((person) =>
      spec(person.id, "portrait", portraitPrompt(world, person)),
    ),
    ...world.equipment.map((item) =>
      spec(item.id, "equipment", equipmentPrompt(item)),
    ),
    ...world.issues.flatMap((issue) =>
      issue.photo ? [spec(issue.id, "site", sitePrompt(issue.photo))] : [],
    ),
  ];
}

function directory(kind: ImageKind): string {
  return kind === "portrait" ? "portraits" : "photos";
}

export function imagePath(spec: Pick<ImageSpec, "id" | "kind">): string {
  return repoPath("assets", directory(spec.kind), `${spec.id}.jpg`);
}

export function sidecarPath(spec: Pick<ImageSpec, "id" | "kind">): string {
  return repoPath("assets", directory(spec.kind), `${spec.id}.json`);
}

export function findSpec(world: World, id: string): ImageSpec {
  const spec = imageSpecs(world).find((item) => item.id === id);
  if (!spec) {
    throw new Error(`No image in canon has the ID ${id}`);
  }
  return spec;
}
