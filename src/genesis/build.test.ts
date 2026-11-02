import { describe, expect, test } from "bun:test";
import { world } from "../../canon/world";
import type { BalebaseSeed } from "../export/seedTypes";
import { imageSize } from "../render/imageSize";
import { pdfPageCount } from "../render/pdf";
import { buildGenesis, SEED_PATH } from "./build";

const files = buildGenesis(world);
const byPath = new Map(files.map((file) => [file.path, file.bytes]));
const seed = JSON.parse(
  new TextDecoder().decode(byPath.get(SEED_PATH)),
) as BalebaseSeed;

describe("buildGenesis", () => {
  test("renders the same bytes every time", () => {
    const again = buildGenesis(world);
    expect(again.map((file) => file.path)).toEqual(
      files.map((file) => file.path),
    );
    for (const [index, file] of again.entries()) {
      expect(file.bytes).toEqual(files[index]?.bytes ?? new Uint8Array());
    }
  });

  test("refuses inconsistent canon", () => {
    expect(() => buildGenesis({ ...world, owner: "hal-brennan" })).toThrow(
      "Canon is inconsistent",
    );
  });

  test("cuts 512 px square avatars", () => {
    for (const person of seed.people) {
      const bytes = byPath.get(person.avatar);
      expect(bytes).toBeDefined();
      expect(imageSize(bytes ?? new Uint8Array())).toEqual({
        height: 512,
        mimeType: "image/jpeg",
        width: 512,
      });
    }
  });
});

describe("the Balebase seed", () => {
  const ids = new Set(seed.people.map((person) => person.id));
  const members = new Set(
    seed.people.filter((person) => person.role).map((person) => person.id),
  );

  test("references only files genesis rendered", () => {
    const paths = [
      ...seed.people.flatMap((person) => [person.avatar, person.portrait]),
      ...seed.equipment.map((item) => item.photo),
      ...seed.issues.flatMap((issue) => (issue.photo ? [issue.photo] : [])),
      ...seed.contracts.map((contract) => contract.document.file),
      ...seed.library.documents.map((item) => item.file),
    ];
    expect(paths.filter((path) => !byPath.has(path))).toEqual([]);
  });

  test("references only people it lists, with seats where Balebase needs them", () => {
    const people = [
      ...seed.groups.flatMap((group) => group.members),
      ...seed.projects.flatMap((project) => project.members),
      ...seed.equipment.flatMap((item) =>
        item.assignee ? [item.assignee] : [],
      ),
      ...seed.issues.flatMap((issue) => [
        issue.createdBy,
        ...(issue.assignee ? [issue.assignee] : []),
      ]),
      ...seed.requirements.flatMap((item) => [item.person, item.requestedBy]),
    ];
    expect(people.filter((id) => !members.has(id))).toEqual([]);
    const signers = seed.contracts.flatMap((contract) =>
      contract.signers.map((signer) => signer.person),
    );
    expect(signers.filter((id) => !ids.has(id))).toEqual([]);
  });

  test("describes each document the way Balebase stores it", () => {
    for (const contract of seed.contracts) {
      const bytes = byPath.get(contract.document.file) ?? new Uint8Array();
      expect(contract.document.size).toBe(bytes.length);
      expect(contract.document.pageCount).toBe(pdfPageCount(bytes));
      expect(contract.document.pageCount).toBeGreaterThan(0);
    }
  });

  test("has exactly one owner, who signs in to the screenshot workspace", () => {
    const owners = seed.people.filter((person) => person.role === "owner");
    expect(owners.map((person) => person.id)).toEqual([
      seed.organization.owner,
    ]);
  });

  test("uses fictional contact details only", () => {
    for (const person of seed.people) {
      expect(person.phone).toMatch(/^\(\d{3}\) 555-01\d\d$/);
      expect(person.email).toMatch(/example\.(com|net|org)$/);
    }
    for (const business of seed.businesses) {
      expect(business.ein).toMatch(/^00-\d{7}$/);
    }
  });
});
