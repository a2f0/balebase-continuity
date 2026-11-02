---
name: portrait-fidelity
description: Generate, review, import, and frame photorealistic portraits of fictional people for balebase-continuity, then re-render genesis. Use when `bun run images` reports a portrait that is not current, or when a face looks illustrated, airbrushed, or off-canon.
---

# Portrait fidelity

Every person in canon has one portrait in `assets/portraits/`. Balebase shows
it as a profile photo, and genesis cuts each person's 512 px avatar from it.
This skill is the procedure and the review bar; `docs/images.md` documents
the commands. Equipment and site photos follow the `photo-fidelity` skill.

## Ground rules

- Fictional people only. Never import a photo of a real person, and never
  name or use a real person as a reference.
- Canon owns the face. Pass the prompt from `bun run images prompt <id>`
  verbatim. To change a face, edit the person's `appearance.description` in
  `canon/people/` (keep ages out of it; the prompt derives an age band from
  the birth date); to change the direction every portrait shares, edit
  `src/images/prompt.ts`. Either marks portraits stale, so regenerate them in
  the same change.
- Never edit `genesis/` by hand. Commit `assets/portraits/`, any canon or
  prompt change, and the re-rendered `genesis/` together.
- Each portrait adds about 350 KB to history. Replace one only to fix a real
  problem.

## 1. Pick targets

Run `bun run images`. Target the people the user named; otherwise every
portrait that is `missing`, `stale`, `edited`, or `unrecorded`, plus any
`current` portrait that fails the review in step 3.

## 2. Generate

Generate with Codex's built-in `image_gen` tool, at most three runs at a
time. From Codex, call the tool once with the prompt verbatim and take the
file from `$CODEX_HOME/generated_images/`. From any other harness with the
Codex CLI on `PATH`, delegate the call:

```sh
id=jordan-avery
out="$(mktemp -d)"
prompt="$(bun run --silent images prompt "$id")"
codex exec --skip-git-repo-check --sandbox workspace-write \
  -m gpt-6-astra -c model_reasoning_effort='"xhigh"' -C "$out" \
  "Call your built-in image_gen tool once with the prompt below, verbatim. Copy the generated image from \$CODEX_HOME/generated_images into the current directory as $id.png and print its absolute path. Do nothing else.

Prompt:
$prompt" >"$out/codex.log" 2>&1
ls "$out"
```

Each run takes about a minute. `$out/codex.log` explains a missing image. If
the tool is unavailable, say so rather than switching to another route.

Generate only after canon is final: an image made from an older prompt is
`stale` on import and must be made again.

## 3. Review

Look at every candidate at full size. Reject it for any of the following.

Realism:

- It looks illustrated, painted, 3D-rendered, waxy, or airbrushed, with
  uniformly smooth skin or a glossy synthetic sheen.
- It lacks real detail: pores, fine lines fitting the age band, separate
  strands of hair, and a catchlight in each eye.
- It has a generation defect: mismatched eyes, warped ears or teeth, glasses
  whose two sides differ, melted jewelry, a seam in the hairline, or a garbled
  collar.

Canon:

- The apparent age fits the age band in the prompt.
- Skin tone, hair, eyes, facial hair, glasses, jewelry, expression, and
  clothing all match `appearance`.
- No two people look alike.

Badge photo use:

- The person faces the camera with eyes open, the whole head and the tops of
  both shoulders in frame, in even light, against a plain light gray-blue
  backdrop, with no text, logo, watermark, props, or hands.
- The person does not resemble anyone recognizable.

Regenerate a rejected image. If the same problem comes back twice, fix its
cause in canon or the prompt instead of rerolling. After four failed attempts
on one person, stop and report the problem rather than accept a weak face.

## 4. Import

```sh
bun run images import <id> <file> --model codex-gpt-6-astra-xhigh --on <YYYY-MM-DD>
```

Set `--model` to whatever made the image and `--on` to the day it was made.
The import stores a JPEG with its long edge at most 1536 px and records the
prompt and image hashes in `assets/portraits/<id>.json`. It keeps any existing
framing, so re-check it.

## 5. Frame

Set `framing` in the sidecar, as fractions of the image width and height:
`height` runs from the chin to the top of the hair, and `cx` and `cy` are its
center.

```json
"framing": { "cx": 0.5, "cy": 0.38, "height": 0.52 }
```

Run `bun run genesis` and look at `genesis/avatars/<id>.jpg` inside a circle,
the way Balebase shows it: a tight head-and-shoulders crop that cuts off
neither the hair nor the chin. Adjust and re-render until it does.

## 6. Check and report

Run `bun run images` (every target `current`) and `bun run check`. Report each
changed person with the model used, rejected attempts and why, and any canon
or prompt change.
