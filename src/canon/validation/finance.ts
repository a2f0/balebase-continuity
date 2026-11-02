import type { Transaction } from "../types";
import { type Context, pastDate, present } from "./context";

// The bank feed: accounts at a bank, payees the company actually pays, and
// categories that exist.

const PAYEE_KINDS = new Set([
  "insurer",
  "landlord",
  "software",
  "utility",
  "vendor",
]);

function checkTransaction(ctx: Context, txn: Transaction): string[] {
  const { world } = ctx;
  const payee = world.counterparties.find((party) => party.id === txn.payee);
  return present(
    world.accounts.some((account) => account.id === txn.account)
      ? undefined
      : `transaction ${txn.id} account ${txn.account} does not exist`,
    world.categories.some((category) => category.id === txn.category)
      ? undefined
      : `transaction ${txn.id} category ${txn.category} does not exist`,
    payee && PAYEE_KINDS.has(payee.kind)
      ? undefined
      : `transaction ${txn.id} payee ${txn.payee} is not a counterparty the company pays`,
    Number.isInteger(txn.amountCents) && txn.amountCents > 0
      ? undefined
      : `transaction ${txn.id} amount must be positive whole cents`,
    pastDate(world, `transaction ${txn.id}`, txn.date),
    /^[A-Z0-9 #&.-]+$/.test(txn.descriptor)
      ? undefined
      : `transaction ${txn.id} descriptor must look like a bank statement line`,
  );
}

export function checkFinance(ctx: Context): string[] {
  const { world } = ctx;
  const used = new Set(world.transactions.map((txn) => txn.category));
  const dates = world.transactions.map((txn) => txn.date);
  return [
    ...world.accounts.flatMap((account) =>
      present(
        world.counterparties.some(
          (party) => party.id === account.bank && party.kind === "bank",
        )
          ? undefined
          : `account ${account.id} bank ${account.bank} is not a bank`,
        /^\d{4}$/.test(account.mask)
          ? undefined
          : `account ${account.id} mask must be four digits`,
        Number.isInteger(account.currentBalanceCents)
          ? undefined
          : `account ${account.id} balance must be whole cents`,
      ),
    ),
    ...world.categories
      .filter((category) => !used.has(category.id))
      .map((category) => `category ${category.id} has no transactions`),
    ...world.transactions.flatMap((txn) => checkTransaction(ctx, txn)),
    ...present(
      dates.every(
        (date, index) => index === 0 || (dates[index - 1] ?? "") <= date,
      )
        ? undefined
        : "transactions must be listed in date order",
    ),
  ];
}
