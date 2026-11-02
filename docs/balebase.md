# Balebase integration

Balebase's screenshot seed (`packages/api/scripts/screenshotSeed.ts`) builds
its workspace from this repository's genesis data, so the people, equipment,
jobs, and books in Balebase screenshots agree with one another and with the
gallery.

## Pinning

Balebase depends on this repository by commit:

```json
"@a2f0/balebase-continuity": "github:a2f0/balebase-continuity#<commit>"
```

The package exports `./genesis/*` only, so a consumer reads, for example,
`@a2f0/balebase-continuity/genesis/balebase/seed.json` and resolves file paths
inside it relative to the package's `genesis/` directory. Pin a commit on
`main`; bump the pin to take a canon change.

## Contract

`genesis/balebase/seed.json` matches `BalebaseSeed` in
`src/export/seedTypes.ts`:

- `schemaVersion`: currently `1`; consumers must reject other versions.
  Removing a field or changing its meaning bumps it; adding a field does not.
- `asOf`: the story date. Every date in the seed is on or before it.
- `organization`: the workspace name, the `owner` person ID who signs in, and
  the email domain every member uses.
- `people`: everyone in canon. `role` is `owner`, `admin`, or `member` for
  people with a Balebase seat and `null` for clients and vendors. `avatar` is a
  512 px square JPEG; `portrait` is the full photo it was cut from.
- `groups`: the built-in Finance group (`builtIn: "finance"`, `finance`
  capability) and other groups, with member person IDs.
- `businesses`: bodies for `POST /api/businesses`. `state` is the fictional
  region code `CS`, and EINs use the never-assigned `00` prefix.
- `equipment`: bodies for `POST /api/equipment`, with `assignee` as a person
  ID and a `photo`.
- `projects`, `audits`, `issues`: projects with member IDs and the global
  audit forms they turn on (`nfpa70e_global`, `us_residential_core_global`);
  audits with their project, form, starter, and completion; issues with
  creator, assignee, status, the audit that raised them, and an optional site
  `photo` for the audit issue image.
- `finance`: bank `accounts` (with `institution`), expense `categories` (names
  match Balebase's one-click defaults plus `Materials`), and `transactions` in
  Plaid's shape: `amount` in dollars, positive for money out, `name` as the
  statement descriptor, `merchantName`, and an expense `category` ID.
- `contracts`: title, status (`draft`, `sent`, or `completed`), value, dates,
  `signers` in routing order with their status, and the unsigned `document`
  PDF with its size, SHA-256, and page count.
- `requirements`: employee forms and checks (`form`, `background_check`) with
  requester, due date, and status.
- `library`: folders and PDF documents.

Every `photo`, `avatar`, `portrait`, and `file` value is a path under
`genesis/`. The build test proves each one exists and that every referenced
person is in `people`, with a seat wherever Balebase needs one.

## IDs

Person, equipment, issue, and other canon IDs are permanent. Balebase keys
its fixtures on them; never rename or reuse one. Change a fact in canon
instead, run `bun run genesis`, and ship both together.
