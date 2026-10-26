import { describe, expect, it } from "vitest";
import { buildLedger, fmt, summarise } from "@/lib/ledger";
import { mergeReadings } from "@/lib/totals";
import type { QuestionCheck } from "@/lib/types";
import { checks, miniScheme, readings } from "./fixtures";

const ledger = (c: QuestionCheck[] = checks, marks?: Record<string, number | null>) =>
  buildLedger(miniScheme, mergeReadings(readings({ marks })), c);

describe("buildLedger", () => {
  it("stamps DISPUTE when scheme steps were written but not credited", () => {
    const q27 = ledger().find((r) => r.number === "27")!;
    expect(q27.stamp).toBe("DISPUTE");
    expect(q27.possibleGain).toBe(1);
    expect(q27.selected).toBe(true);
    expect(q27.reason).toContain("2 scheme steps");
  });

  it("never promises more than the question's maximum", () => {
    const q24 = ledger(checks, { "24": 1.75 }).find((r) => r.number === "24")!;
    expect(q24.possibleGain).toBeLessThanOrEqual(0.5);
  });

  it("skips one-mark objective questions", () => {
    expect(ledger().find((r) => r.number === "1")!.stamp).toBe("SKIP");
  });

  it("warns instead of disputing when the examiner was already generous", () => {
    const generous: QuestionCheck[] = [
      { number: "27", summary: "", steps: [
        { id: "27.1", verdict: "credited", evidence: "x", confidence: "high" },
        { id: "27.2", verdict: "not_written", evidence: null, confidence: "high" },
        { id: "27.3", verdict: "not_written", evidence: null, confidence: "high" },
        { id: "27.4", verdict: "not_written", evidence: null, confidence: "high" },
        { id: "27.5", verdict: "not_written", evidence: null, confidence: "high" },
      ] },
    ];
    const q27 = ledger(generous).find((r) => r.number === "27")!;
    expect(q27.stamp).toBe("SKIP");
    expect(q27.risk).toMatch(/lower this mark/);
  });

  it("does not recommend paying on a low-confidence reading", () => {
    const shaky = checks.map((c) => ({ ...c, steps: c.steps.map((s) => ({ ...s, confidence: "low" as const })) }));
    const q27 = ledger(shaky).find((r) => r.number === "27")!;
    expect(q27.stamp).toBe("SKIP");
    expect(q27.reason).toMatch(/too uncertain/);
  });

  it("caps disputes at 10 questions, keeping the biggest gains", () => {
    const many = Array.from({ length: 12 }, (_, i) => String(40 + i));
    const scheme = {
      ...miniScheme,
      rules: { board: "Test", currency: "₹", feePerQuestion: 100, maxQuestions: 10, canGoDown: true },
      questions: many.map((n, i) => ({
        number: n, section: "D" as const, maxMarks: 5, prompt: "", steps: [{ id: `${n}.1`, text: "", marks: 0.5 + (i % 3) }],
      })),
    };
    const merged = many.map((n) => ({ number: n, pages: [1], lines: [], examinerMark: 0, legible: true, parts: [] }));
    const c: QuestionCheck[] = many.map((n) => ({
      number: n, summary: "", steps: [{ id: `${n}.1`, verdict: "written_not_credited", evidence: "x", confidence: "high" }],
    }));
    const rows = buildLedger(scheme, merged, c);
    expect(rows.filter((r) => r.stamp === "DISPUTE")).toHaveLength(10);
    expect(rows.filter((r) => r.stamp === "SKIP").every((r) => r.possibleGain === 0.5)).toBe(true);
  });
});

describe("summarise", () => {
  it("adds up fees and gains for the selected questions", () => {
    const rows = ledger();
    expect(summarise(rows, 100, 10)).toEqual({ selectedCount: 2, totalFee: 200, possibleGain: 1.5, overCap: false });
  });

  it("formats half marks", () => {
    expect([fmt(0.5), fmt(1), fmt(2.5)]).toEqual(["½", "1", "2½"]);
  });
});
