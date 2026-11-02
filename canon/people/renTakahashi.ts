import type { Person } from "../../src/canon/types";

export const renTakahashi: Person = {
  id: "ren-takahashi",
  givenName: "Ren",
  familyName: "Takahashi",
  birthDate: "2003-05-19",
  appearance: {
    description:
      "Japanese-American man with light skin, straight black hair in a short textured cut with a slightly longer fringe, dark brown eyes, clean-shaven, a slightly shy smile, wearing a plain black crewneck sweatshirt",
    glasses: false,
  },
  jobTitle: "Apprentice electrician",
  employer: "harborline",
  phone: "(360) 555-0115",
  email: "ren@harborline.example.com",
  membership: { role: "member", joinedOn: "2026-09-14" },
};
