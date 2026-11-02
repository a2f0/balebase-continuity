import type { World } from "../types";

// IDs are permanent keys: Balebase seeds and image file names use them.

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      repeated.add(value);
    }
    seen.add(value);
  }
  return [...repeated];
}

const ids = (items: readonly { readonly id: string }[]) =>
  items.map((item) => item.id);

export function checkIds(world: World): string[] {
  const groups: [string, readonly string[]][] = [
    ["region", ids(world.regions)],
    ["person", ids(world.people)],
    ["business", ids(world.organization.businesses)],
    ["group", ids(world.organization.groups)],
    // People and counterparties share a namespace: issuers and employers
    // name either one.
    [
      "party",
      [
        world.organization.id,
        ...ids(world.people),
        ...ids(world.counterparties),
      ],
    ],
    // Every photograph's file name is the ID it depicts.
    [
      "image",
      [
        ...ids(world.people),
        ...ids(world.equipment),
        ...world.issues.filter((issue) => issue.photo).map((issue) => issue.id),
      ],
    ],
    ["equipment", ids(world.equipment)],
    ["project", ids(world.projects)],
    ["audit", ids(world.audits)],
    ["issue", ids(world.issues)],
    ["account", ids(world.accounts)],
    ["category", ids(world.categories)],
    ["transaction", ids(world.transactions)],
    ["contract", ids(world.contracts)],
    ["requirement", ids(world.requirements)],
    ["folder", ids(world.folders)],
    ["document", ids(world.documents)],
  ];
  return groups.flatMap(([kind, values]) => [
    ...values
      .filter((id) => !ID_PATTERN.test(id))
      .map((id) => `${kind} ID "${id}" is not kebab-case`),
    ...duplicates(values).map(
      (id) => `${kind} ID "${id}" is used more than once`,
    ),
  ]);
}

export function checkUniqueNames(world: World): string[] {
  const groups: [string, readonly string[]][] = [
    ["category", world.categories.map((item) => item.name)],
    ["folder", world.folders.map((item) => item.name)],
    ["project", world.projects.map((item) => item.name)],
    ["group", world.organization.groups.map((item) => item.name)],
    [
      "equipment serial number",
      world.equipment.map((item) => item.serialNumber),
    ],
    [
      "person",
      world.people.map((person) => `${person.givenName} ${person.familyName}`),
    ],
  ];
  return groups.flatMap(([kind, values]) =>
    duplicates(values).map((value) => `${kind} "${value}" is not unique`),
  );
}
