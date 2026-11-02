import type {
  Contract,
  LibraryDocument,
  LibraryFolder,
  Requirement,
} from "../src/canon/types";

// Contracts out for signature, employee requirements, and the company
// library. Contract and library documents render to PDFs in genesis/.

export const contracts: readonly Contract[] = [
  {
    id: "riverside-retrofit-agreement",
    title: "Riverside Clinic retrofit agreement",
    counterparty: "riverside-clinic",
    signers: ["jordan-avery", "grace-whitaker"],
    status: "completed",
    project: "riverside-clinic-retrofit",
    valueCents: 18_640_000,
    sentOn: "2026-08-12",
    dueOn: "2026-08-19",
    completedOn: "2026-08-17",
    terms: [
      "Scope. Harborline Electric will replace the main distribution panels on floors one through three, rebalance branch circuits, and perform an arc-flash study with new equipment labels throughout the clinic.",
      "Schedule. Work begins after signing and proceeds floor by floor outside clinic hours so patient areas stay powered during the day.",
      "Shutdowns. Planned outages are scheduled with the facilities director at least five business days ahead and never exceed four hours.",
      "Price. The fixed price covers labor, materials, permits, and the arc-flash study. Changes in scope require a written change order signed by both parties.",
      "Payment. The clinic pays thirty percent on signing, forty percent when the second floor is complete, and the balance within thirty days of final inspection.",
      "Warranty. Workmanship is warranted for two years from final inspection.",
    ],
  },
  {
    id: "oak-street-inspection-agreement",
    title: "Oak Street inspection services",
    counterparty: "oakline-property",
    signers: ["jordan-avery", "owen-mcallister"],
    status: "sent",
    project: "oak-street-apartments",
    valueCents: 2_160_000,
    sentOn: "2026-10-09",
    dueOn: "2026-10-23",
    terms: [
      "Scope. Harborline Electric will inspect the electrical systems of every unit in the Oak Street apartments using its residential inspection checklist and report findings unit by unit.",
      "Access. Oakline Property Group will give tenants notice and provide keys for each scheduled inspection day.",
      "Reports. Each unit's report, with photographs of any issue found, is delivered within two business days of its inspection.",
      "Price. The fee is charged per unit inspected; repairs found during inspection are quoted separately.",
      "Payment. Invoices are issued every two weeks and are due within thirty days.",
    ],
  },
  {
    id: "warehouse-7-proposal",
    title: "Warehouse 7 LED conversion proposal",
    counterparty: "pell-logistics",
    signers: ["jordan-avery"],
    status: "draft",
    project: "warehouse-7-lighting",
    valueCents: 6_450_000,
    terms: [
      "Scope. Harborline Electric will replace the high-bay fixtures in Warehouse 7 with LED fixtures, add occupancy controls by aisle, and test every emergency light.",
      "Schedule. Work proceeds one aisle at a time on weekends so the warehouse can keep shipping.",
      "Price. The proposed price covers fixtures, controls, lifts, labor, and disposal of the old lamps.",
    ],
  },
];

export const requirements: readonly Requirement[] = [
  {
    id: "ren-withholding-form",
    person: "ren-takahashi",
    kind: "form",
    title: "Tax withholding form",
    requestedBy: "dana-whitlock",
    requestedOn: "2026-09-14",
    dueOn: "2026-09-21",
    status: "complete",
    completedOn: "2026-09-16",
  },
  {
    id: "ren-background-check",
    person: "ren-takahashi",
    kind: "background_check",
    title: "Background check",
    requestedBy: "dana-whitlock",
    requestedOn: "2026-09-14",
    dueOn: "2026-09-28",
    status: "in_progress",
  },
  {
    id: "ren-safety-acknowledgment",
    person: "ren-takahashi",
    kind: "form",
    title: "Electrical safety training acknowledgment",
    requestedBy: "dana-whitlock",
    requestedOn: "2026-10-01",
    dueOn: "2026-10-31",
    status: "pending",
  },
  {
    id: "keisha-safety-acknowledgment",
    person: "keisha-banks",
    kind: "form",
    title: "Electrical safety training acknowledgment",
    requestedBy: "dana-whitlock",
    requestedOn: "2026-10-01",
    dueOn: "2026-10-31",
    status: "complete",
    completedOn: "2026-10-03",
  },
  {
    id: "tomas-direct-deposit",
    person: "tomas-lindqvist",
    kind: "form",
    title: "Direct deposit authorization",
    requestedBy: "dana-whitlock",
    requestedOn: "2026-10-06",
    dueOn: "2026-10-20",
    status: "submitted",
  },
];

export const folders: readonly LibraryFolder[] = [
  { id: "safety", name: "Safety" },
  { id: "insurance", name: "Insurance" },
  { id: "fleet", name: "Fleet" },
];

export const documents: readonly LibraryDocument[] = [
  {
    id: "electrical-safety-program",
    folder: "safety",
    title: "Electrical safety program",
    issuer: "jordan-avery",
    issuedOn: "2026-01-12",
    sections: [
      {
        heading: "Purpose",
        body: "This program sets out how Harborline Electric keeps its crews safe around energized equipment. It applies to every employee and every job site.",
      },
      {
        heading: "De-energize first",
        body: "Equipment is placed in an electrically safe work condition before work begins: disconnected, locked and tagged out, and tested for absence of voltage. Energized work requires a written permit signed by the owner.",
      },
      {
        heading: "Arc-flash labels",
        body: "Every panel and switchgear section we service carries a current arc-flash label. Missing or outdated labels are reported as an issue on the day they are found.",
      },
      {
        heading: "Training",
        body: "Every field employee completes electrical safety training on hire and every three years after, and signs an acknowledgment in Balebase.",
      },
    ],
  },
  {
    id: "certificate-of-insurance-2026",
    folder: "insurance",
    title: "Certificate of liability insurance",
    issuer: "alder-pike-mutual",
    issuedOn: "2026-01-02",
    sections: [
      {
        heading: "Insured",
        body: (world) => {
          const [entity] = world.organization.businesses;
          const region = world.regions.find(
            (item) => item.id === entity?.address.region,
          );
          return entity
            ? `${entity.name}, ${entity.address.street}, ${entity.address.city}, ${region?.name ?? ""} ${entity.address.zip}.`
            : "";
        },
      },
      {
        heading: "Coverage",
        body: "Commercial general liability, each occurrence: 1,000,000. General aggregate: 2,000,000. Commercial auto, combined single limit: 1,000,000.",
      },
      {
        heading: "Policy period",
        body: "January 1, 2026 through January 1, 2027.",
      },
      {
        heading: "Certificate holder",
        body: "Issued for information only. This certificate confers no rights upon the certificate holder and does not amend the policies listed above.",
      },
    ],
  },
  {
    id: "vehicle-inspection-checklist",
    folder: "fleet",
    title: "Vehicle inspection checklist",
    issuer: "dana-whitlock",
    issuedOn: "2026-03-02",
    sections: [
      {
        heading: "Before every shift",
        body: "Walk around the van: tires, lights, mirrors, and the ladder rack. Report anything loose as an issue before driving.",
      },
      {
        heading: "Weekly",
        body: "Check oil and washer fluid, restock the first-aid kit, and confirm the fire extinguisher gauge reads in the green.",
      },
      {
        heading: "Monthly",
        body: "Photograph the odometer and upload it with the fuel receipts so the Finance group can reconcile vehicle costs.",
      },
    ],
  },
];
