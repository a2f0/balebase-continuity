import { describe, expect, test } from "bun:test";
import { world } from "../../canon/world";
import type { World } from "./types";
import { validateWorld } from "./validate";

// Each case breaks one fact and expects the rule that guards it to say so.
// The "accepts the canon" control proves the rest of the world is valid, so a
// reported problem comes from the change alone.

type Change = (world: World) => World;

function replace<T extends { readonly id: string }>(
  items: readonly T[],
  id: string,
  change: (item: T) => T,
): readonly T[] {
  return items.map((item) => (item.id === id ? change(item) : item));
}

const person =
  (
    id: string,
    change: (p: World["people"][number]) => World["people"][number],
  ): Change =>
  (w) => ({ ...w, people: replace(w.people, id, change) });

const cases: readonly [string, Change, string][] = [
  [
    "a phone number outside 555-0100 to 555-0199",
    person("dana-whitlock", (p) => ({ ...p, phone: "(360) 555-2368" })),
    "dana-whitlock phone (360) 555-2368 must be (area code) 555-0100 to 555-0199 in a canon region",
  ],
  [
    "an email at an unreserved domain",
    person("hal-brennan", (p) => ({ ...p, email: "hal@northgate.com" })),
    "hal-brennan email hal@northgate.com must use a domain reserved by RFC 2606",
  ],
  [
    "an age in an appearance description",
    person("ren-takahashi", (p) => ({
      ...p,
      appearance: { ...p.appearance, description: "a young man" },
    })),
    "ren-takahashi appearance mentions age; the prompt derives it from the birth date",
  ],
  [
    "an invalid birth date, without throwing",
    person("keisha-banks", (p) => ({ ...p, birthDate: "1993-02-30" })),
    "keisha-banks birth date 1993-02-30 is not a calendar date",
  ],
  [
    "a member who joined before turning 18",
    person("ren-takahashi", (p) => ({ ...p, birthDate: "2010-01-01" })),
    "ren-takahashi joined before turning 18",
  ],
  [
    "a real state code",
    (w) => ({
      ...w,
      regions: w.regions.map((region) => ({ ...region, code: "WA" })),
    }),
    "region cascadia code WA must be two capitals that no real state uses",
  ],
  [
    "a real equipment brand",
    (w) => ({
      ...w,
      equipment: replace(w.equipment, "office-monitor", (item) => ({
        ...item,
        make: "Dell",
      })),
    }),
    "office-monitor make Dell is a real brand",
  ],
  [
    "equipment assigned to someone without a seat",
    (w) => ({
      ...w,
      equipment: replace(w.equipment, "office-monitor", (item) => ({
        ...item,
        assignee: "grace-whitaker",
      })),
    }),
    "office-monitor is assigned to non-member grace-whitaker",
  ],
  [
    "an audit issue assigned off the project crew",
    (w) => ({
      ...w,
      issues: replace(w.issues, "unit-14-gfci", (issue) => ({
        ...issue,
        assignee: "keisha-banks",
      })),
    }),
    "issue unit-14-gfci is assigned to keisha-banks, who is not on oak-street-apartments",
  ],
  [
    "an issue raised after its audit completed",
    (w) => ({
      ...w,
      issues: replace(w.issues, "unit-14-gfci", (issue) => ({
        ...issue,
        raisedOn: "2026-10-02",
      })),
    }),
    "issue unit-14-gfci was raised after its audit completed: 2026-10-02 is after 2026-09-30",
  ],
  [
    "a transaction after the story date",
    (w) => ({
      ...w,
      transactions: replace(w.transactions, "brightline-2026-10-12", (txn) => ({
        ...txn,
        date: "2026-10-16",
      })),
    }),
    "transaction brightline-2026-10-12 2026-10-16 is after the story date 2026-10-15",
  ],
  [
    "a contract signed by someone other than the client's contact",
    (w) => ({
      ...w,
      contracts: replace(
        w.contracts,
        "oak-street-inspection-agreement",
        (c) => ({
          ...c,
          signers: ["jordan-avery", "grace-whitaker"],
        }),
      ),
    }),
    "contract oak-street-inspection-agreement signers after the owner must be the counterparty's contact",
  ],
  [
    "work starting before its contract was signed",
    (w) => ({
      ...w,
      projects: replace(w.projects, "riverside-clinic-retrofit", (p) => ({
        ...p,
        startedOn: "2026-08-14",
      })),
    }),
    "contract riverside-retrofit-agreement: work on riverside-clinic-retrofit started before it was signed: 2026-08-17 is after 2026-08-14",
  ],
  [
    "a complete requirement without a completion date",
    (w) => ({
      ...w,
      requirements: replace(
        w.requirements,
        "ren-withholding-form",
        ({ completedOn: _, ...rest }) => rest,
      ),
    }),
    "requirement ren-withholding-form has a completion date exactly when it is complete",
  ],
  [
    "a reused ID",
    (w) => ({
      ...w,
      equipment: replace(w.equipment, "office-monitor", (item) => ({
        ...item,
        id: "ren-takahashi",
      })),
    }),
    'image ID "ren-takahashi" is used more than once',
  ],
];

describe("validateWorld", () => {
  test("accepts the canon", () => {
    expect(validateWorld(world)).toEqual([]);
  });

  test.each(cases)("reports %s", (_, change, problem) => {
    expect(validateWorld(change(world))).toContain(problem);
  });
});
