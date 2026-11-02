import { createHash } from "node:crypto";
import type { World } from "../canon/types";
import { validateWorld } from "../canon/validate";
import { buildBalebaseSeed } from "../export/balebaseSeed";
import { canonSnapshot } from "./canonSnapshot";
import { renderDocuments } from "./documents";
import { renderImages } from "./images";

// Everything under genesis/, built in memory from canon. The same canon always
// yields the same bytes, which is what `bun run genesis:check` relies on.

export interface GenesisFile {
  readonly path: string;
  readonly bytes: Uint8Array;
}

export const SEED_PATH = "balebase/seed.json";
const MANIFEST_PATH = "manifest.json";

function json(value: unknown): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`);
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function buildGenesis(world: World): readonly GenesisFile[] {
  const problems = validateWorld(world);
  if (problems.length > 0) {
    throw new Error(
      `Canon is inconsistent:\n${problems.map((item) => `- ${item}`).join("\n")}`,
    );
  }
  const files = new Map<string, Uint8Array>();
  renderImages(world, files);
  renderDocuments(world, files);
  files.set(SEED_PATH, json(buildBalebaseSeed(world, files)));
  files.set("canon.json", json(canonSnapshot(world)));

  const sorted = [...files.entries()].sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
  const manifest = {
    asOf: world.asOf,
    files: sorted.map(([path, bytes]) => ({
      bytes: bytes.length,
      path,
      sha256: sha256(bytes),
    })),
  };
  return [
    ...sorted.map(([path, bytes]) => ({ bytes, path })),
    { bytes: json(manifest), path: MANIFEST_PATH },
  ];
}
