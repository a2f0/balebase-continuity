import type { Person } from "../../src/canon/types";

export const luisFerreira: Person = {
  id: "luis-ferreira",
  givenName: "Luis",
  familyName: "Ferreira",
  birthDate: "1985-06-21",
  appearance: {
    description:
      "Brazilian-American man with warm medium-brown skin, short black hair with a neat side part, dark brown eyes, a full black mustache with trimmed stubble, a steady, friendly expression, wearing a charcoal work polo",
    glasses: false,
  },
  jobTitle: "Lead technician",
  employer: "harborline",
  phone: "(360) 555-0112",
  email: "luis@harborline.example.com",
  membership: { role: "member", joinedOn: "2020-02-17" },
};
