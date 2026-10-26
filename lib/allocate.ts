import type { CheckerResult, QuestionCheck, SchemeQuestion, StepVerdict } from "./types";

/**
 * Examiners write one mark per question, not one per step. Given the steps the
 * checker found on the page and the examiner's mark, decide which steps that mark
 * already covers. Steps are credited in scheme order, the way the scheme reads;
 * whatever is written but left over is "written but not credited".
 */
export function allocate(question: SchemeQuestion, result: CheckerResult, awarded: number | null): QuestionCheck {
  let pool = awarded ?? 0;
  const steps = question.steps.map((step) => {
    const f = result.steps.find((s) => s.id === step.id);
    const found = f?.found ?? "not_written";
    let verdict: StepVerdict;
    if (found === "alternative_method") verdict = "alternative_method";
    else if (found !== "written") verdict = "not_written";
    else if (pool + 1e-9 >= step.marks) {
      verdict = "credited";
      pool -= step.marks;
    } else verdict = "written_not_credited";
    return { id: step.id, verdict, evidence: f?.evidence ?? null, confidence: f?.confidence ?? "low" };
  });
  return { number: result.number, steps, summary: result.summary };
}
