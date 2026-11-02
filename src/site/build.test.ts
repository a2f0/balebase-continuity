import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSite } from "./build";
import type { Gallery } from "./types";

let output = "";
let gallery: Gallery;
let html = "";

beforeAll(() => {
  output = mkdtempSync(join(tmpdir(), "balebase-continuity-site-"));
  gallery = buildSite(output);
  html = readFileSync(join(output, "index.html"), "utf8");
});

afterAll(() => {
  rmSync(output, { force: true, recursive: true });
});

describe("buildSite", () => {
  test("keeps the gallery out of search indexes while allowing crawls", () => {
    expect(html).toContain(
      '<meta name="robots" content="noindex, nofollow, noarchive">',
    );
    expect(readFileSync(join(output, "_headers"), "utf8")).toContain(
      "X-Robots-Tag: noindex, nofollow",
    );
    expect(readFileSync(join(output, "robots.txt"), "utf8")).toBe(
      "User-agent: *\nAllow: /\n",
    );
  });

  test("renders favicons from the brand logo", () => {
    for (const name of ["favicon.svg", "favicon.ico", "apple-touch-icon.png"]) {
      expect(existsSync(join(output, name))).toBe(true);
      expect(html).toContain(`href="/${name}"`);
    }
  });

  test("links only files it published", () => {
    const links = [...html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)].map(
      (match) => decodeURIComponent(match[1] ?? ""),
    );
    expect(links.length).toBeGreaterThan(50);
    expect(links.filter((link) => !existsSync(join(output, link)))).toEqual([]);
  });

  test("shows every person, item, and issue in the seed", () => {
    for (const person of gallery.seed.people)
      expect(html).toContain(person.name);
    for (const item of gallery.seed.equipment)
      expect(html).toContain(item.serialNumber);
    for (const issue of gallery.seed.issues)
      expect(html).toContain(issue.title);
  });

  test("sizes every image so the page does not shift as it loads", () => {
    const images = [...html.matchAll(/<img [^>]*>/g)].map((match) => match[0]);
    expect(images.length).toBeGreaterThan(0);
    for (const image of images)
      expect(image).toMatch(/width="\d+" height="\d+"/);
  });
});
