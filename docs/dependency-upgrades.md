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

## Wrangler

Update Wrangler with its exact Miniflare dependency as one compatibility group.
The gallery Worker is `balebase-continuity`; its hostname is managed in
Balebase's Terraform. Preserve `workers_dev`, `preview_urls`, and asset
behavior, and build and dry-run (`wrangler deploy --dry-run`) with the
proposed pinned tool before any authorized upload.
