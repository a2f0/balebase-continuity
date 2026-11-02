import type { Person } from "../../src/canon/types";

export const danaWhitlock: Person = {
  id: "dana-whitlock",
  givenName: "Dana",
  familyName: "Whitlock",
  birthDate: "1976-09-02",
  appearance: {
    description:
      "Black woman with deep brown skin, shoulder-length natural hair in a neat twist-out with a few silver strands, dark brown eyes, small silver hoop earrings, a warm, composed smile, wearing a heather-gray cardigan over a burgundy top",
    glasses: true,
  },
  jobTitle: "Office manager",
  employer: "harborline",
  phone: "(360) 555-0111",
  email: "dana@harborline.example.com",
  membership: { role: "admin", joinedOn: "2019-06-03" },
};
