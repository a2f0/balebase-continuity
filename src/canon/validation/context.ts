import { compareDates, isIsoDate } from "../dates";
import type { IsoDate, World } from "../types";

// Lookups the continuity rules share. Every rule returns problem strings
// rather than throwing, so one run reports everything that is wrong.

export interface Context {
  readonly world: World;
  readonly people: ReadonlySet<string>;
  readonly members: ReadonlySet<string>;
  readonly counterparties: ReadonlySet<string>;
}

export function context(world: World): Context {
  return {
    world,
    people: new Set(world.people.map((person) => person.id)),
    members: new Set(
      world.people
        .filter((person) => person.membership)
        .map((person) => person.id),
    ),
    counterparties: new Set(world.counterparties.map((item) => item.id)),
  };
}

/** A problem unless `date` is a real date no later than the story date. */
export function pastDate(
  world: World,
  label: string,
  date: IsoDate,
): string | undefined {
  if (!isIsoDate(date)) {
    return `${label} ${date} is not a calendar date`;
  }
  return compareDates(date, world.asOf) > 0
    ? `${label} ${date} is after the story date ${world.asOf}`
    : undefined;
}

/** A problem unless `date` is a real calendar date. */
export function calendarDate(label: string, date: IsoDate): string | undefined {
  return isIsoDate(date)
    ? undefined
    : `${label} ${date} is not a calendar date`;
}

/** A problem unless `earlier` is on or before `later`. */
export function inOrder(
  label: string,
  earlier: IsoDate,
  later: IsoDate,
): string | undefined {
  return isIsoDate(earlier) && isIsoDate(later) && earlier > later
    ? `${label}: ${earlier} is after ${later}`
    : undefined;
}

export function present(
  ...problems: readonly (string | undefined)[]
): string[] {
  return problems.filter((problem): problem is string => !!problem);
}
