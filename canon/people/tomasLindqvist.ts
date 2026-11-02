import type { Person } from "../../src/canon/types";

export const tomasLindqvist: Person = {
  id: "tomas-lindqvist",
  givenName: "Tomas",
  familyName: "Lindqvist",
  birthDate: "1989-11-08",
  appearance: {
    description:
      "white man with fair skin and light freckles, shaggy straw-blond hair, light blue eyes, a short reddish-blond beard, an easygoing smile showing a little of his teeth, wearing a faded denim work shirt",
    glasses: false,
  },
  jobTitle: "Journeyman electrician",
  employer: "harborline",
  phone: "(360) 555-0114",
  email: "tomas@harborline.example.com",
  membership: { role: "member", joinedOn: "2022-03-21" },
};
