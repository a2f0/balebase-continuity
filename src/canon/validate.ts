import { isIsoDate } from "./dates";
import type { World } from "./types";
import { checkCompany } from "./validation/company";
import { context } from "./validation/context";
import { checkEquipment } from "./validation/equipment";
import { checkFinance } from "./validation/finance";
import { checkIds, checkUniqueNames } from "./validation/identifiers";
import { checkPeople } from "./validation/people";
import { checkRecords } from "./validation/records";
import { checkWork } from "./validation/work";

/**
 * Every continuity problem in the world, as human-readable strings. An empty
 * list means canon agrees with itself: references resolve, dates fall in
 * order and on or before the story date, and contact details stay fictional.
 */
export function validateWorld(world: World): string[] {
  // Every date rule compares against the story date, so check it first.
  if (!isIsoDate(world.asOf)) {
    return [`story date ${world.asOf} is not a calendar date`];
  }
  const ctx = context(world);
  return [
    ...checkIds(world),
    ...checkUniqueNames(world),
    ...checkPeople(ctx),
    ...checkCompany(ctx),
    ...checkEquipment(ctx),
    ...checkWork(ctx),
    ...checkFinance(ctx),
    ...checkRecords(ctx),
  ];
}
