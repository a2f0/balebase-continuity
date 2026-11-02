# balebase-continuity

This repo is available on the web at <https://continuity.balebase.com>.

One fictional company, Harborline Electric, and everything about it that
Balebase screenshots and demos show: its people and their portraits, its
equipment, jobs, audits and issues, bank feed, contracts, employee requests,
and library documents. Everything is derived from one hand-maintained canon,
so a person's name, face, role, and records agree everywhere they appear, and
the canon checks itself: references resolve, dates fall in order, and the
generated files match the canon byte for byte.

Balebase keeps binary files out of its repository. This repository holds them
instead, alongside the source that produces them, and Balebase consumes the
result as a pinned dependency.

## Quick start

Install [mise](https://mise.jdx.dev/), then:

```sh
mise install                # Bun and ShellCheck, pinned in .mise.toml
bun install --frozen-lockfile
bun run hooks:install

bun run canon:check         # validate the canon and image status
bun run genesis             # render canon into genesis/
bun run check               # everything CI runs
bun run site:dev            # preview the gallery at http://localhost:8787
```

## Layout

| Path | Contents |
| --- | --- |
| `canon/` | The story: the company, people, equipment, jobs, books, and records |
| `src/canon/` | Canon schema, derived facts, and continuity rules |
| `src/render/` | Deterministic avatar, JPEG, and PDF renderers |
| `src/images/` | Image prompts, provenance, status, and import |
| `src/export/` | The Balebase seed and its contract types |
| `src/genesis/` | Builds `genesis/` and compares it with what is on disk |
| `src/site/`, `site/` | Static gallery builder, stylesheet, headers, robots.txt |
| `assets/portraits/`, `assets/photos/` | Reviewed photographs, with provenance |
| `assets/brand/` | The logo SVG the gallery's favicons are rendered from |
| `assets/fonts/` | Vendored OFL fonts for the gallery |
| `genesis/` | Generated output; never edit it by hand |

## Generated output

| Path | Use |
| --- | --- |
| `genesis/balebase/seed.json` | The Balebase seed: people, groups, businesses, equipment, jobs, finance, records |
| `genesis/avatars/<person>.jpg` | 512 px square profile photos |
| `genesis/portraits/<person>.jpg` | Full portraits |
| `genesis/photos/<id>.jpg` | Equipment and job-site photos |
| `genesis/contracts/<id>.pdf` | Unsigned contract documents |
| `genesis/library/<id>.pdf` | Company library documents |
| `genesis/canon.json` | The canon with derived facts resolved, and image provenance |
| `genesis/manifest.json` | Size and SHA-256 of every generated file |

## Fiction

Harborline Electric works out of Merrow Bay, in Cascadia, a state that does
not exist. Its makers, vendors, bank, and clients are invented. Phone numbers
use 555-0100 through 555-0199, email addresses use domains reserved by
RFC 2606, and EINs use the never-assigned `00` prefix; the canon rejects
anything else. Every face is a generated photograph of a person who does not
exist.

## Further reading

- [Canon](docs/canon.md): the world, its rules, and how to change it.
- [Images](docs/images.md): generating, reviewing, and importing photographs.
- [Balebase integration](docs/balebase.md): pinning and the seed contract.
- [Gallery deployment](docs/deployment.md): publishing and live checks.
- [Development tooling](docs/development.md): hooks, protection, validation.
- [Dependency maintenance](docs/dependency-upgrades.md).
