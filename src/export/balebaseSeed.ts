import { createHash } from "node:crypto";
import {
  contractFile,
  displayName,
  employerName,
  findCounterparty,
  findPerson,
  libraryFile,
  purchaseDate,
  signerStatuses,
} from "../canon/derive";
import type { Address, World } from "../canon/types";
import { pdfPageCount } from "../render/pdf";
import {
  type BalebaseSeed,
  type GenesisPath,
  SEED_SCHEMA_VERSION,
  type SeedDocument,
} from "./seedTypes";

// Canon, flattened into the shapes Balebase's routes accept. People are
// referenced by their permanent IDs; files by their path under genesis/.

export const PATHS = {
  avatar: (id: string) => `avatars/${id}.jpg`,
  portrait: (id: string) => `portraits/${id}.jpg`,
  photo: (id: string) => `photos/${id}.jpg`,
} as const;

function dollars(cents: number): number {
  return cents / 100;
}

function regionCode(world: World, address: Address): string {
  const region = world.regions.find((item) => item.id === address.region);
  if (!region) {
    throw new Error(`Unknown region ${address.region}`);
  }
  return region.code;
}

function document(
  files: ReadonlyMap<GenesisPath, Uint8Array>,
  file: GenesisPath,
): SeedDocument {
  const bytes = files.get(file);
  if (!bytes) {
    throw new Error(
      `The seed references ${file}, which genesis did not render`,
    );
  }
  return {
    file,
    filename: file.slice(file.lastIndexOf("/") + 1),
    contentType: "application/pdf",
    size: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    pageCount: pdfPageCount(bytes),
  };
}

function people(world: World): BalebaseSeed["people"] {
  return world.people.map((person) => ({
    id: person.id,
    name: displayName(person),
    givenName: person.givenName,
    familyName: person.familyName,
    email: person.email,
    phone: person.phone,
    jobTitle: person.jobTitle,
    employer: employerName(world, person),
    role: person.membership?.role ?? null,
    joinedOn: person.membership?.joinedOn ?? null,
    avatar: PATHS.avatar(person.id),
    portrait: PATHS.portrait(person.id),
  }));
}

function work(
  world: World,
): Pick<BalebaseSeed, "audits" | "equipment" | "issues" | "projects"> {
  return {
    equipment: world.equipment.map((item) => ({
      id: item.id,
      type: item.type,
      make: item.make,
      model: item.model,
      serialNumber: item.serialNumber,
      purchaseDate: purchaseDate(world, item),
      assignee: item.assignee,
      photo: PATHS.photo(item.id),
    })),
    projects: world.projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      client: findCounterparty(world, project.client).name,
      startedOn: project.startedOn,
      members: project.members,
      forms: project.forms,
    })),
    audits: world.audits.map((audit) => ({
      id: audit.id,
      project: audit.project,
      form: audit.form,
      location: audit.location,
      startedBy: audit.startedBy,
      startedOn: audit.startedOn,
      status: audit.completedOn ? "completed" : "in_progress",
      completedOn: audit.completedOn ?? null,
    })),
    issues: world.issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
      status: issue.resolvedOn ? "resolved" : "open",
      createdBy: issue.raisedBy,
      assignee: issue.assignee,
      raisedOn: issue.raisedOn,
      resolvedOn: issue.resolvedOn ?? null,
      audit: issue.audit ?? null,
      photo: issue.photo ? PATHS.photo(issue.id) : null,
    })),
  };
}

function finance(world: World): BalebaseSeed["finance"] {
  return {
    accounts: world.accounts.map((account) => ({
      id: account.id,
      institution: findCounterparty(world, account.bank).name,
      name: account.name,
      officialName: account.officialName,
      mask: account.mask,
      type: account.type,
      subtype: account.subtype,
      currencyCode: "USD",
      currentBalance: dollars(account.currentBalanceCents),
    })),
    categories: world.categories.map(({ id, name }) => ({ id, name })),
    transactions: world.transactions.map((txn) => ({
      id: txn.id,
      account: txn.account,
      date: txn.date,
      name: txn.descriptor,
      merchantName: findCounterparty(world, txn.payee).name,
      amount: dollars(txn.amountCents),
      currencyCode: "USD",
      category: txn.category,
      note: txn.note ?? "",
      reviewed: txn.reviewed,
    })),
  };
}

function records(
  world: World,
  files: ReadonlyMap<GenesisPath, Uint8Array>,
): Pick<BalebaseSeed, "contracts" | "library" | "requirements"> {
  return {
    contracts: world.contracts.map((contract) => ({
      id: contract.id,
      title: contract.title,
      status: contract.status,
      counterparty: findCounterparty(world, contract.counterparty).name,
      project: contract.project ?? null,
      value: dollars(contract.valueCents),
      sentOn: contract.sentOn ?? null,
      dueOn: contract.dueOn ?? null,
      completedOn: contract.completedOn ?? null,
      signers: signerStatuses(world, contract).map((signer, index) => {
        const person = findPerson(world, signer.person);
        return {
          person: person.id,
          name: displayName(person),
          email: person.email,
          routingOrder: index + 1,
          status: signer.status,
        };
      }),
      document: document(files, contractFile(contract)),
    })),
    requirements: world.requirements.map((item) => ({
      id: item.id,
      person: item.person,
      kind: item.kind,
      title: item.title,
      requestedBy: item.requestedBy,
      requestedOn: item.requestedOn,
      dueOn: item.dueOn,
      status: item.status,
      completedOn: item.completedOn ?? null,
    })),
    library: {
      folders: world.folders.map(({ id, name }) => ({ id, name })),
      documents: world.documents.map((item) => ({
        id: item.id,
        folder: item.folder,
        title: item.title,
        ...document(files, libraryFile(item)),
      })),
    },
  };
}

export function buildBalebaseSeed(
  world: World,
  files: ReadonlyMap<GenesisPath, Uint8Array>,
): BalebaseSeed {
  const { organization } = world;
  return {
    schemaVersion: SEED_SCHEMA_VERSION,
    asOf: world.asOf,
    organization: {
      name: organization.name,
      owner: world.owner,
      emailDomain: organization.emailDomain,
    },
    people: people(world),
    groups: organization.groups.map((group) => ({
      id: group.id,
      name: group.name,
      builtIn: group.builtIn ?? null,
      capabilities: group.capabilities,
      members: group.members,
    })),
    businesses: organization.businesses.map((business) => ({
      name: business.name,
      ein: business.ein,
      streetAddress: business.address.street,
      city: business.address.city,
      state: regionCode(world, business.address),
      zip: business.address.zip,
      incorporationDate: business.incorporatedOn,
    })),
    ...work(world),
    finance: finance(world),
    ...records(world, files),
  };
}
