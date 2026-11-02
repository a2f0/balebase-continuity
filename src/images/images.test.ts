import { describe, expect, test } from "bun:test";
import { world } from "../../canon/world";
import { imageSize } from "../render/imageSize";
import { imageSpecs } from "./catalog";
import { MAX_EDGE } from "./jpeg";
import { imageStatus, readImage, readSidecar } from "./sidecar";

const MAX_BYTES = 3 * 1024 * 1024;
const specs = imageSpecs(world);

describe("committed images", () => {
  test.each(specs.map((spec) => [spec.id, spec] as const))(
    "%s is current, small, and recorded",
    (_, spec) => {
      expect(imageStatus(spec)).toBe("current");
      const bytes = readImage(spec) ?? new Uint8Array();
      expect(bytes.length).toBeLessThanOrEqual(MAX_BYTES);
      const size = imageSize(bytes);
      expect(size.mimeType).toBe("image/jpeg");
      expect(Math.max(size.width, size.height)).toBeLessThanOrEqual(MAX_EDGE);
      const sidecar = readSidecar(spec);
      expect(sidecar?.model).toBeTruthy();
      expect(sidecar?.generatedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (spec.kind === "portrait") {
        expect(sidecar?.framing).toBeDefined();
      }
    },
  );

  test("every prompt keeps people fictional and brands out", () => {
    for (const spec of specs) {
      if (spec.kind === "portrait") {
        expect(spec.prompt).toContain("of a fictional person");
      } else {
        expect(spec.prompt).toMatch(/[Nn]o people/);
      }
      expect(spec.prompt).toMatch(
        /[Nn]o (text|real-world brands|readable text)/,
      );
    }
  });
});
