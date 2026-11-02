---
name: photo-fidelity
description: Generate, review, and import photorealistic equipment and job-site photos for balebase-continuity, then re-render genesis. Use when `bun run images` reports an equipment or site photo that is not current, or when one shows a real brand, garbled text, or an off-canon subject.
---

# Photo fidelity

Each equipment item in `canon/equipment.ts` has an inventory photo, and each
issue in `canon/work.ts` with a `photo` direction has a job-site photo. Both
live in `assets/photos/`, named by the canon ID they depict, and genesis
copies them into `genesis/photos/` for Balebase's equipment records and issue
attachments. Portraits follow the `portrait-fidelity` skill instead.

## Ground rules

- Canon owns the subject. Pass the prompt from `bun run images prompt <id>`
  verbatim. The prompt combines the item's make, model, and serial number, or
  the issue's photo direction, with fixed direction from
  `src/images/prompt.ts`. To change what is photographed, edit the canon
  `photo` direction; that marks the photo stale.
- No real brands, logos, or trademarks: makers are fictional, and the only
  legible text may be the canon make and serial number. A logo key on a
  keyboard counts.
- No people, faces, or hands.
- Never edit `genesis/` by hand. Commit the photo, its sidecar, any canon
  change, and the re-rendered `genesis/` together.

## 1. Pick targets and generate

Run `bun run images` and target every photo that is not `current`. Generate
with Codex's `image_gen` tool exactly as the `portrait-fidelity` skill shows
(model `gpt-6-astra`, effort `xhigh`, at most three runs at a time).

## 2. Review

Look at every candidate at full size and zoom into every label. Reject it for
any of the following:

- It looks rendered, illustrated, or composited rather than photographed: no
  wear, perfect symmetry, impossible reflections, or plastic textures.
- Any legible text other than the canon make and serial number, a garbled or
  wrong serial, or any real brand, logo, or trademarked symbol.
- The subject does not match canon: wrong device type, color, or setting, or
  an issue photo that does not show the defect its title describes (a
  corroded terminal, missing labels, a receptacle without test buttons).
- An electrical scene that a technician would call implausible.
- People, faces, or hands.

Regenerate a rejected image. If the same defect comes back twice, fix its
cause in the canon `photo` direction rather than rerolling (one laptop kept a
logo key until its subject said "keyboard keys printed with plain letters and
no logo key"). After four failed attempts, stop and report.

## 3. Import, check, and report

```sh
bun run images import <id> <file> --model codex-gpt-6-astra-xhigh --on <YYYY-MM-DD>
bun run genesis
bun run check
```

Photos carry no framing. Report each changed photo with the model used,
rejected attempts and why, and any canon change.
