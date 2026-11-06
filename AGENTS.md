# Repository guidance

Resolve the GitHub repository with `gh repo view --json nameWithOwner` and use
its reported identity for GitHub commands. Work on a feature branch, use
conventional commits, and preserve unrelated edits. Do not force-push or add
attribution footers. Do not create GitHub issues without an explicit request.

## Validation

Follow [development guidance](docs/development.md) for pinned setup, hooks,
branch protection, and script layout.

For dependency changes, use the managed `update-dependencies` skill and
[dependency maintenance guide](docs/dependency-upgrades.md).

- `bun run check:fast`: Biome, ls-lint, Markdown, ShellCheck, managed skills
  and harness permissions, project skills, binary placement, Knip, and
  TypeScript.
- `bun run check`: `check:fast`, tests, canon consistency and image status, a
  full re-render proving `genesis/` matches canon byte for byte, then the
  gallery build. The pre-push hook runs it.
- `bun run canon:check`: continuity rules and image status alone.
- `bun run genesis:check`: the re-render alone (under a second).

## Output capture

Run Bun tests through `bun run agent-tool bun test --log [-- args...]`, and
other finite, noisy commands, such as installs, builds, linters, package
scripts, and Git commands that run hooks, through
`bun run agent:run --label <name> -- <command> [args...]`, for example
`bun run agent:run --label genesis -- bun run genesis:check`. Each keeps
complete output in a private log, preserves the exit status, and prints a
compact receipt, with a bounded excerpt of the log on failure. Read more with
`bun run agent:logs <log-path>`, raising `--tail-lines` or `--max-bytes` as
needed, or with a targeted search of the log. A zero exit does not rule out
warnings: inspect required warnings, timings, and artifacts before accepting a
check. Run reviews, version preparation, audits, and run-group checks directly
so their results stay visible, and run interactive tools and servers directly
too. Never narrow a suite or silence warnings to reduce output.

`bun run check` and `bun run check:fast` are run groups: run them directly, not
through `agent:run`. `bun run agent-tool runs list` shows their reports. Run
`bun run site:dev` directly; it starts a server.

## Code organization

- Keep `src/canon/` independent of rendering, images, exports, and the
  concrete `canon/world.ts`. Pass `World` into functions; load the world in
  CLI entrypoints.
- `src/genesis/` coordinates renderers, images, and exporters. Renderers take
  explicit inputs and must not import the genesis builder.
- `src/site/` packages the `genesis/` snapshot. Read facts from it; do not
  load `canon/world.ts` or render there.
- Keep tests beside the behavior they exercise. Use `genesis:check` to prove
  refactors preserve output without regenerating tracked binaries.

## Canon and generated output

- `canon/` is the source of truth. Change facts there, then run
  `bun run genesis` and commit canon and `genesis/` together. Never edit
  `genesis/` by hand; CI re-renders it on Linux and macOS.
- Derive, do not store: names, ages, purchase dates, signer status, totals,
  and file names come from `src/canon/derive.ts`. Document text that mentions
  a canon fact reads it through a function of the world.
- IDs are permanent. Never rename or reuse one; Balebase keys on them.
- Rendering stays deterministic: no system fonts, clocks, or unseeded
  randomness in `src/render/` or `src/genesis/`.
- Use fictional people, companies, and makers; 555-01XX phone numbers;
  domains reserved by RFC 2606; and `00`-prefixed EINs. The region is the
  fictional Cascadia; never model a real jurisdiction or brand.
- Make and replace photographs with the `portrait-fidelity` and
  `photo-fidelity` skills: generate with Codex `image_gen` (model
  `gpt-6-astra`, effort `xhigh`), look at every image, and reject any that
  fails the skill's bar before importing it.
- The Balebase seed contract is `src/export/seedTypes.ts`
  ([Balebase integration](docs/balebase.md)); bump its schema version when a
  field is removed or changes meaning.

## Binary files

Binary files are allowed only where `binaries.allow` in `agent-tool.json`
lists them: vendored fonts, `assets/portraits/`, `assets/photos/`, and
`genesis/`. Images are JPEGs of at most 3 MiB with a long edge of at most
1536 px (the image tests check both). Regenerating images adds to history, so
avoid churning them without a reason.

## State machines

Make implicit state machines explicit when you write or change code: one closed
state type (a discriminated union, enum, or sealed type) carrying each state's
data, typed events, and one pure transition function, with effects run on
entering a state and async work tagged so only the current request can finish.
Follow the `explicit-state-machines` skill for what to convert, what to leave
alone, and how to prove behavior did not change; `agent-tool state-machines`
lists leads. Reviews flag new implicit machines.

This repository has no runtime machines: canon `status` fields and their dates
are static data whose lifecycle rules live only in
`src/canon/validation/records.ts` and `work.ts`. Derive any other status in one
place, as `src/export/balebaseSeed.ts` does for audits and issues and
`imageStatus` in `src/images/sidecar.ts` does for images.

## Agent tooling and shipping

Review, PR, merge, and version helpers come from the exact-pinned
[`@a2f0/agent-tool`](https://github.com/a2f0/agent-tool) dev dependency; run it
with `bun run agent-tool`. Title, required-check, binary, and version policy is
in `agent-tool.json`. The shared `cross-agent-review`, `open-pr`,
`squash-merge`, `ship-pr`, `reset`, and `update-dependencies` skills are
managed copies in `.agents/skills` and `.claude/skills`, tracked by
`.agent-tool-skills.json`. Do not edit them. Project-owned skills
(`portrait-fidelity`, `photo-fidelity`) live byte for byte in both
directories; `bun run lint:skills` fails when the copies differ. After
changing the pin or `permissions.executables`, run `bun run agents:sync` and
commit the lockfile, skills, manifest, and generated harness rules together.
Run classified CLIs through `bun run agent-tool bun x <name> [-- args...]`:
`commitlint` is `local`, and `wrangler` is `release` because it deploys.

Shipping rules on top of the shared skills:

- **Reviewer**: prefer the other agent's CLI (Codex from Claude Code, Claude
  from Codex), then the remaining CLIs, and report any fallback.
- **Base integration**: merge the pinned base OID; never rebase or force-push.
- **Versions**: the root package ships one patch past its version on the merge
  base. Before each review, run
  `bun run agent-tool versions prepare "$BASE_OID"`.
- **Titles**: PR titles and squash subjects follow `commitlint.config.mts`;
  check branch names with `bun run lint:branch-name <name>`.
- **Merge**: `main` requires the strict `CI gate` check, so a PR must be
  current with `main`. Run
  `node_modules/.bin/agent-tool pr merge '' "$REVIEWED_SHA" "$BASE_REF"`
  directly, because `bun run` drops empty arguments. Never use `gh pr merge`.
- **Reset**: after returning to `main`, run `bun run hooks:install` so merged
  hook changes take effect.
- **Deploy**: follow [gallery deployment](docs/deployment.md) after merging a
  change to `genesis/`, `src/site/`, `site/`, `assets/brand/`, the `images`
  section of `agent-tool.json`, or `wrangler.jsonc`. Deploy from reset `main`
  and compare the live index with the built artifact. Report a failed deploy
  separately from the merge.
