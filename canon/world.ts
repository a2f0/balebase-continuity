import type { World } from "../src/canon/types";
import { cascadia, counterparties, harborline } from "./company";
import { equipment } from "./equipment";
import { accounts, categories, transactions } from "./finance";
import { amaraOsei } from "./people/amaraOsei";
import { danaWhitlock } from "./people/danaWhitlock";
import { graceWhitaker } from "./people/graceWhitaker";
import { halBrennan } from "./people/halBrennan";
import { jordanAvery } from "./people/jordanAvery";
import { keishaBanks } from "./people/keishaBanks";
import { luisFerreira } from "./people/luisFerreira";
import { owenMcallister } from "./people/owenMcallister";
import { renTakahashi } from "./people/renTakahashi";
import { tomasLindqvist } from "./people/tomasLindqvist";
import { contracts, documents, folders, requirements } from "./records";
import { audits, issues, projects } from "./work";

// The whole story, as of one fixed date. Balebase's screenshots show Jordan
// Avery's workspace for Harborline Electric.

export const world: World = {
  asOf: "2026-10-15",
  regions: [cascadia],
  organization: harborline,
  owner: "jordan-avery",
  people: [
    jordanAvery,
    danaWhitlock,
    luisFerreira,
    keishaBanks,
    tomasLindqvist,
    renTakahashi,
    amaraOsei,
    graceWhitaker,
    owenMcallister,
    halBrennan,
  ],
  counterparties,
  equipment,
  projects,
  audits,
  issues,
  accounts,
  categories,
  transactions,
  contracts,
  requirements,
  folders,
  documents,
};
