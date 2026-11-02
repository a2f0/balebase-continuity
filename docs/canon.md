# Canon

`canon/` is the story; `src/canon/` is its schema, derived facts, and
continuity rules. The story date is `asOf` in `canon/world.ts`, and nothing
reads the real clock.

## The world

Harborline Electric is a commercial and residential electrical contractor in
Merrow Bay, in the fictional state of Cascadia (code `CS`, area code 360).
Jordan Avery owns it and signs in to the Balebase workspace. Dana Whitlock
runs the office; Luis Ferreira leads the field crew of Keisha Banks, Tomas
Lindqvist, and the apprentice Ren Takahashi, who joined in September; Amara
Osei estimates and coordinates projects. Grace Whitaker (Riverside Community
Clinic), Owen McAllister (Oakline Property Group), and Hal Brennan (Northgate
Electrical Supply) are the outside contacts.

| File | Contents |
| --- | --- |
| `canon/company.ts` | Region, organization, legal entities, groups, counterparties |
| `canon/people/` | One file per person, with appearance for the portrait |
| `canon/equipment.ts` | Computers, phones, and a monitor, with photo directions |
| `canon/work.ts` | Projects, audits, and issues, with site photo directions |
| `canon/finance.ts` | Bank accounts, expense categories, and transactions |
| `canon/records.ts` | Contracts, employee requirements, and library documents |

## Rules

`bun run canon:check` runs `validateWorld`, and genesis refuses to build
while it reports anything. The rules live in `src/canon/validation/`:

- IDs are kebab-case and unique, and image IDs are unique across people,
  equipment, and issues because they name image files.
- Phones are `(360) 555-0100` to `555-0199`, emails use domains reserved by
  RFC 2606, members use the organization's domain, and EINs start with `00`.
- The region code is not a real state's, and equipment makers are not real
  brands.
- Every reference resolves: members, assignees, project crews, audit forms a
  project has turned on, payees, categories, contract counterparties and
  their contacts.
- Dates agree: nothing happens after `asOf`; audits fall within their
  projects; audit issues fall within their audits; contracts are sent before
  they are completed and signed before their project starts; requirements are
  requested after the person joined.
- Appearance descriptions never mention age; prompts derive an age band.

## Derive, do not store

Display names, ages, purchase dates (from the paying transaction), signer
status, category totals, and document file names are computed in
`src/canon/derive.ts`. Document text that mentions a canon fact reads it
through a function of the world (see the insurance certificate in
`canon/records.ts`).

## Rendering

Genesis is deterministic: resvg renders without fonts (nothing it draws has
text), jpeg-js encodes, and the PDF writer uses Helvetica, embeds nothing,
and writes no dates. CI re-renders `genesis/` on Linux and macOS and fails on
any difference.
