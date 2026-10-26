// Hands the confirmed choices from the results page to the printable sheet.
// Session storage only: nothing leaves the browser, and it may be unavailable.
import type { TotalsReport } from "./totals";
import type { LedgerRow } from "./types";

export type SheetData = {
  paper: string;
  isSample: boolean;
  fee: number;
  currency: string;
  board: string;
  totals: TotalsReport;
  rows: LedgerRow[];
  steps: Record<string, SheetStep[]>;
};

/** A missed scheme step, with the line from the student's page when the checker quoted one. */
export type SheetStep = { id: string; text: string; evidence?: string | null };

const KEY = "second-marker:sheet";

export function saveSheet(data: SheetData) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* private mode: the sheet page explains */
  }
}

export function loadSheet(): SheetData | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SheetData) : null;
  } catch {
    return null;
  }
}
