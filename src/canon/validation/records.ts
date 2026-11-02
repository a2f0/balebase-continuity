import type { Contract, Requirement } from "../types";
import {
  type Context,
  calendarDate,
  inOrder,
  pastDate,
  present,
} from "./context";

// Contracts, employee requirements, and library documents.

/** Which dates a contract must and must not carry in each status. */
function checkContractDates(ctx: Context, contract: Contract): string[] {
  const { world } = ctx;
  const label = `contract ${contract.id}`;
  const { completedOn, dueOn, sentOn, status } = contract;
  if (status === "draft") {
    return present(
      sentOn || dueOn || completedOn
        ? `${label} is a draft but has signing dates`
        : undefined,
    );
  }
  if (!sentOn || !dueOn) {
    return [`${label} was ${status} without sent and due dates`];
  }
  return present(
    calendarDate(`${label} due`, dueOn),
    pastDate(world, `${label} sent`, sentOn),
    inOrder(`${label} is due before it was sent`, sentOn, dueOn),
    status === "completed" && !completedOn
      ? `${label} is completed without a completion date`
      : undefined,
    status === "sent" && completedOn
      ? `${label} is still out for signature but has a completion date`
      : undefined,
    completedOn
      ? inOrder(`${label} completed before it was sent`, sentOn, completedOn)
      : undefined,
    completedOn
      ? pastDate(world, `${label} completed`, completedOn)
      : undefined,
  );
}

function checkContract(ctx: Context, contract: Contract): string[] {
  const { world } = ctx;
  const label = `contract ${contract.id}`;
  const party = world.counterparties.find(
    (item) => item.id === contract.counterparty,
  );
  const project = world.projects.find((item) => item.id === contract.project);
  return [
    ...present(
      party ? undefined : `${label} counterparty does not exist`,
      contract.signers[0] === world.owner
        ? undefined
        : `${label} must be signed first by the owner`,
      contract.signers.slice(1).every((signer) => signer === party?.contact)
        ? undefined
        : `${label} signers after the owner must be the counterparty's contact`,
      contract.status === "draft" ||
        contract.signers.includes(party?.contact ?? "")
        ? undefined
        : `${label} was sent without the counterparty's contact as a signer`,
      contract.project === undefined ||
        project?.client === contract.counterparty
        ? undefined
        : `${label} project ${contract.project} belongs to another client`,
      Number.isInteger(contract.valueCents) && contract.valueCents > 0
        ? undefined
        : `${label} value must be positive whole cents`,
      contract.status === "completed" && project && contract.completedOn
        ? inOrder(
            `${label}: work on ${project.id} started before it was signed`,
            contract.completedOn,
            project.startedOn,
          )
        : undefined,
    ),
    ...checkContractDates(ctx, contract),
  ];
}

function checkRequirement(ctx: Context, item: Requirement): string[] {
  const { world } = ctx;
  const label = `requirement ${item.id}`;
  const person = world.people.find((candidate) => candidate.id === item.person);
  const requester = world.people.find(
    (candidate) => candidate.id === item.requestedBy,
  );
  return present(
    person?.membership
      ? undefined
      : `${label} is for non-member ${item.person}`,
    requester?.membership?.role === "owner" ||
      requester?.membership?.role === "admin"
      ? undefined
      : `${label} must be requested by an owner or admin`,
    person?.membership
      ? inOrder(
          `${label} was requested before ${item.person} joined`,
          person.membership.joinedOn,
          item.requestedOn,
        )
      : undefined,
    pastDate(world, `${label} requested`, item.requestedOn),
    calendarDate(`${label} due`, item.dueOn),
    inOrder(
      `${label} is due before it was requested`,
      item.requestedOn,
      item.dueOn,
    ),
    (item.status === "complete") === (item.completedOn !== undefined)
      ? undefined
      : `${label} has a completion date exactly when it is complete`,
    item.completedOn
      ? inOrder(
          `${label} completed before it was requested`,
          item.requestedOn,
          item.completedOn,
        )
      : undefined,
    item.completedOn
      ? pastDate(world, `${label} completed`, item.completedOn)
      : undefined,
  );
}

export function checkRecords(ctx: Context): string[] {
  const { world } = ctx;
  const parties = new Set([...ctx.people, ...ctx.counterparties]);
  return [
    ...world.contracts.flatMap((contract) => checkContract(ctx, contract)),
    ...world.requirements.flatMap((item) => checkRequirement(ctx, item)),
    ...world.documents.flatMap((document) =>
      present(
        world.folders.some((folder) => folder.id === document.folder)
          ? undefined
          : `document ${document.id} folder ${document.folder} does not exist`,
        parties.has(document.issuer)
          ? undefined
          : `document ${document.id} issuer ${document.issuer} does not exist`,
        pastDate(world, `document ${document.id} issued`, document.issuedOn),
      ),
    ),
  ];
}
