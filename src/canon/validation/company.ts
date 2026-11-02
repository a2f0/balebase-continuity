import type { Address } from "../types";
import { type Context, pastDate, present } from "./context";

// The organization, its legal entities, groups, and counterparties.

// Real US state, district, territory, and military postal codes. A canon
// region must not collide with any of them.
const REAL_STATE_CODES = new Set(
  (
    "AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS " +
    "MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV " +
    "WI WY DC AS GU MP PR VI UM FM MH PW AA AE AP"
  ).split(" "),
);
// The 00 prefix has never been assigned, so these can never be real EINs.
const FICTIONAL_EIN = /^00-\d{7}$/;
const ZIP = /^\d{5}$/;

function checkAddress(ctx: Context, label: string, address: Address): string[] {
  return present(
    ctx.world.regions.some((region) => region.id === address.region)
      ? undefined
      : `${label} is in unknown region ${address.region}`,
    ZIP.test(address.zip)
      ? undefined
      : `${label} ZIP ${address.zip} is invalid`,
  );
}

function checkRegions(ctx: Context): string[] {
  return ctx.world.regions.flatMap((region) =>
    present(
      /^[A-Z]{2}$/.test(region.code) && !REAL_STATE_CODES.has(region.code)
        ? undefined
        : `region ${region.id} code ${region.code} must be two capitals that no real state uses`,
      /^\d{3}$/.test(region.areaCode)
        ? undefined
        : `region ${region.id} area code ${region.areaCode} is invalid`,
    ),
  );
}

function checkGroups(ctx: Context): string[] {
  const { groups } = ctx.world.organization;
  const builtIn = groups.filter((group) => group.builtIn === "finance");
  return [
    ...groups.flatMap((group) =>
      group.members
        .filter((member) => !ctx.members.has(member))
        .map((member) => `group ${group.id} lists non-member ${member}`),
    ),
    ...present(
      builtIn.length === 1 && builtIn[0]?.capabilities.includes("finance")
        ? undefined
        : "exactly one built-in Finance group must grant the finance capability",
      builtIn[0]?.members.includes(ctx.world.owner)
        ? undefined
        : "the owner belongs to the Finance group",
    ),
  ];
}

export function checkCompany(ctx: Context): string[] {
  const { organization, counterparties } = ctx.world;
  return [
    ...checkRegions(ctx),
    ...checkAddress(ctx, organization.name, organization.address),
    ...present(
      pastDate(
        ctx.world,
        `${organization.name} founded`,
        organization.foundedOn,
      ),
      organization.businesses.length > 0
        ? undefined
        : `${organization.name} has no business entity`,
    ),
    ...organization.businesses.flatMap((business) => [
      ...checkAddress(ctx, business.name, business.address),
      ...present(
        FICTIONAL_EIN.test(business.ein)
          ? undefined
          : `${business.name} EIN ${business.ein} must be 00-NNNNNNN`,
        pastDate(
          ctx.world,
          `${business.name} incorporated`,
          business.incorporatedOn,
        ),
      ),
    ]),
    ...checkGroups(ctx),
    ...counterparties.flatMap((party) => [
      ...checkAddress(ctx, party.name, party.address),
      ...present(
        party.contact === undefined ||
          ctx.world.people.some(
            (person) =>
              person.id === party.contact && person.employer === party.id,
          )
          ? undefined
          : `${party.id} contact ${party.contact} must be a person it employs`,
      ),
    ]),
  ];
}
