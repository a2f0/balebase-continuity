# Development tooling

Use the Bun and ShellCheck versions in `.mise.toml`. In agent shells, put their
installations under `~/.local/share/mise/installs` first on PATH; do not run
`mise trust`. Install dependencies with `bun install --frozen-lockfile`, then
run `bun run hooks:install`.

`mise.lock` is committed; regenerate it with `mise lock` whenever `.mise.toml`
changes. CI's `jdx/mise-action` steps run with `--locked`, and every workflow's
mise-action `version` must read the lockfile format (format 4 needs mise
2026.11.1+), so move those pins before the lock's format.

## Hooks and branches

Tracked hooks live in `scripts/git/hooks/` and are declared under
`hooks.files` in `agent-tool.json`; `bun run hooks:install` installs them and
`bun run hooks:check` checks the installed copies. Rerun installation after
pulling hook changes; the pre-push hook refuses stale copies.

- `commit-msg` runs the shared commit check and commitlint.
- `pre-commit` checks the branch name, file names, staged binaries, and runs
  lint-staged.
- `pre-push` is agent-tool's push gate, printed by
  `bun run agent-tool push-gate hook`; never edit it by hand. It checks
  installed hooks, managed skills and harness permissions, the pushed branch
  names, and each pushed range's commit trust and binaries, then runs the
  `pushGate` steps in `agent-tool.json`: Biome, ls-lint, Markdown, ShellCheck,
  project skills, Knip, TypeScript, `canon:check`, and `genesis:check`.
  Tests and the gallery build run in CI only. `bun run agent-tool runs list`
  shows each push's step timings, and `bun run agent-tool push-gate check`
  rejects a step that reaches a test runner, install, or build.

Branch names use the same Conventional Commits types and 50-character limit as
commit headers, with `main` exempt. Create one with
`bun run agent-tool branch create <type>/<topic> --base main --remote origin`.

## Protection

`main` is protected by the `protect-main` ruleset: no deletion or force-push,
signed commits, pull requests merged by squash only, and the required check
`CI gate`. The CI workflow's `CI gate` job passes only when every job listed in
`scripts/checks/ci-gate.json` succeeded, so a skipped job cannot satisfy it.
A pull request need not be current with `main` to merge: integrate a moved
`main` only when GitHub reports a conflict or `versions check` fails against
it. CI runs on every push to `main`, so a break two merges cause together shows
up there and is repaired before the next change ships.

## Validation and scripts

`bun run check:fast` runs static checks. `bun run check` also runs tests,
validates canon and image status, re-renders genesis byte for byte, and builds
the gallery. Their sequential plans live in `scripts/testing/`; inspect reports
with `bun run agent-tool runs list` and logs with `bun run agent:logs <path>`.

`scripts/checks/` holds project-owned checks: project skill mirror consistency
and the CI gate's required job names.

## Module layering

Imports point down this list, never up:

1. `src/canon/`: rules, derivations, and types. It takes `World` as an argument
   and never imports the concrete `canon/world.ts`.
2. `src/render/`: deterministic renderers that take explicit inputs.
3. `src/images/` and `src/export/`: image catalog and provenance, and the
   Balebase seed exporter. Seed shapes live in `src/export/seedTypes.ts`.
4. `src/genesis/`: coordinates images, documents, and exporters into
   `genesis/`.
5. `src/site/`: packages the `genesis/` snapshot; it never loads
   `canon/world.ts` or renders anything.
6. CLI entrypoints (`src/cli.ts`, `src/images/cli.ts`) load the world.

Biome enforces the boundaries for non-test files and rejects import cycles,
including type-only ones. Tests may load the concrete world.
