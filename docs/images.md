# Images

Every photograph is generated once from a canon-derived prompt, reviewed by a
person or agent against canon, and committed with a sidecar recording how it
was made. Genesis never calls an image service.

| Kind | Source | Files |
| --- | --- | --- |
| Portrait | `appearance` in `canon/people/` | `assets/portraits/<person>.jpg` |
| Equipment | `make`, `serialNumber`, and `photo` in `canon/equipment.ts` | `assets/photos/<item>.jpg` |
| Site | `photo` on an issue in `canon/work.ts` | `assets/photos/<issue>.jpg` |

## Status

`bun run images` prints each image's status: `current`, `missing`, `stale`
(canon's prompt changed since it was made), `edited` (the file no longer
matches its recorded hash), or `unrecorded` (no sidecar). `canon:check`,
genesis, and the test suite all require every image to be `current`.

## Generating and importing

The `portrait-fidelity` and `photo-fidelity` skills, in `.agents/skills` for
Codex and `.claude/skills` for Claude Code, are the procedures: generate with
Codex's `image_gen` tool from `bun run images prompt <id>`, review against
their bars, then import:

```sh
bun run images prompt keisha-phone
bun run images import keisha-phone ~/Downloads/keisha-phone.png \
  --model codex-gpt-6-astra-xhigh --on 2026-11-02
bun run genesis
```

The import stores a JPEG with its long edge at most 1536 px, and writes
`<id>.json` beside it with the model, prompt, prompt and image hashes, and the
date. Portrait sidecars also carry hand-set `framing` (the head's center and
chin-to-crown height, as fractions of the image), which genesis uses to cut
avatars.

Images are binary history. Binaries are allowed only under
`assets/portraits/`, `assets/photos/`, `assets/fonts/`, and `genesis/`
(`binaries.allow` in `agent-tool.json`), and the image tests keep each one a
JPEG of at most 3 MiB.
