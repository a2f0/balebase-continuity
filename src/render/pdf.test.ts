import { describe, expect, test } from "bun:test";
import { pdfPageCount, renderPdf, textWidth, wrap } from "./pdf";

const paragraph = "Harborline Electric keeps its crews safe. ".repeat(20);

describe("renderPdf", () => {
  test("is byte-for-byte deterministic and dateless", () => {
    const document = {
      title: "Safety",
      author: "Harborline Electric",
      blocks: [{ kind: "paragraph", text: paragraph } as const],
    };
    const first = renderPdf(document);
    expect(renderPdf(document)).toEqual(first);
    const text = new TextDecoder().decode(first);
    expect(text).not.toContain("CreationDate");
    expect(text.startsWith("%PDF-1.7\n")).toBe(true);
    expect(text.endsWith("%%EOF\n")).toBe(true);
  });

  test("starts a new page when one fills up, and counts pages", () => {
    const blocks = Array.from({ length: 12 }, () => ({
      kind: "paragraph" as const,
      text: paragraph,
    }));
    const bytes = renderPdf({ title: "Long", author: "Test", blocks });
    expect(pdfPageCount(bytes)).toBeGreaterThan(1);
    expect(new TextDecoder().decode(bytes)).toContain(
      `Page ${pdfPageCount(bytes)} of ${pdfPageCount(bytes)}`,
    );
  });

  test("writes a cross-reference table whose offsets point at objects", () => {
    const bytes = renderPdf({ title: "T", author: "A", blocks: [] });
    const text = new TextDecoder().decode(bytes);
    const offsets = [...text.matchAll(/^(\d{10}) 00000 n $/gm)].map((match) =>
      Number(match[1]),
    );
    expect(offsets.length).toBeGreaterThan(3);
    offsets.forEach((offset, index) => {
      expect(text.slice(offset).startsWith(`${index + 1} 0 obj`)).toBe(true);
    });
  });

  test("rejects text Helvetica cannot encode", () => {
    expect(() =>
      renderPdf({
        title: "Fancy “quotes”",
        author: "A",
        blocks: [],
      }),
    ).toThrow("printable ASCII");
  });

  test("wraps lines inside the text column", () => {
    for (const line of wrap(paragraph, 10.5)) {
      expect(textWidth(line, 10.5)).toBeLessThanOrEqual(468);
    }
  });
});
