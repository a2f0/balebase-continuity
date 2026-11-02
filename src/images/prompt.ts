import { createHash } from "node:crypto";
import { ageOn } from "../canon/dates";
import type {
  EquipmentItem,
  Person,
  PhotoDirection,
  World,
} from "../canon/types";

// Image prompts are derived from canon, so a changed description, a changed
// equipment fact, or a person aging into a new band marks the image stale.

function ageBand(age: number): string {
  const decade = Math.floor(age / 10) * 10;
  const third = age % 10 < 4 ? "early" : age % 10 < 7 ? "mid" : "late";
  return `${third} ${decade}s`;
}

export function portraitPrompt(world: World, person: Person): string {
  const { appearance } = person;
  return [
    `Unretouched employee ID badge photograph of a fictional person in their ${ageBand(ageOn(person.birthDate, world.asOf))}: ${appearance.description}.`,
    appearance.glasses
      ? "Wearing glasses, with no glare on the lenses."
      : "No glasses.",
    "Vertical 2:3 frame: head and shoulders, centered, facing the camera straight on, eyes open and looking into the lens, with clear space above the head and the tops of both shoulders in frame.",
    "Shot on a full-frame camera with an 85mm lens at f/8 under even, soft studio light with no harsh shadows, against a plain light gray-blue backdrop, in sharp focus.",
    "Real skin with visible pores, fine lines, and small blemishes true to the person's age, individual strands of hair with a few flyaways, natural catchlights, slight natural asymmetry, and true-to-life color.",
    "It must read as an ordinary photo of a real person: not an illustration, painting, cartoon, 3D render, or CGI, and not airbrushed or beauty-filtered.",
    "No text, logos, watermarks, borders, or props.",
  ].join(" ");
}

export function equipmentPrompt(item: EquipmentItem): string {
  const { photo } = item;
  return [
    `Photorealistic equipment inventory photo for a fictional small business: ${photo.subject}, on ${photo.setting}.`,
    "The whole item is visible at a natural three-quarter angle in soft, even light, with realistic materials, fine surface texture, and slight everyday wear, in sharp focus.",
    `If any maker text is visible it reads only "${item.make}" as a small, tasteful wordmark, and a serial label, if visible, reads "${item.serialNumber}".`,
    "No real-world brands or logos, no people or hands, no watermark, overlay, collage, or illustration.",
    "It must look like an ordinary, sharp photo an office manager took for the equipment register.",
    "Landscape 3:2 composition.",
  ].join(" ");
}

export function sitePrompt(photo: PhotoDirection): string {
  return [
    `Photorealistic job-site documentation photo that an electrician took with a phone for an inspection report: ${photo.subject}.`,
    `Setting: ${photo.setting}.`,
    "Realistic materials, dust, and wear, true-to-life color, a natural phone-camera perspective with slight sensor noise, in sharp focus.",
    "No people, faces, or hands; no readable text, brand names, or logos; no watermark, arrows, annotations, collage, or illustration.",
    "Landscape 4:3 composition.",
  ].join(" ");
}

export function promptDigest(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex");
}
