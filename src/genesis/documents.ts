import { formatLongDate } from "../canon/dates";
import {
  contractFile,
  contractingEntity,
  displayName,
  employerName,
  findCounterparty,
  findPerson,
  formatMoney,
  libraryFile,
  partyName,
} from "../canon/derive";
import type { Contract, LibraryDocument, World } from "../canon/types";
import { type Block, renderPdf } from "../render/pdf";

// Contracts and library documents, laid out as PDF text blocks from canon.

function contractBlocks(world: World, contract: Contract): Block[] {
  const party = findCounterparty(world, contract.counterparty);
  const blocks: Block[] = [
    { kind: "eyebrow", text: world.organization.name.toUpperCase() },
    { kind: "title", text: contract.title },
    {
      kind: "meta",
      text: `Between ${contractingEntity(world)} and ${party.name}`,
    },
    {
      kind: "meta",
      text: `Contract value: ${formatMoney(contract.valueCents)}`,
    },
  ];
  if (contract.dueOn) {
    blocks.push({
      kind: "meta",
      text: `Please sign by ${formatLongDate(contract.dueOn)}`,
    });
  }
  contract.terms.forEach((term, index) => {
    const split = term.indexOf(". ");
    blocks.push(
      {
        kind: "heading",
        text: `${index + 1}. ${term.slice(0, split)}`,
      },
      { kind: "paragraph", text: term.slice(split + 2) },
    );
  });
  blocks.push({ kind: "heading", text: "Signatures" });
  for (const id of contract.signers) {
    const person = findPerson(world, id);
    blocks.push({
      kind: "signature",
      name: displayName(person),
      role: `${person.jobTitle}, ${employerName(world, person)}`,
    });
  }
  return blocks;
}

function libraryBlocks(world: World, document: LibraryDocument): Block[] {
  return [
    { kind: "eyebrow", text: world.organization.name.toUpperCase() },
    { kind: "title", text: document.title },
    {
      kind: "meta",
      text: `Issued by ${partyName(world, document.issuer)} on ${formatLongDate(document.issuedOn)}`,
    },
    ...document.sections.flatMap((section): Block[] => [
      { kind: "heading", text: section.heading },
      {
        kind: "paragraph",
        text:
          typeof section.body === "string" ? section.body : section.body(world),
      },
    ]),
  ];
}

export function renderDocuments(world: World, files: Map<string, Uint8Array>) {
  const author = world.organization.name;
  for (const contract of world.contracts) {
    files.set(
      contractFile(contract),
      renderPdf({
        title: contract.title,
        author,
        blocks: contractBlocks(world, contract),
      }),
    );
  }
  for (const document of world.documents) {
    files.set(
      libraryFile(document),
      renderPdf({
        title: document.title,
        author: partyName(world, document.issuer),
        blocks: libraryBlocks(world, document),
      }),
    );
  }
}
