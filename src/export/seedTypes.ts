// The Balebase seed contract: genesis/balebase/seed.json. Balebase's
// screenshot seed reads this file from the pinned package, so a change here is
// a change to that contract. Bump SEED_SCHEMA_VERSION when a field is removed
// or changes meaning; adding a field does not need a bump.

export const SEED_SCHEMA_VERSION = 1;

/** A path under genesis/, such as "avatars/jordan-avery.jpg". */
export type GenesisPath = string;

export interface SeedPerson {
  readonly id: string;
  readonly name: string;
  readonly givenName: string;
  readonly familyName: string;
  readonly email: string;
  readonly phone: string;
  readonly jobTitle: string;
  readonly employer: string;
  /** The Balebase organization role; null for people outside it. */
  readonly role: "admin" | "member" | "owner" | null;
  readonly joinedOn: string | null;
  /** 512 px square JPEG. */
  readonly avatar: GenesisPath;
  /** The full portrait the avatar is cut from. */
  readonly portrait: GenesisPath;
}

export interface SeedGroup {
  readonly id: string;
  readonly name: string;
  readonly builtIn: "finance" | null;
  readonly capabilities: readonly "finance"[];
  readonly members: readonly string[];
}

/** Shaped like the body of Balebase's POST /api/businesses. */
export interface SeedBusiness {
  readonly name: string;
  readonly ein: string;
  readonly streetAddress: string;
  readonly city: string;
  readonly state: string;
  readonly zip: string;
  readonly incorporationDate: string;
}

/** Shaped like POST /api/equipment, with a person ID for the assignee. */
export interface SeedEquipment {
  readonly id: string;
  readonly type: "cell_phone" | "computer" | "monitor";
  readonly make: string;
  readonly model: string;
  readonly serialNumber: string;
  readonly purchaseDate: string;
  readonly assignee: string | null;
  readonly photo: GenesisPath;
}

export interface SeedProject {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly client: string;
  readonly startedOn: string;
  readonly members: readonly string[];
  readonly forms: readonly string[];
}

export interface SeedAudit {
  readonly id: string;
  readonly project: string;
  /** A Balebase global audit form ID. */
  readonly form: string;
  readonly location: string;
  readonly startedBy: string;
  readonly startedOn: string;
  readonly status: "completed" | "in_progress";
  readonly completedOn: string | null;
}

export interface SeedIssue {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly priority: "critical" | "high" | "low" | "medium";
  readonly status: "open" | "resolved";
  readonly createdBy: string;
  readonly assignee: string | null;
  readonly raisedOn: string;
  readonly resolvedOn: string | null;
  /** The audit that raised it; null for workspace issues. */
  readonly audit: string | null;
  readonly photo: GenesisPath | null;
}

export interface SeedAccount {
  readonly id: string;
  /** The bank's name, as Plaid reports the institution. */
  readonly institution: string;
  readonly name: string;
  readonly officialName: string;
  readonly mask: string;
  readonly type: "credit" | "depository";
  readonly subtype: "checking" | "credit card";
  readonly currencyCode: "USD";
  /** Dollars, as Plaid reports balances. */
  readonly currentBalance: number;
}

export interface SeedTransaction {
  readonly id: string;
  readonly account: string;
  readonly date: string;
  /** The statement descriptor. */
  readonly name: string;
  readonly merchantName: string;
  /** Dollars of money out, positive, as Plaid reports them. */
  readonly amount: number;
  readonly currencyCode: "USD";
  /** An expense category ID. */
  readonly category: string;
  readonly note: string;
  readonly reviewed: boolean;
}

export interface SeedSigner {
  readonly person: string;
  readonly name: string;
  readonly email: string;
  readonly routingOrder: number;
  readonly status: "pending" | "sent" | "signed";
}

export interface SeedDocument {
  readonly file: GenesisPath;
  readonly filename: string;
  readonly contentType: "application/pdf";
  readonly size: number;
  readonly sha256: string;
  readonly pageCount: number;
}

export interface SeedContract {
  readonly id: string;
  readonly title: string;
  readonly status: "completed" | "draft" | "sent";
  readonly counterparty: string;
  readonly project: string | null;
  readonly value: number;
  readonly sentOn: string | null;
  readonly dueOn: string | null;
  readonly completedOn: string | null;
  readonly signers: readonly SeedSigner[];
  readonly document: SeedDocument;
}

export interface SeedRequirement {
  readonly id: string;
  readonly person: string;
  readonly kind: "background_check" | "credit_check" | "form";
  readonly title: string;
  readonly requestedBy: string;
  readonly requestedOn: string;
  readonly dueOn: string;
  readonly status: "complete" | "in_progress" | "pending" | "submitted";
  readonly completedOn: string | null;
}

export interface SeedLibraryDocument extends SeedDocument {
  readonly id: string;
  readonly folder: string;
  readonly title: string;
}

export interface BalebaseSeed {
  readonly schemaVersion: typeof SEED_SCHEMA_VERSION;
  readonly asOf: string;
  readonly organization: {
    readonly name: string;
    readonly owner: string;
    readonly emailDomain: string;
  };
  readonly people: readonly SeedPerson[];
  readonly groups: readonly SeedGroup[];
  readonly businesses: readonly SeedBusiness[];
  readonly equipment: readonly SeedEquipment[];
  readonly projects: readonly SeedProject[];
  readonly audits: readonly SeedAudit[];
  readonly issues: readonly SeedIssue[];
  readonly finance: {
    readonly accounts: readonly SeedAccount[];
    readonly categories: readonly {
      readonly id: string;
      readonly name: string;
    }[];
    readonly transactions: readonly SeedTransaction[];
  };
  readonly contracts: readonly SeedContract[];
  readonly requirements: readonly SeedRequirement[];
  readonly library: {
    readonly folders: readonly { readonly id: string; readonly name: string }[];
    readonly documents: readonly SeedLibraryDocument[];
  };
}
