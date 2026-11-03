# Dependency maintenance

Use the managed `update-dependencies` skill. Run `bun run check` before and
after upgrades: it checks types and tooling, tests behavior, and re-renders
all genesis files byte for byte. Do not regenerate tracked images merely to
make a dependency upgrade pass; a resvg or jpeg-js change that alters avatar
bytes is a real output change and ships with the regenerated `genesis/`.
Verify rendering on Linux and macOS through CI. Run `bun run agents:sync`
after changing agent-tool.

The published package contains genesis data only. Keep run-specific
inventories and validation results in the upgrade PR.

## Markdown tooling

Markdownlint owns Markdown formatting. Biome's Markdown formatter stays
disabled because it would rewrite managed skills.

The current Markdown toolchain has unresolved transitive advisories:

- `markdownlint` pins `re2js` 2.8.6; the
  [lookbehind denial of service](https://github.com/le0pard/re2js/security/advisories/GHSA-gg6h-894w-4m9c)
  is fixed in 2.8.7. Markdownlint compiles its frontmatter expression without
  the opt-in `LOOKBEHINDS` flag. Prefer an owner release carrying the fix;
  an override needs focused frontmatter and rule-result regression coverage.
- `micromark-extension-math` requires KaTeX `^0.16.0`, outside the
  [prototype-pollution gadget fix](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7)
  in 0.18.2. Markdownlint uses math tokenization rather than KaTeX's HTML
  renderer, and the gallery does not render Markdown. Revisit when the math
  extension supports a fixed release; do not force a cross-minor override
  without testing its rendering API.

These packages are development dependencies, not part of the genesis data
export. Keep reporting them in audits until the resolved graph is fixed;
limited reachability is not a clean audit.

## Wrangler

Update Wrangler with its exact Miniflare dependency as one compatibility group.
The gallery Worker is `balebase-continuity`; its hostname is managed in
Balebase's Terraform. Preserve `workers_dev`, `preview_urls`, and asset
behavior. Before adopting the group, use the proposed pinned tool for a dry
run with the production configuration and verify the real account, existing
Worker, hostname, bindings, and resource identities. A
[`wrangler deploy --dry-run`](https://developers.cloudflare.com/workers/wrangler/commands/)
only proves bundling; it cannot establish remote resource safety. If account
access or complete identity evidence is unavailable, leave the entire group
pinned and record the hold in the PR. Never use a temporary account as a
substitute. Preview and any separately authorized upload must use the same
validated `dist/` artifact; this configuration has no custom build command.
CI only checks the project and does not deploy it.

The retained Miniflare pins `undici` 7.29.1. Its unresolved advisory set is
fixed on that release line in
[7.30.1](https://github.com/nodejs/undici/releases/tag/v7.30.1), including
[the TLS-option validation bypass](https://github.com/nodejs/undici/security/advisories/GHSA-2m5v-pch6-74hx).
Do not override its exact dependency independently of the deployment group.
Revisit with a compatible Wrangler/Miniflare release, a complete real-account
preview, and the final audit. The static gallery does not ship this Node
client, but local development and deployment tooling still carries it.
