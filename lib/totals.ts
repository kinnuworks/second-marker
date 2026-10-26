import type { PageReading, QuestionReading, Scheme } from "./types";

export type MergedQuestion = {
  number: string;
  pages: number[];
  lines: string[];
  examinerMark: number | null;
  legible: boolean;
  parts: QuestionReading[];
  coverDisagrees?: number; // what the margin seemed to say, when the cover table differs
  coverChecked?: boolean; // a cover table row with a mark matched this question
};

export type TotalsIssue =
  | { kind: "total_mismatch"; cover: number; added: number }
  | { kind: "over_max"; number: string; mark: number; max: number }
  | { kind: "unmarked"; number: string }
  | { kind: "unreadable_mark"; number: string }
  | { kind: "both_choices"; numbers: [string, string] }
  | { kind: "posting_mismatch"; number: string; inside: number; cover: number };

export type TotalsReport = {
  added: number; // sum of the marks we could read
  cover: number | null; // total written on the cover
  issues: TotalsIssue[];
  recommendVerification: boolean;
};

/** Joins a question that runs across several pages into one answer. */
export function mergeReadings(readings: PageReading[]): MergedQuestion[] {
  const byNumber = new Map<string, MergedQuestion>();
  const pages = [...readings].sort((a, b) => a.page - b.page);
  for (const page of pages) {
    for (const q of page.questions) {
      const key = normaliseNumber(q.number);
      const existing = byNumber.get(key);
      if (!existing) {
        byNumber.set(key, {
          number: key,
          pages: [q.page],
          lines: [...q.lines],
          examinerMark: q.examinerMark,
          legible: q.legible,
          parts: [q],
        });
        continue;
      }
      if (!existing.pages.includes(q.page)) existing.pages.push(q.page);
      existing.lines.push(...q.lines);
      existing.parts.push(q);
      existing.legible = existing.legible && q.legible;
      // Examiners write the mark once, usually where the answer ends.
      if (q.examinerMark !== null) existing.examinerMark = q.examinerMark;
    }
  }
  // The cover's marks table repeats each question's mark. Where the margin and
  // the table disagree, the table is usually the clearer writing: use it and say so.
  const table = pages.find((p) => p.isCover)?.coverMarks ?? [];
  for (const q of byNumber.values()) {
    const row = table.find((r) => r.label === q.number || r.label === q.number.replace(/[AB]$/, ""));
    if (row && row.mark !== null) {
      q.coverChecked = true;
      if (q.examinerMark !== null && Math.abs(row.mark - q.examinerMark) > 1e-9) q.coverDisagrees = q.examinerMark;
      q.examinerMark = row.mark;
    }
  }
  return [...byNumber.values()].sort(compareNumbers);
}

export function checkTotals(readings: PageReading[], scheme: Scheme): TotalsReport {
  const merged = mergeReadings(readings);
  const cover = readings.find((p) => p.isCover && p.coverTotal !== null)?.coverTotal ?? null;
  const issues: TotalsIssue[] = [];
  let added = 0;

  for (const q of merged) {
    const max = maxMarksFor(scheme, q.number);
    if (q.coverDisagrees !== undefined && q.examinerMark !== null) {
      issues.push({ kind: "posting_mismatch", number: q.number, inside: q.coverDisagrees, cover: q.examinerMark });
    }
    if (q.examinerMark === null) {
      issues.push(q.legible ? { kind: "unmarked", number: q.number } : { kind: "unreadable_mark", number: q.number });
      continue;
    }
    added += q.examinerMark;
    if (max !== null && q.examinerMark > max) {
      issues.push({ kind: "over_max", number: q.number, mark: q.examinerMark, max });
    }
  }

  // Internal choice: answering both 28A and 28B should only count once.
  const answered = new Set(merged.map((q) => q.number));
  for (const n of answered) {
    if (n.endsWith("A") && answered.has(n.slice(0, -1) + "B")) {
      issues.push({ kind: "both_choices", numbers: [n, n.slice(0, -1) + "B"] });
    }
  }

  added = roundHalf(added);
  if (cover !== null && roundHalf(cover) !== added) {
    issues.unshift({ kind: "total_mismatch", cover, added });
  }

  const recommendVerification = issues.some(
    (i) => i.kind === "total_mismatch" || i.kind === "unmarked" || i.kind === "over_max",
  );
  return { added, cover, issues, recommendVerification };
}

export function maxMarksFor(scheme: Scheme, number: string): number | null {
  const n = normaliseNumber(number);
  const q = scheme.questions.find((x) => x.number === n);
  return q ? q.maxMarks : null;
}

/** "Q 27", "27.", "28 a" → "27", "27", "28A". */
export function normaliseNumber(raw: string): string {
  return raw.replace(/^q(uestion)?\s*/i, "").replace(/[.\s)]/g, "").toUpperCase();
}

export function compareNumbers(a: { number: string }, b: { number: string }): number {
  const na = parseInt(a.number, 10);
  const nb = parseInt(b.number, 10);
  return na === nb ? a.number.localeCompare(b.number) : na - nb;
}

export function roundHalf(n: number): number {
  return Math.round(n * 2) / 2;
}
