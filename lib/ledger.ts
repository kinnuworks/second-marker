import type { Confidence, LedgerRow, QuestionCheck, RemarkRules, Scheme } from "./types";
import { type MergedQuestion, roundHalf } from "./totals";

export const DEFAULT_RULES: RemarkRules = { board: "Your exam board", currency: "", feePerQuestion: 0, canGoDown: true };

export function rulesFor(scheme: Scheme): RemarkRules {
  return scheme.rules ?? DEFAULT_RULES;
}

const rank: Record<Confidence, number> = { high: 2, medium: 1, low: 0 };

function lowest(...values: Confidence[]): Confidence {
  return values.reduce((a, b) => (rank[b] < rank[a] ? b : a), "high" as Confidence);
}

/**
 * Turns the step-by-step comparison into a DISPUTE / SKIP call per question.
 * Plain arithmetic, no AI: this is the part a student's money depends on.
 */
export function buildLedger(
  scheme: Scheme,
  merged: MergedQuestion[],
  checks: QuestionCheck[],
): LedgerRow[] {
  const rows: LedgerRow[] = [];

  for (const q of merged) {
    const sq = scheme.questions.find((x) => x.number === q.number);
    if (!sq) continue;
    const check = checks.find((c) => c.number === q.number);
    const awarded = q.examinerMark;
    const max = sq.maxMarks;

    const base = { number: q.number, awarded, max, selected: false };

    if (!q.legible || awarded === null) {
      rows.push({
        ...base,
        possibleGain: 0,
        confidence: "low",
        stamp: "SKIP",
        reason: awarded === null ? "No mark could be read for this question." : "Parts of this answer couldn't be read.",
        risk: "Check this page yourself before deciding.",
      });
      continue;
    }

    if (sq.steps.length === 0) {
      rows.push({
        ...base,
        possibleGain: 0,
        confidence: "high",
        stamp: "SKIP",
        reason: awarded >= max ? "Full marks already." : "One-mark objective question: right or wrong, no step marks.",
        risk: "None.",
      });
      continue;
    }

    if (!check) {
      rows.push({
        ...base,
        possibleGain: 0,
        confidence: "low",
        stamp: "SKIP",
        reason: "Not compared with the scheme yet.",
        risk: "Check this question yourself.",
      });
      continue;
    }

    const stepMarks = (id: string) => sq.steps.find((s) => s.id === id)?.marks ?? 0;
    const missed = check.steps.filter((s) => s.verdict === "written_not_credited");
    const supported = check.steps
      .filter((s) => s.verdict === "credited" || s.verdict === "written_not_credited")
      .reduce((sum, s) => sum + stepMarks(s.id), 0);
    const altMethod = check.steps.some((s) => s.verdict === "alternative_method");

    const rawGain = missed.reduce((sum, s) => sum + stepMarks(s.id), 0);
    const possibleGain = roundHalf(Math.max(0, Math.min(rawGain, max - awarded)));
    const confidence = lowest(...missed.map((s) => s.confidence), ...(missed.length ? [] : ["high" as Confidence]));

    // If the examiner already gave more than the written steps support,
    // a second look could take marks away.
    const generous = !altMethod && awarded > roundHalf(supported) + 1e-9;

    let stamp: LedgerRow["stamp"] = "SKIP";
    let reason: string;
    let risk: string;

    if (awarded >= max) {
      reason = "Full marks already.";
      risk = "None.";
    } else if (generous) {
      reason = `The examiner gave ${fmt(awarded)}, more than the steps written support.`;
      risk = "High: re-evaluation could lower this mark.";
    } else if (possibleGain >= 0.5 && confidence !== "low") {
      stamp = "DISPUTE";
      reason = `${missed.length} scheme step${missed.length === 1 ? "" : "s"} written but not credited: +${fmt(possibleGain)} possible.`;
      risk =
        confidence === "high"
          ? "Low: the steps are clearly on the page."
          : "Medium: the reader wasn't fully sure. Check the quoted lines yourself.";
    } else if (altMethod) {
      reason = "Used a different method. The scheme allows full marks for correct alternatives, but this needs a teacher's eye.";
      risk = "Uncertain: ask a teacher before paying.";
    } else if (possibleGain >= 0.5) {
      reason = `Possibly +${fmt(possibleGain)}, but the reading is too uncertain to recommend paying.`;
      risk = "Check the quoted lines yourself.";
    } else {
      reason = "The marks match the steps written.";
      risk = "Paying would likely change nothing.";
    }

    rows.push({ ...base, possibleGain, confidence, stamp, reason, risk, selected: stamp === "DISPUTE" });
  }

  return applyCap(rows, rulesFor(scheme).maxQuestions);
}

/** Some boards cap how many questions you can send back per subject (CBSE: 10). */
function applyCap(rows: LedgerRow[], max?: number): LedgerRow[] {
  if (!max) return rows;
  const disputes = rows
    .filter((r) => r.stamp === "DISPUTE")
    .sort((a, b) => b.possibleGain - a.possibleGain || rank[b.confidence] - rank[a.confidence]);
  const keep = new Set(disputes.slice(0, max).map((r) => r.number));
  return rows.map((r) =>
    r.stamp === "DISPUTE" && !keep.has(r.number)
      ? { ...r, stamp: "SKIP", selected: false, reason: `${r.reason} Left out: the board allows only ${max} questions per subject.` }
      : r,
  );
}

export type LedgerSummary = {
  selectedCount: number;
  totalFee: number;
  possibleGain: number;
  overCap: boolean;
};

export function summarise(rows: LedgerRow[], feePerQuestion = 0, maxQuestions?: number): LedgerSummary {
  const selected = rows.filter((r) => r.selected);
  return {
    selectedCount: selected.length,
    totalFee: selected.length * feePerQuestion,
    possibleGain: roundHalf(selected.reduce((s, r) => s + r.possibleGain, 0)),
    overCap: maxQuestions !== undefined && selected.length > maxQuestions,
  };
}

export function fmt(n: number): string {
  const whole = Math.floor(n);
  const half = n - whole >= 0.5;
  if (whole === 0 && half) return "½";
  return half ? `${whole}½` : `${whole}`;
}
