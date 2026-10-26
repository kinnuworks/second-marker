import { describe, expect, it } from "vitest";
import { analyse } from "@/lib/analyse";
import { applyOverrides, countOverrides, setOverride, type Overrides } from "@/lib/overrides";
import type { CheckerResult } from "@/lib/types";
import { miniScheme, readings } from "./fixtures";

// Q27 is marked 1½ of 3. The checker saw only the first two steps (1 mark's worth).
const results = (): CheckerResult[] => [
  {
    number: "27",
    summary: "",
    steps: [
      { id: "27.1", found: "written", evidence: "V = 4/3 pi r^3", confidence: "high" },
      { id: "27.2", found: "written", evidence: "dV/dt = -kS", confidence: "high" },
      { id: "27.3", found: "not_written", evidence: null, confidence: "low" },
      { id: "27.4", found: "not_written", evidence: null, confidence: "high" },
    ],
  },
];

const q27 = (overrides?: Overrides) => {
  const a = analyse(miniScheme, readings(), results(), overrides);
  return { row: a.ledger.find((r) => r.number === "27")!, check: a.checks.find((c) => c.number === "27")! };
};

describe("what-if overrides", () => {
  it("leaves the analysis unchanged without edits", () => {
    expect(q27().row).toEqual(q27({}).row);
    expect(q27().row.stamp).toBe("SKIP");
  });

  it("marking a step as written can turn SKIP into DISPUTE", () => {
    const { row, check } = q27({ "27": { "27.3": "written", "27.4": "written", "27.5": "written" } });
    expect(check.steps.map((s) => s.verdict)).toEqual([
      "credited", "credited", "written_not_credited", "credited", "written_not_credited",
    ]);
    expect(row.stamp).toBe("DISPUTE");
    expect(row.possibleGain).toBe(1.5);
    expect(row.selected).toBe(true);
  });

  it("marking a step as not written takes it out of the claim", () => {
    const { check } = q27({ "27": { "27.1": "not_written" } });
    expect(check.steps.find((s) => s.id === "27.1")!.verdict).toBe("not_written");
  });

  it("treats the student's own call as sure", () => {
    const [r] = applyOverrides(results(), { "27": { "27.3": "written" } });
    expect(r.steps.find((s) => s.id === "27.3")!.confidence).toBe("high");
  });

  it("adds a step the checker did not return", () => {
    const [r] = applyOverrides(results(), { "27": { "27.5": "written" } });
    expect(r.steps.find((s) => s.id === "27.5")).toEqual({ id: "27.5", found: "written", evidence: null, confidence: "high" });
  });

  it("never changes the saved results", () => {
    const saved = results();
    const copy = structuredClone(saved);
    analyse(miniScheme, readings(), saved, { "27": { "27.4": "written", "27.1": "not_written" } });
    applyOverrides(saved, { "27": { "27.5": "written" } });
    expect(saved).toEqual(copy);
  });

  it("sets and clears overrides without mutating", () => {
    const empty: Overrides = {};
    const one = setOverride(empty, "27", "27.4", "written");
    expect(empty).toEqual({});
    expect(one).toEqual({ "27": { "27.4": "written" } });
    const two = setOverride(one, "24", "24.3", "not_written");
    expect(countOverrides(two)).toBe(2);
    expect(setOverride(two, "27", "27.4", null)).toEqual({ "24": { "24.3": "not_written" } });
  });
});
