// What-if edits: the student says "I think this step was written" (or wasn't).
// Applied to a copy of the checker's results in memory only; saved data is never changed.
import type { CheckerResult, StepFinding } from "./types";

export type StepOverride = Extract<StepFinding, "written" | "not_written">;

/** Question number to step id to the student's own finding. */
export type Overrides = Record<string, Record<string, StepOverride>>;

export function applyOverrides(results: CheckerResult[], overrides: Overrides): CheckerResult[] {
  return results.map((r) => {
    const edits = overrides[r.number];
    if (!edits || Object.keys(edits).length === 0) return r;
    const steps = r.steps.map((s) =>
      // The student looked at their own page: treat their call as sure.
      edits[s.id] ? { ...s, found: edits[s.id], confidence: "high" as const } : s,
    );
    for (const [id, found] of Object.entries(edits)) {
      if (!steps.some((s) => s.id === id)) steps.push({ id, found, evidence: null, confidence: "high" });
    }
    return { ...r, steps };
  });
}

/** Sets one step's override, or clears it when `value` is null. Returns a new object. */
export function setOverride(overrides: Overrides, number: string, stepId: string, value: StepOverride | null): Overrides {
  const forQuestion = { ...(overrides[number] ?? {}) };
  if (value === null) delete forQuestion[stepId];
  else forQuestion[stepId] = value;
  const next = { ...overrides };
  if (Object.keys(forQuestion).length === 0) delete next[number];
  else next[number] = forQuestion;
  return next;
}

export function countOverrides(overrides: Overrides): number {
  return Object.values(overrides).reduce((n, q) => n + Object.keys(q).length, 0);
}
