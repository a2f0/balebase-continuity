// A small, deterministic PDF writer for text documents: contracts and library
// files. It uses the standard Helvetica faces every PDF reader provides, so
// nothing is embedded, and it writes no dates or IDs, so the same blocks
// always yield the same bytes.

export type Block =
  | { readonly kind: "eyebrow"; readonly text: string }
  | { readonly kind: "title"; readonly text: string }
  | { readonly kind: "meta"; readonly text: string }
  | { readonly kind: "heading"; readonly text: string }
  | { readonly kind: "paragraph"; readonly text: string }
  | {
      readonly kind: "signature";
      readonly name: string;
      readonly role: string;
    };

export interface PdfDocument {
  readonly title: string;
  readonly author: string;
  readonly blocks: readonly Block[];
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 72;
const TEXT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const FOOTER_Y = 40;

// Helvetica advance widths, in thousandths of an em, for ASCII 32 to 126.
// biome-ignore format: a width table reads best in fixed rows.
const HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278,
  278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584,
  584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556,
  833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278,
  278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222,
  500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500,
  500, 334, 260, 334, 584,
];
// Bold faces run wider; measuring with headroom keeps lines inside the margin.
const BOLD_HEADROOM = 1.1;

interface Style {
  readonly font: "F1" | "F2";
  readonly size: number;
  readonly leading: number;
  readonly gray: number;
  readonly before: number;
}

const STYLES: Record<Exclude<Block["kind"], "signature">, Style> = {
  eyebrow: { font: "F2", size: 9, leading: 12, gray: 0.4, before: 0 },
  title: { font: "F2", size: 20, leading: 24, gray: 0.1, before: 6 },
  meta: { font: "F1", size: 10, leading: 14, gray: 0.35, before: 2 },
  heading: { font: "F2", size: 11.5, leading: 15, gray: 0.1, before: 14 },
  paragraph: { font: "F1", size: 10.5, leading: 15, gray: 0.15, before: 4 },
};

/** Throws on characters outside printable ASCII, which Helvetica cannot map. */
function assertPdfText(text: string): void {
  const bad = [...text].find((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code > 126;
  });
  if (bad !== undefined) {
    throw new Error(`PDF text must be printable ASCII; found "${bad}"`);
  }
}

export function textWidth(text: string, size: number, bold = false): number {
  let units = 0;
  for (const character of text) {
    units += HELVETICA[character.charCodeAt(0) - 32] ?? 556;
  }
  return (units * size * (bold ? BOLD_HEADROOM : 1)) / 1000;
}

export function wrap(text: string, size: number, bold = false): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && textWidth(candidate, size, bold) > TEXT_WIDTH) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  return line ? [...lines, line] : lines;
}

function escapePdf(text: string): string {
  return text.replace(/[\\()]/g, (character) => `\\${character}`);
}

function num(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function textOp(style: Style, x: number, y: number, text: string): string {
  return `BT /${style.font} ${num(style.size)} Tf ${num(style.gray)} g ${num(x)} ${num(y)} Td (${escapePdf(text)}) Tj ET`;
}

const SIGNATURE_HEIGHT = 74;

/** Lays blocks out top to bottom, starting a page when one fills up. */
function layout(blocks: readonly Block[]): string[][] {
  const pages: string[][] = [[]];
  let y = PAGE_HEIGHT - MARGIN;
  const ensure = (height: number) => {
    if (y - height < MARGIN) {
      pages.push([]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };
  const page = () => pages[pages.length - 1] ?? [];
  for (const block of blocks) {
    if (block.kind === "signature") {
      ensure(SIGNATURE_HEIGHT);
      y -= 44;
      page().push(
        `0.4 G 0.75 w ${MARGIN} ${num(y)} m ${MARGIN + 240} ${num(y)} l S`,
        `${MARGIN + 290} ${num(y)} m ${MARGIN + 420} ${num(y)} l S`,
        textOp(STYLES.paragraph, MARGIN, y - 13, block.name),
        textOp(STYLES.meta, MARGIN, y - 26, block.role),
        textOp(STYLES.meta, MARGIN + 290, y - 13, "Date"),
      );
      y -= SIGNATURE_HEIGHT - 44;
      continue;
    }
    const style = STYLES[block.kind];
    const lines = wrap(block.text, style.size, style.font === "F2");
    ensure(style.before + style.leading * Math.min(lines.length, 2));
    y -= style.before;
    for (const line of lines) {
      ensure(style.leading);
      y -= style.leading;
      page().push(textOp(style, MARGIN, y + 3, line));
    }
  }
  return pages;
}

function pdfString(text: string): string {
  return `(${escapePdf(text)})`;
}

export function renderPdf(document: PdfDocument): Uint8Array {
  for (const block of document.blocks) {
    if (block.kind === "signature") {
      assertPdfText(block.name);
      assertPdfText(block.role);
    } else {
      assertPdfText(block.text);
    }
  }
  assertPdfText(document.title);
  assertPdfText(document.author);
  const pages = layout(document.blocks);
  const footer = STYLES.meta;
  const objects: string[] = [];
  const pageIds = pages.map((_, index) => 5 + index * 2);
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[3] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
  pages.forEach((operations, index) => {
    const label = `Page ${index + 1} of ${pages.length}`;
    const content = [
      ...operations,
      textOp(
        footer,
        PAGE_WIDTH - MARGIN - textWidth(label, footer.size),
        FOOTER_Y,
        label,
      ),
    ].join("\n");
    const pageId = pageIds[index] ?? 0;
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${pageId + 1} 0 R >>`;
    objects[pageId + 1] =
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });
  const infoId = objects.length;
  objects[infoId] =
    `<< /Title ${pdfString(document.title)} /Author ${pdfString(document.author)} /Producer (balebase-continuity) >>`;

  let body = "%PDF-1.7\n";
  const offsets: number[] = [];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = body.length;
    body += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = body.length;
  body += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) {
    body += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length} /Root 1 0 R /Info ${infoId} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(body);
}

/** The page count a reader reports, read back from the document itself. */
export function pdfPageCount(bytes: Uint8Array): number {
  const match = /\/Type \/Pages \/Kids \[[^\]]*\] \/Count (\d+)/.exec(
    new TextDecoder().decode(bytes),
  );
  return match ? Number(match[1]) : 0;
}
