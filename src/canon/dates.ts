import type { IsoDate } from "./types";

// Calendar-date helpers. Canon dates are plain YYYY-MM-DD strings with no time
// zone, so everything here works on {year, month, day} triples and never
// reads the clock or constructs a local-time Date.

interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return (
    month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)
  );
}

function parse(date: IsoDate): CalendarDate {
  if (!isIsoDate(date)) {
    throw new Error(`Invalid calendar date: ${date}`);
  }
  const [year = 0, month = 0, day = 0] = date.split("-").map(Number);
  return { day, month, year };
}

export function compareDates(left: IsoDate, right: IsoDate): number {
  // Zero-padded ISO dates sort lexicographically.
  parse(left);
  parse(right);
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Whole years elapsed from `birthDate` to `on`. */
export function ageOn(birthDate: IsoDate, on: IsoDate): number {
  const birth = parse(birthDate);
  const at = parse(on);
  const hadBirthday =
    at.month > birth.month || (at.month === birth.month && at.day >= birth.day);
  return at.year - birth.year - (hadBirthday ? 0 : 1);
}

/** "October 6, 2026", for prose and documents. */
export function formatLongDate(date: IsoDate): string {
  const { year, month, day } = parse(date);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}
