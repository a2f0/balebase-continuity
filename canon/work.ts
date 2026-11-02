import type { Audit, Issue, Project } from "../src/canon/types";

// Jobs, the audits run on them, and the issues those audits raised.

export const projects: readonly Project[] = [
  {
    id: "riverside-clinic-retrofit",
    name: "Riverside Clinic retrofit",
    description:
      "Panel upgrades and arc-flash labeling across the clinic's three floors.",
    client: "riverside-clinic",
    startedOn: "2026-08-24",
    members: ["luis-ferreira", "keisha-banks", "amara-osei"],
    forms: ["nfpa70e_global"],
  },
  {
    id: "oak-street-apartments",
    name: "Oak Street apartments",
    description: "Residential inspections for the 24-unit renovation.",
    client: "oakline-property",
    startedOn: "2026-09-08",
    members: ["tomas-lindqvist", "ren-takahashi"],
    forms: ["us_residential_core_global"],
  },
  {
    id: "warehouse-7-lighting",
    name: "Warehouse 7 lighting",
    description: "LED conversion and emergency lighting tests.",
    client: "pell-logistics",
    startedOn: "2026-10-05",
    members: [],
    forms: [],
  },
];

export const audits: readonly Audit[] = [
  {
    id: "riverside-second-floor",
    project: "riverside-clinic-retrofit",
    form: "nfpa70e_global",
    location: "Riverside Community Clinic, second-floor electrical room",
    startedBy: "luis-ferreira",
    startedOn: "2026-10-06",
  },
  {
    id: "oak-street-unit-14",
    project: "oak-street-apartments",
    form: "us_residential_core_global",
    location: "Oak Street apartments, unit 14",
    startedBy: "tomas-lindqvist",
    startedOn: "2026-09-29",
    completedOn: "2026-09-30",
  },
];

export const issues: readonly Issue[] = [
  {
    id: "corroded-breaker-2b",
    title: "Replace corroded breaker in panel 2B",
    description:
      "Found during the second-floor walkthrough; panel tagged out until the breaker is replaced.",
    priority: "critical",
    raisedBy: "luis-ferreira",
    raisedOn: "2026-10-06",
    assignee: "luis-ferreira",
    audit: "riverside-second-floor",
    photo: {
      subject:
        "the inside of an open gray commercial electrical panel with its dead-front cover removed, rows of black circuit breakers, one breaker near the middle with chalky blue-green corrosion crusted on its terminal screw and the bus bar beneath it",
      setting:
        "a dim utility room lit by a flashlight from the lower left, photographed close up and slightly off-axis",
    },
  },
  {
    id: "east-switchgear-labels",
    title: "Missing arc-flash labels on east switchgear",
    description: "Labels need the updated incident energy values.",
    priority: "high",
    raisedBy: "luis-ferreira",
    raisedOn: "2026-10-07",
    assignee: "keisha-banks",
    audit: "riverside-second-floor",
    photo: {
      subject:
        "the front of a gray floor-standing switchgear lineup with three closed cabinet doors, pale rectangular outlines and leftover adhesive where warning labels were peeled off, no labels present",
      setting:
        "a clean electrical room with a sealed concrete floor, yellow floor tape marking the working clearance, overhead fluorescent light",
    },
  },
  {
    id: "unit-14-gfci",
    title: "Confirm GFCI coverage in unit 14 kitchen",
    description:
      "The receptacle beside the sink is a standard duplex; confirm whether it is protected downstream.",
    priority: "medium",
    raisedBy: "tomas-lindqvist",
    raisedOn: "2026-09-30",
    assignee: "ren-takahashi",
    audit: "oak-street-unit-14",
    photo: {
      subject:
        "a standard white duplex wall receptacle with no test or reset buttons, mounted in a white subway-tile backsplash a short distance from a stainless steel kitchen sink faucet",
      setting:
        "a freshly renovated apartment kitchen with a pale quartz countertop, daylight from a window to the right",
    },
  },
  {
    id: "spare-ballast-kits",
    title: "Order spare emergency ballast kits",
    description: "Six kits for the warehouse aisle fixtures.",
    priority: "low",
    raisedBy: "amara-osei",
    raisedOn: "2026-10-09",
    assignee: null,
  },
  {
    id: "van-3-ladder-rack",
    title: "Re-torque ladder rack on van 3",
    description: "The rear crossbar rattles at highway speed.",
    priority: "low",
    raisedBy: "tomas-lindqvist",
    raisedOn: "2026-09-15",
    assignee: "tomas-lindqvist",
    resolvedOn: "2026-09-18",
  },
];
