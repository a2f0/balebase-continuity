import type { EquipmentItem } from "../types";
import { type Context, present } from "./context";

// Equipment: fictional makers, an assignee with a seat, and a purchase the
// bank feed actually shows.

// Real makers that must never appear as an equipment make. Canon makers are
// invented; this list catches the obvious slips.
const REAL_MAKERS = new Set(
  [
    "acer",
    "apple",
    "asus",
    "dell",
    "google",
    "hp",
    "huawei",
    "lenovo",
    "lg",
    "microsoft",
    "motorola",
    "nokia",
    "panasonic",
    "samsung",
    "sony",
    "toshiba",
    "xiaomi",
  ].map((name) => name.toLowerCase()),
);

function checkItem(ctx: Context, item: EquipmentItem): string[] {
  const { world } = ctx;
  const purchase = world.transactions.find((txn) => txn.id === item.purchase);
  const payee = world.counterparties.find(
    (party) => party.id === purchase?.payee,
  );
  return present(
    REAL_MAKERS.has(item.make.toLowerCase())
      ? `${item.id} make ${item.make} is a real brand`
      : undefined,
    item.assignee === null || ctx.members.has(item.assignee)
      ? undefined
      : `${item.id} is assigned to non-member ${item.assignee}`,
    purchase
      ? undefined
      : `${item.id} purchase ${item.purchase} is not a transaction`,
    purchase && purchase.category !== "equipment"
      ? `${item.id} purchase ${item.purchase} is not filed under equipment`
      : undefined,
    purchase && payee?.kind !== "vendor"
      ? `${item.id} was not bought from a vendor`
      : undefined,
  );
}

export function checkEquipment(ctx: Context): string[] {
  const purchases = ctx.world.equipment.map((item) => item.purchase);
  return [
    ...ctx.world.equipment.flatMap((item) => checkItem(ctx, item)),
    ...purchases
      .filter((id, index) => purchases.indexOf(id) !== index)
      .map((id) => `transaction ${id} pays for more than one item`),
  ];
}
