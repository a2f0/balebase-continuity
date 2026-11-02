// The canon schema. Canon stores facts once; anything that can be computed
// from them (ages, display names, totals, signer lists, file names) is derived
// in src/canon/derive.ts instead of stored.

/** A calendar date, YYYY-MM-DD, with no time zone. */
export type IsoDate = string;

/** A fictional state. Its code fills Balebase's two-letter state fields. */
export interface Region {
  readonly id: string;
  readonly name: string;
  /** Two capital letters that are not a real US state or territory code. */
  readonly code: string;
  /** Telephone area code shared by every number in the region. */
  readonly areaCode: string;
}

export interface Address {
  readonly street: string;
  readonly city: string;
  /** A region ID. */
  readonly region: string;
  readonly zip: string;
}

export interface Appearance {
  /**
   * What a camera would see, for the portrait prompt: skin, hair, eyes,
   * facial hair, jewelry, expression, and clothing. Keep ages out; the
   * prompt derives an age band from the birth date.
   */
  readonly description: string;
  readonly glasses: boolean;
}

export type MemberRole = "owner" | "admin" | "member";

/** A person's seat in the Balebase organization. */
export interface Membership {
  readonly role: MemberRole;
  readonly joinedOn: IsoDate;
}

export interface Person {
  /** Permanent: Balebase seeds key on it. Never rename or reuse one. */
  readonly id: string;
  readonly givenName: string;
  readonly familyName: string;
  readonly birthDate: IsoDate;
  readonly appearance: Appearance;
  readonly jobTitle: string;
  /** The organization or a counterparty ID. */
  readonly employer: string;
  /** (AAA) 555-01XX. */
  readonly phone: string;
  /** At a domain reserved by RFC 2606. */
  readonly email: string;
  /** Present for people who hold a Balebase seat. */
  readonly membership?: Membership;
}

/** A legal entity the organization records under Businesses. */
export interface Business {
  readonly id: string;
  readonly name: string;
  /** NN-NNNNNNN with the unassigned 00 prefix, so it is never a real EIN. */
  readonly ein: string;
  readonly address: Address;
  readonly incorporatedOn: IsoDate;
}

export type Capability = "finance";

export interface Group {
  readonly id: string;
  readonly name: string;
  readonly capabilities: readonly Capability[];
  readonly members: readonly string[];
  /** Balebase's starting Finance group is built in. */
  readonly builtIn?: "finance";
}

/** The fictional company whose Balebase workspace the screenshots show. */
export interface Organization {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly foundedOn: IsoDate;
  readonly address: Address;
  readonly phone: string;
  /** Every member's email uses it. */
  readonly emailDomain: string;
  readonly businesses: readonly Business[];
  readonly groups: readonly Group[];
}

export type CounterpartyKind =
  | "bank"
  | "client"
  | "insurer"
  | "landlord"
  | "software"
  | "utility"
  | "vendor";

/** Clients, vendors, and the bank the company deals with. */
export interface Counterparty {
  readonly id: string;
  readonly name: string;
  readonly kind: CounterpartyKind;
  readonly address: Address;
  /** A person ID, for counterparties someone at the company deals with. */
  readonly contact?: string;
}

/** What the image generator should photograph, beyond the canon facts. */
export interface PhotoDirection {
  readonly subject: string;
  readonly setting: string;
}

export type EquipmentType = "cell_phone" | "computer" | "monitor";

export interface EquipmentItem {
  readonly id: string;
  readonly type: EquipmentType;
  /** A fictional maker; never a real brand. */
  readonly make: string;
  readonly model: string;
  readonly serialNumber: string;
  /** A person ID, or null when it sits in the office unassigned. */
  readonly assignee: string | null;
  /** The transaction that paid for it; its date is the purchase date. */
  readonly purchase: string;
  readonly photo: PhotoDirection;
}

export type AuditFormId = "nfpa70e_global" | "us_residential_core_global";

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** A client counterparty ID. */
  readonly client: string;
  readonly startedOn: IsoDate;
  readonly members: readonly string[];
  readonly forms: readonly AuditFormId[];
}

