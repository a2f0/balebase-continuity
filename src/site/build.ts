import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { BalebaseSeed } from "../export/seedTypes";
import type { CanonSnapshot } from "../genesis/canonSnapshot";
import { repoPath } from "../paths";
import { imageSize } from "../render/imageSize";
import { galleryPage } from "./page";
import type { Asset, Gallery } from "./types";

// The gallery is a static page built from the committed genesis/ snapshot: it
// verifies every file against the manifest, copies them, and renders one
// index.html. It never loads canon/world.ts or renders anything itself.

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function readGallery(root: string): Gallery {
  const manifestBytes = readFileSync(join(root, "manifest.json"));
  const manifest = JSON.parse(manifestBytes.toString("utf8")) as {
    files: readonly (Asset & { sha256: string })[];
  };
  const assets = manifest.files.map((asset): Asset => {
    const bytes = readFileSync(join(root, asset.path));
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (bytes.length !== asset.bytes || digest !== asset.sha256) {
      throw new Error(
        `genesis/${asset.path} differs from its manifest. Run bun run genesis.`,
      );
    }
    const { path, bytes: size } = asset;
    return /\.jpg$/.test(path)
      ? { path, bytes: size, image: imageSize(bytes) }
      : { path, bytes: size };
  });
  return {
    canon: readJson<CanonSnapshot>(join(root, "canon.json")),
    seed: readJson<BalebaseSeed>(join(root, "balebase", "seed.json")),
    assets: [...assets, { path: "manifest.json", bytes: manifestBytes.length }],
  };
}

// Favicons are rendered from assets/brand/logo.svg by the `favicons` target in
// agent-tool.json, so no rendered icon is committed.
function renderFavicons(output: string): void {
  const result = spawnSync(
    repoPath("node_modules", ".bin", "agent-tool"),
    ["images", "build", "favicons", "--out", output],
    { cwd: repoPath(), encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(
      `Favicon rendering failed: ${result.error?.message ?? result.stderr.trim()}`,
    );
  }
}

export function buildSite(output: string): Gallery {
  const root = repoPath("genesis");
  const gallery = readGallery(root);
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  cpSync(repoPath("site"), output, { recursive: true });
  renderFavicons(output);
  for (const asset of gallery.assets) {
    const destination = join(output, "genesis", asset.path);
    mkdirSync(join(destination, ".."), { recursive: true });
    cpSync(join(root, asset.path), destination);
  }
  for (const family of ["ibm-plex-sans-condensed", "ibm-plex-mono"]) {
    cpSync(repoPath("assets", "fonts", family), join(output, "fonts", family), {
      recursive: true,
    });
  }
  writeFileSync(join(output, "index.html"), galleryPage(gallery));
  return gallery;
}

if (import.meta.main) {
  const gallery = buildSite(repoPath("dist"));
  console.log(
    `Built dist/: ${gallery.seed.people.length} people, ${gallery.assets.length} downloadable files.`,
  );
}
