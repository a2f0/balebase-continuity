import { describe, expect, test } from "bun:test";
import { avatarCrop } from "./avatar";

describe("avatarCrop", () => {
  test("centers a square on the face, sized to it", () => {
    expect(avatarCrop(1000, 1500, { cx: 0.5, cy: 0.4, height: 0.3 })).toEqual({
      side: 750,
      x: 125,
      y: 247.5,
    });
  });

  test("shifts the square back inside the image", () => {
    const crop = avatarCrop(1000, 1500, { cx: 0.1, cy: 0.05, height: 0.3 });
    expect(crop.x).toBe(0);
    expect(crop.y).toBe(0);
  });

  test("shrinks a square larger than the image", () => {
    expect(avatarCrop(1000, 1500, { cx: 0.5, cy: 0.5, height: 0.9 }).side).toBe(
      1000,
    );
  });
});