export interface Audit {
  readonly id: string;
  readonly project: string;
  readonly form: AuditFormId;
  readonly location: string;
  readonly startedBy: string;
  readonly startedOn: IsoDate;
  /** Absent while the audit is in progress. */
  readonly completedOn?: IsoDate;
}

export type IssuePriority = "critical" | "high" | "low" | "medium";

export interface Issue {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly priority: IssuePriority;
  readonly raisedBy: string;
  readonly raisedOn: IsoDate;
  readonly assignee: string | null;
  /** Raised during an audit; absent for workspace issues. */
  readonly audit?: string;
  /** Absent while open. */
  readonly resolvedOn?: IsoDate;
  /** A site photo attached to the issue. */
  readonly photo?: PhotoDirection;
}

export interface BankAccount {
  readonly id: string;
  /** A bank counterparty ID. */
  readonly bank: string;
  readonly name: string;
  readonly officialName: string;
  readonly mask: string;
  readonly type: "credit" | "depository";
  readonly subtype: "checking" | "credit card";
  /** Balance at the story date, in cents. */
  readonly currentBalanceCents: number;
}

export interface ExpenseCategory {
  readonly id: string;
  readonly name: string;
}

/** A card or bank transaction, as a bank feed reports it. */
export interface Transaction {
  readonly id: string;
  readonly account: string;
  readonly date: IsoDate;
  /** A counterparty ID. */
  readonly payee: string;
  /** The statement descriptor, as the bank prints it. */
  readonly descriptor: string;
  /** Money out, in cents, positive (the bank feed's sign convention). */
  readonly amountCents: number;
  readonly category: string;
  readonly note?: string;
  readonly reviewed: boolean;
}

export type ContractStatus = "completed" | "draft" | "sent";

export interface Contract {
  readonly id: string;
  readonly title: string;
  readonly counterparty: string;
  /** Person IDs in signing order; the company signs first. */
  readonly signers: readonly string[];
  readonly status: ContractStatus;
  readonly project?: string;
  readonly valueCents: number;
  /** Absent for drafts. */
  readonly sentOn?: IsoDate;
  readonly dueOn?: IsoDate;
  /** Present only for completed contracts. */
  readonly completedOn?: IsoDate;
  /** The agreement's numbered terms, rendered into its PDF. */
  readonly terms: readonly string[];
}

export type RequirementKind = "background_check" | "credit_check" | "form";
export type RequirementStatus =
  | "complete"
  | "in_progress"
  | "pending"
  | "submitted";

/** An employee form or check the company asked a member to complete. */
export interface Requirement {
  readonly id: string;
  readonly person: string;
  readonly kind: RequirementKind;
  readonly title: string;
  readonly requestedBy: string;
  readonly requestedOn: IsoDate;
  readonly dueOn: IsoDate;
  readonly status: RequirementStatus;
  /** Present only for complete requirements. */
  readonly completedOn?: IsoDate;
}

export interface LibraryFolder {
  readonly id: string;
  readonly name: string;
}

/** A document in the company library, rendered to a PDF in genesis/. */
export interface LibraryDocument {
  readonly id: string;
  readonly folder: string;
  readonly title: string;
  /** The person or counterparty that issued it. */
  readonly issuer: string;
  readonly issuedOn: IsoDate;
  readonly sections: readonly {
    readonly heading: string;
    /** A function when the text mentions a canon fact, so it reads, not copies, it. */
    readonly body: string | ((world: World) => string);
  }[];
}

export interface World {
  /** The story date. Canon never reads the real clock. */
  readonly asOf: IsoDate;
  readonly regions: readonly Region[];
  readonly organization: Organization;
  /** The person who signs in to the screenshot workspace. */
  readonly owner: string;
  readonly people: readonly Person[];
  readonly counterparties: readonly Counterparty[];
  readonly equipment: readonly EquipmentItem[];
  readonly projects: readonly Project[];
  readonly audits: readonly Audit[];
  readonly issues: readonly Issue[];
  readonly accounts: readonly BankAccount[];
  readonly categories: readonly ExpenseCategory[];
  readonly transactions: readonly Transaction[];
  readonly contracts: readonly Contract[];
  readonly requirements: readonly Requirement[];
  readonly folders: readonly LibraryFolder[];
  readonly documents: readonly LibraryDocument[];
}
