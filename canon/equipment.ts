import type { EquipmentItem } from "../src/canon/types";

// Balebase tracks computers, phones, and monitors. Makers are fictional; the
// purchase transaction in canon/finance.ts dates each item.

export const equipment: readonly EquipmentItem[] = [
  {
    id: "dana-laptop",
    type: "computer",
    make: "Corvane",
    model: "Ledger 14",
    serialNumber: "CV14-2602-88172",
    assignee: "dana-whitlock",
    purchase: "kestrel-laptop-2026-02",
    photo: {
      subject:
        "a slim silver-gray aluminum 14-inch laptop, lid open at a comfortable angle, its screen dark and showing only a faint reflection, its keyboard keys printed with plain letters and no logo key",
      setting:
        "a tidy office desk by a window, beside a closed paper planner and a ceramic mug",
    },
  },
  {
    id: "luis-rugged-laptop",
    type: "computer",
    make: "Fieldmark",
    model: "FM-14R Rugged",
    serialNumber: "FMR-2605-004417",
    assignee: "luis-ferreira",
    purchase: "kestrel-rugged-2026-05",
    photo: {
      subject:
        "a rugged laptop with black rubberized corner bumpers, a graphite shell with dark orange accents, and a carry handle, lid open with its screen dark",
      setting:
        "the open tailgate of a white work van parked outside, with a coiled orange extension cord in soft focus behind it",
    },
  },
  {
    id: "keisha-phone",
    type: "cell_phone",
    make: "Tidewell",
    model: "T6 Rugged",
    serialNumber: "TW6R-81553027",
    assignee: "keisha-banks",
    purchase: "saltmarsh-phone-2026-03",
    photo: {
      subject:
        "a rugged smartphone in a black and safety-orange armored case, lying face up with its screen off",
      setting:
        "a scuffed plywood jobsite workbench next to a coil of copper building wire and a pair of lineman's pliers",
    },
  },
  {
    id: "ren-phone",
    type: "cell_phone",
    make: "Tidewell",
    model: "T5",
    serialNumber: "TW5-77210448",
    assignee: "ren-takahashi",
    purchase: "saltmarsh-phone-2026-09",
    photo: {
      subject:
        "a slim dark blue smartphone in a clear protective case, lying face down so its camera bump and back are visible",
      setting:
        "a metal clipboard holding a blank inspection form, on the dashboard shelf of a work truck",
    },
  },
  {
    id: "office-monitor",
    type: "monitor",
    make: "Clearline",
    model: "CQ27 Pro",
    serialNumber: "CLQ27-2511-03391",
    assignee: null,
    purchase: "kestrel-monitor-2025-11",
    photo: {
      subject:
        "a 27-inch computer monitor with thin matte black bezels on a simple height-adjustable stand, its screen showing a plain soft blue gradient",
      setting:
        "a shared office desk with a wired keyboard, a desk lamp, and a rolled set of electrical drawings",
    },
  },
];
