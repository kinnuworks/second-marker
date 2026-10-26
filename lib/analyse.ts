import { allocate } from "./allocate";
import { buildLedger } from "./ledger";
import { checkTotals, mergeReadings, type MergedQuestion, type TotalsReport } from "./totals";
import type { CheckerResult, LedgerRow, PageReading, QuestionCheck, Scheme } from "./types";

export type Analysis = {
  merged: MergedQuestion[];
  totals: TotalsReport;
  checks: QuestionCheck[];
  ledger: LedgerRow[];
  unknownQuestions: string[]; // numbers on the page that aren't in this paper
};

/** Everything after the reader and checker: plain code, no AI. */
export function analyse(scheme: Scheme, readings: PageReading[], results: CheckerResult[]): Analysis {
  const merged = mergeReadings(readings);
  const totals = checkTotals(readings, scheme);
  const checks: QuestionCheck[] = [];
  for (const r of results) {
    const q = scheme.questions.find((x) => x.number === r.number);
    const m = merged.find((x) => x.number === r.number);
    if (q && m) checks.push(allocate(q, r, m.examinerMark));
  }
  const ledger = buildLedger(scheme, merged, checks);
  const unknownQuestions = merged.filter((m) => !scheme.questions.some((q) => q.number === m.number)).map((m) => m.number);
  return { merged, totals, checks, ledger, unknownQuestions };
}
