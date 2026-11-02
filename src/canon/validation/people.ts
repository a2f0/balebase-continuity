import { ageOn, isIsoDate } from "../dates";
import type { Person } from "../types";
import { type Context, inOrder, pastDate, present } from "./context";

// People: contact details reserved for fiction, membership that agrees with
// the organization's history, and descriptions that leave ages to canon.

// RFC 2606 reserves example.com, example.net, and example.org, and every
// subdomain of them.
const RESERVED_EMAIL =
  /^[a-z0-9._-]+@(?:[a-z0-9-]+\.)*example\.(?:com|net|org)$/;
const MINIMUM_WORKING_AGE = 18;
const AGE_WORDS = /\b(?:\d+|years?|aged?|old|young|teen\w*|elderly)\b/i;

function phonePattern(areaCode: string): RegExp {
  return new RegExp(`^\\(${areaCode}\\) 555-01\\d\\d$`);
}

function checkContact(ctx: Context, person: Person): string[] {
  const areaCodes = ctx.world.regions.map((region) => region.areaCode);
  return present(
    areaCodes.some((code) => phonePattern(code).test(person.phone))
      ? undefined
      : `${person.id} phone ${person.phone} must be (area code) 555-0100 to 555-0199 in a canon region`,
    RESERVED_EMAIL.test(person.email)
      ? undefined
      : `${person.id} email ${person.email} must use a domain reserved by RFC 2606`,
  );
}

function checkMembership(ctx: Context, person: Person): string[] {
  const { organization } = ctx.world;
  const { membership } = person;
  if (!membership) {
    return person.employer === organization.id
      ? [`${person.id} works for ${organization.name} but has no membership`]
      : [];
  }
  return present(
    person.employer === organization.id
      ? undefined
      : `${person.id} has a membership but works for ${person.employer}`,
    person.email.endsWith(`@${organization.emailDomain}`)
      ? undefined
      : `${person.id} email must use the organization domain ${organization.emailDomain}`,
    pastDate(ctx.world, `${person.id} joined`, membership.joinedOn),
    inOrder(
      `${person.id} joined before ${organization.name} was founded`,
      organization.foundedOn,
      membership.joinedOn,
    ),
    isIsoDate(person.birthDate) &&
      isIsoDate(membership.joinedOn) &&
      ageOn(person.birthDate, membership.joinedOn) < MINIMUM_WORKING_AGE
      ? `${person.id} joined before turning ${MINIMUM_WORKING_AGE}`
      : undefined,
  );
}

function checkPerson(ctx: Context, person: Person): string[] {
  const employers = new Set([ctx.world.organization.id, ...ctx.counterparties]);
  return [
    ...present(
      pastDate(ctx.world, `${person.id} birth date`, person.birthDate),
      employers.has(person.employer)
        ? undefined
        : `${person.id} works for unknown ${person.employer}`,
      AGE_WORDS.test(person.appearance.description)
        ? `${person.id} appearance mentions age; the prompt derives it from the birth date`
        : undefined,
    ),
    ...checkContact(ctx, person),
    ...checkMembership(ctx, person),
  ];
}

export function checkPeople(ctx: Context): string[] {
  const { world } = ctx;
  const owners = world.people.filter(
    (person) => person.membership?.role === "owner",
  );
  return [
    ...world.people.flatMap((person) => checkPerson(ctx, person)),
    ...present(
      owners.length === 1 && owners[0]?.id === world.owner
        ? undefined
        : `the organization must have exactly one owner, ${world.owner}`,
      owners[0]?.membership?.joinedOn === world.organization.foundedOn
        ? undefined
        : "the owner joins on the day the organization was founded",
    ),
  ];
}
