import {
  ageAsOf,
  categoryTotals,
  displayName,
  employerName,
} from "../canon/derive";
import type { Address, World } from "../canon/types";
import { imageSpecs } from "../images/catalog";
import { readSidecar } from "../images/sidecar";

// genesis/canon.json: the canon with derived facts resolved, plus image
// provenance, for the gallery and for anyone reading the package without
// running TypeScript.

export interface CanonSnapshot {
  readonly asOf: string;
  readonly organization: {
    readonly name: string;
    readonly tagline: string;
    readonly foundedOn: string;
    readonly address: string;
    readonly phone: string;
  };
  readonly people: readonly {
    readonly id: string;
    readonly name: string;
    readonly age: number;
    readonly jobTitle: string;
    readonly employer: string;
    readonly appearance: string;
  }[];
  readonly counterparties: readonly {
    readonly id: string;
    readonly name: string;
    readonly kind: string;
    readonly address: string;
  }[];
  readonly categoryTotals: readonly {
    readonly category: string;
    readonly total: number;
  }[];
  readonly images: readonly {
    readonly id: string;
    readonly kind: string;
    readonly model: string;
    readonly generatedOn: string;
  }[];
}

function formatAddress(world: World, address: Address): string {
  const code =
    world.regions.find((region) => region.id === address.region)?.code ?? "";
  return `${address.street}, ${address.city}, ${code} ${address.zip}`;
}

export function canonSnapshot(world: World): CanonSnapshot {
  const { organization } = world;
  return {
    asOf: world.asOf,
    organization: {
      name: organization.name,
      tagline: organization.tagline,
      foundedOn: organization.foundedOn,
      address: formatAddress(world, organization.address),
      phone: organization.phone,
    },
    people: world.people.map((person) => ({
      id: person.id,
      name: displayName(person),
      age: ageAsOf(world, person),
      jobTitle: person.jobTitle,
      employer: employerName(world, person),
      appearance: person.appearance.description,
    })),
    counterparties: world.counterparties.map((party) => ({
      id: party.id,
      name: party.name,
      kind: party.kind,
      address: formatAddress(world, party.address),
    })),
    categoryTotals: categoryTotals(world).map((item) => ({
      category:
        world.categories.find((category) => category.id === item.category)
          ?.name ?? item.category,
      total: item.cents / 100,
    })),
    images: imageSpecs(world).map((spec) => {
      const sidecar = readSidecar(spec);
      return {
        id: spec.id,
        kind: spec.kind,
        model: sidecar?.model ?? "",
        generatedOn: sidecar?.generatedOn ?? "",
      };
    }),
  };
}
