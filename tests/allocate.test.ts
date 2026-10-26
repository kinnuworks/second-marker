import { describe, expect, it } from "vitest";
import { allocate } from "@/lib/allocate";
import type { CheckerResult } from "@/lib/types";
import { miniScheme } from "./fixtures";

const q27 = miniScheme.questions.find((q) => q.number === "27")!;
const found = (f: CheckerResult["steps"][number]["found"][]): CheckerResult => ({
  number: "27",
  summary: "",
  steps: f.map((found, i) => ({ id: `27.${i + 1}`, found, evidence: found === "written" ? `line ${i + 1}` : null, confidence: "high" })),
});

describe("allocate", () => {
  it("credits written steps in order until the examiner's mark runs out", () => {
    const r = allocate(q27, found(["written", "written", "written", "written", "written"]), 2);
    expect(r.steps.map((s) => s.verdict)).toEqual([
      "credited", "credited", "credited", "written_not_credited", "written_not_credited",
    ]);
  });

  it("gives no credit claim for wrong or missing steps", () => {
    const r = allocate(q27, found(["written", "wrong", "not_written", "written", "written"]), 0.5);
    expect(r.steps.map((s) => s.verdict)).toEqual([
      "credited", "not_written", "not_written", "written_not_credited", "written_not_credited",
    ]);
  });

  it("treats a missing mark as zero awarded", () => {
    const r = allocate(q27, found(["written", "written", "not_written", "not_written", "not_written"]), null);
    expect(r.steps.filter((s) => s.verdict === "written_not_credited")).toHaveLength(2);
  });

  it("keeps alternative methods separate for a teacher to judge", () => {
    const r = allocate(q27, found(["alternative_method", "written", "written", "written", "written"]), 3);
    expect(r.steps[0].verdict).toBe("alternative_method");
  });
});
