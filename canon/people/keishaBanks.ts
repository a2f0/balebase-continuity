import type { Person } from "../../src/canon/types";

export const keishaBanks: Person = {
  id: "keisha-banks",
  givenName: "Keisha",
  familyName: "Banks",
  birthDate: "1993-01-30",
  appearance: {
    description:
      "Black woman with medium-dark brown skin, long box braids pulled back into a low ponytail, dark brown eyes, small gold stud earrings, a confident closed-mouth smile, wearing a forest-green work jacket over a gray t-shirt",
    glasses: false,
  },
  jobTitle: "Journeyman electrician",
  employer: "harborline",
  phone: "(360) 555-0113",
  email: "keisha@harborline.example.com",
  membership: { role: "member", joinedOn: "2021-05-10" },
};
