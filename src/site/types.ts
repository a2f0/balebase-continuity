import type { BalebaseSeed } from "../export/seedTypes";
import type { CanonSnapshot } from "../genesis/canonSnapshot";

export interface Asset {
  readonly path: string;
  readonly bytes: number;
  readonly image?: { readonly width: number; readonly height: number };
}

/** Everything the gallery shows, read from the committed genesis/ snapshot. */
export interface Gallery {
  readonly canon: CanonSnapshot;
  readonly seed: BalebaseSeed;
  readonly assets: readonly Asset[];
}
