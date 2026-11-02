import { ageOn } from "./dates";
import type {
  Contract,
  Counterparty,
  EquipmentItem,
  Person,
  Transaction,
  World,
} from "./types";

// Facts computed from canon rather than stored in it, so they can never
// disagree with the facts they come from.

function find<T extends { readonly id: string }>(
  items: readonly T[],
  id: string,
  kind: string,
): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`Unknown ${kind} ${id}`);
  }
  return item;
}

export function findPerson(world: World, id: string): Person {
  return find(world.people, id, "person");
}

export function findCounterparty(world: World, id: string): Counterparty {
  return find(world.counterparties, id, "counterparty");
}

function findTransaction(world: World, id: string): Transaction {
  return find(world.transactions, id, "transaction");
}

export function displayName(person: Person): string {
  return `${person.givenName} ${person.familyName}`;
}

export function ageAsOf(world: World, person: Person): number {
  return ageOn(person.birthDate, world.asOf);
}

/** The person's employer's display name. */
export function employerName(world: World, person: Person): string {
  return person.employer === world.organization.id
    ? world.organization.name
    : findCounterparty(world, person.employer).name;
}

/** The name a document's issuer goes by: a person or a counterparty. */
export function partyName(world: World, id: string): string {
  const person = world.people.find((candidate) => candidate.id === id);
  return person ? displayName(person) : findCounterparty(world, id).name;
}

export function purchaseDate(world: World, item: EquipmentItem): string {
  return findTransaction(world, item.purchase).date;
}

/** The legal entity that signs contracts: the organization's first business. */
export function contractingEntity(world: World): string {
  const [first] = world.organization.businesses;
  if (!first) {
    throw new Error("The organization has no business to contract under");
  }
  return first.name;
}

export type SignerStatus = "pending" | "sent" | "signed";

/**
 * Each signer's state: everyone has signed a completed contract; a sent one
 * is signed by the company and waiting on the rest; nobody signs a draft.
 */
export function signerStatuses(
  world: World,
  contract: Contract,
): readonly { readonly person: string; readonly status: SignerStatus }[] {
  return contract.signers.map((person) => {
    if (contract.status === "completed") {
      return { person, status: "signed" };
    }
    if (contract.status === "sent") {
      return { person, status: person === world.owner ? "signed" : "sent" };
    }
    return { person, status: "pending" };
  });
}

/** "$1,234.56" from cents. */
export function formatMoney(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const dollars = String(Math.floor(absolute / 100)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );
  return `${sign}$${dollars}.${String(absolute % 100).padStart(2, "0")}`;
}

export function categoryTotals(
  world: World,
): readonly { readonly category: string; readonly cents: number }[] {
  return world.categories.map((category) => ({
    category: category.id,
    cents: world.transactions
      .filter((transaction) => transaction.category === category.id)
      .reduce((sum, transaction) => sum + transaction.amountCents, 0),
  }));
}

export function contractFile(contract: Contract): string {
  return `contracts/${contract.id}.pdf`;
}

export function libraryFile(document: { readonly id: string }): string {
  return `library/${document.id}.pdf`;
}
