import type {
  Address,
  Counterparty,
  Organization,
  Region,
} from "../src/canon/types";

// A fictional Pacific Northwest state, shared with a2f0/continuity's world.
// "CS" is not a real US state or territory code.
export const cascadia: Region = {
  id: "cascadia",
  name: "Cascadia",
  code: "CS",
  areaCode: "360",
};

function merrowBay(street: string, zip = "98472"): Address {
  return { street, city: "Merrow Bay", region: "cascadia", zip };
}

export const harborline: Organization = {
  id: "harborline",
  name: "Harborline Electric",
  tagline: "Commercial and residential electrical contracting",
  foundedOn: "2019-04-08",
  address: merrowBay("410 Wharf Road"),
  phone: "(360) 555-0100",
  emailDomain: "harborline.example.com",
  businesses: [
    {
      id: "harborline-electric-llc",
      name: "Harborline Electric LLC",
      ein: "00-2917365",
      address: merrowBay("410 Wharf Road"),
      incorporatedOn: "2019-04-08",
    },
    {
      id: "harborline-field-services",
      name: "Harborline Field Services Inc.",
      ein: "00-5520194",
      address: merrowBay("18 Commercial Street"),
      incorporatedOn: "2023-01-17",
    },
  ],
  groups: [
    {
      id: "finance",
      name: "Finance",
      builtIn: "finance",
      capabilities: ["finance"],
      members: ["jordan-avery", "dana-whitlock"],
    },
    {
      id: "field-crew",
      name: "Field crew",
      capabilities: [],
      members: [
        "luis-ferreira",
        "keisha-banks",
        "tomas-lindqvist",
        "ren-takahashi",
      ],
    },
  ],
};

export const counterparties: readonly Counterparty[] = [
  {
    id: "riverside-clinic",
    name: "Riverside Community Clinic",
    kind: "client",
    address: merrowBay("2200 Riverside Drive", "98474"),
    contact: "grace-whitaker",
  },
  {
    id: "oakline-property",
    name: "Oakline Property Group",
    kind: "client",
    address: merrowBay("77 Oak Street, Suite 200", "98473"),
    contact: "owen-mcallister",
  },
  {
    id: "pell-logistics",
    name: "Pell & Daughters Logistics",
    kind: "client",
    address: merrowBay("7 Terminal Way", "98475"),
  },
  {
    id: "northgate-supply",
    name: "Northgate Electrical Supply",
    kind: "vendor",
    address: merrowBay("1450 Northgate Avenue", "98476"),
    contact: "hal-brennan",
  },
  {
    id: "kestrel-office",
    name: "Kestrel Office Technology",
    kind: "vendor",
    address: merrowBay("300 Market Street"),
  },
  {
    id: "saltmarsh-wireless",
    name: "Saltmarsh Wireless",
    kind: "vendor",
    address: merrowBay("88 Harbor Plaza"),
  },
  {
    id: "merrow-fuel",
    name: "Merrow Bay Fuel & Service",
    kind: "vendor",
    address: merrowBay("901 Shore Highway", "98475"),
  },
  {
    id: "copperline-diner",
    name: "Copperline Diner",
    kind: "vendor",
    address: merrowBay("12 Wharf Road"),
  },
  {
    id: "brightline-office",
    name: "Brightline Office Supply",
    kind: "vendor",
    address: merrowBay("315 Market Street"),
  },
  {
    id: "merrow-valley-cu",
    name: "Merrow Valley Credit Union",
    kind: "bank",
    address: merrowBay("1 Bank Street"),
  },
  {
    id: "alder-pike-mutual",
    name: "Alder & Pike Mutual Insurance",
    kind: "insurer",
    address: merrowBay("640 Granite Street", "98473"),
  },
  {
    id: "fieldnote-software",
    name: "Fieldnote Software",
    kind: "software",
    address: merrowBay("55 Foundry Lane", "98476"),
  },
  {
    id: "wharf-road-properties",
    name: "Wharf Road Properties",
    kind: "landlord",
    address: merrowBay("400 Wharf Road"),
  },
  {
    id: "merrow-bay-utilities",
    name: "Merrow Bay Public Utilities",
    kind: "utility",
    address: merrowBay("100 City Hall Square"),
  },
];
