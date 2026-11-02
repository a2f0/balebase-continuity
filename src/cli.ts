import { parseArgs } from "node:util";
import { world } from "../canon/world";
import { validateWorld } from "./canon/validate";
import { buildGenesis } from "./genesis/build";
import { diffGenesis, type GenesisDiff, writeGenesis } from "./genesis/sync";
import { imageSpecs } from "./images/catalog";
import { imageStatus } from "./images/sidecar";
import { repoPath } from "./paths";

// bun run canon:check       validate canon and report image status
// bun run genesis           render canon into genesis/
// bun run genesis:check     fail if genesis/ is not exactly what canon renders

const GENESIS_ROOT = repoPath("genesis");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function validate(): void {
  const problems = validateWorld(world);
  if (problems.length > 0) {
    fail(
      `Canon is inconsistent:\n${problems.map((item) => `- ${item}`).join("\n")}`,
    );
  }
  console.log(
    `Canon is consistent: ${world.people.length} people as of ${world.asOf}.`,
  );
  const attention = imageSpecs(world)
    .map((spec) => [spec.id, imageStatus(spec)] as const)
    .filter(([, status]) => status !== "current");
  if (attention.length > 0) {
    fail(
      [
        "Images needing attention (see `bun run images`):",
        ...attention.map(([id, status]) => `  ${status.padEnd(11)} ${id}`),
      ].join("\n"),
    );
  }
}

function describe(diff: GenesisDiff): string[] {
  return [
    ...diff.added.map((path) => `  added    ${path}`),
    ...diff.changed.map((path) => `  changed  ${path}`),
    ...diff.removed.map((path) => `  removed  ${path}`),
  ];
}

function generate(): void {
  const files = buildGenesis(world);
  const lines = describe(writeGenesis(files, GENESIS_ROOT));
  console.log(
    lines.length > 0
      ? `Updated genesis/ (${files.length} files):\n${lines.join("\n")}`
      : `genesis/ is already current (${files.length} files).`,
  );
}

function check(): void {
  const files = buildGenesis(world);
  const lines = describe(diffGenesis(files, GENESIS_ROOT));
  if (lines.length > 0) {
    fail(
      `genesis/ does not match canon. Run \`bun run genesis\` and commit the result:\n${lines.join("\n")}`,
    );
  }
  console.log(`genesis/ matches canon (${files.length} files).`);
}

const { positionals } = parseArgs({ allowPositionals: true });

switch (positionals[0]) {
  case "validate":
    validate();
    break;
  case "generate":
    generate();
    break;
  case "check":
    check();
    break;
  default:
    fail("Usage: bun src/cli.ts validate|generate|check");
}
