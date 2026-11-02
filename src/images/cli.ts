import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import { world } from "../../canon/world";
import { findSpec, imagePath, imageSpecs, sidecarPath } from "./catalog";
import { storedJpeg } from "./jpeg";
import { imageStatus, readSidecar, type Sidecar, sha256 } from "./sidecar";

// bun run images                                   status of every image
// bun run images prompt <id>                       print the canon prompt
// bun run images import <id> <file> --model <name> store a reviewed image

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function status(): void {
  for (const spec of imageSpecs(world)) {
    console.log(
      `${imageStatus(spec).padEnd(11)} ${spec.kind.padEnd(10)} ${spec.id}`,
    );
  }
}

function importImage(id: string, file: string, model: string, on: string) {
  const spec = findSpec(world, id);
  const bytes = storedJpeg(new Uint8Array(readFileSync(file)));
  const previous = readSidecar(spec);
  const sidecar: Sidecar = {
    id: spec.id,
    model,
    prompt: spec.prompt,
    promptSha256: spec.promptSha256,
    imageSha256: sha256(bytes),
    generatedOn: on,
    ...(previous?.framing ? { framing: previous.framing } : {}),
  };
  mkdirSync(dirname(imagePath(spec)), { recursive: true });
  writeFileSync(imagePath(spec), bytes);
  writeFileSync(sidecarPath(spec), `${JSON.stringify(sidecar, null, 2)}\n`);
  console.log(
    `Imported ${imagePath(spec)} (${Math.round(bytes.length / 1024)} KB).`,
  );
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    model: { type: "string" },
    // The date the image was made; recorded, never read from the clock.
    on: { type: "string" },
  },
});

switch (positionals[0]) {
  case undefined:
  case "status":
    status();
    break;
  case "prompt": {
    const id = positionals[1] ?? fail("Usage: bun run images prompt <id>");
    console.log(findSpec(world, id).prompt);
    break;
  }
  case "import": {
    const [, id, file] = positionals;
    if (!id || !file || !values.model || !values.on) {
      fail(
        "Usage: bun run images import <id> <file> --model <name> --on <YYYY-MM-DD>",
      );
    }
    importImage(id, file, values.model, values.on);
    break;
  }
  default:
    fail("Usage: bun run images [status|prompt <id>|import <id> <file>]");
}
