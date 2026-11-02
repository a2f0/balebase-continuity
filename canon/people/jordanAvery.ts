import type { Person } from "../../src/canon/types";

export const jordanAvery: Person = {
  id: "jordan-avery",
  givenName: "Jordan",
  familyName: "Avery",
  birthDate: "1981-03-14",
  appearance: {
    description:
      "white man with ruddy fair skin, short sandy-brown hair graying at the temples, a close-trimmed salt-and-pepper beard, hazel eyes, crow's feet from outdoor work, a relaxed, confident half smile, wearing a navy button-up work shirt",
    glasses: false,
  },
  jobTitle: "Owner and master electrician",
  employer: "harborline",
  phone: "(360) 555-0110",
  email: "jordan@harborline.example.com",
  membership: { role: "owner", joinedOn: "2019-04-08" },
};
