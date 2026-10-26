import { describe, expect, it } from "vitest";
import { draftRequest } from "@/lib/request";
import type { SheetData } from "@/lib/sheet";

const base: SheetData = {
  paper: "Mini paper",
  isSample: false,
  fee: 0,
  currency: "",
  board: "Your exam board",
  totals: { added: 3.5, cover: 3.5, issues: [], recommendVerification: false },
  rows: [
    { number: "27", awarded: 1.5, max: 3, possibleGain: 1, confidence: "high", stamp: "DISPUTE", reason: "", risk: "", selected: true },
  ],
  steps: { "27": [{ id: "27.4", text: "combine", evidence: "-kS = S dr/dt" }, { id: "27.5", text: "dr/dt = -k" }] },
};

describe("draftRequest", () => {
  it("lists each question with marks, steps and the student's own line", () => {
    const t = draftRequest(base);
    expect(t).toContain("Question 27: marks given 1½ out of 3");
    expect(t).toContain("- Scheme step 27.4: combine");
    expect(t).toContain('In my answer: "-kS = S dr/dt"');
    expect(t).toContain("- Scheme step 27.5: dr/dt = -k");
    expect(t).toContain("[your name]");
    expect(t).toContain("[candidate number]");
    expect(t).not.toContain("re-count");
  });

  it("asks for a re-count first when the totals are off", () => {
    const t = draftRequest({
      ...base,
      totals: { added: 3.5, cover: 2.5, issues: [{ kind: "total_mismatch", cover: 2.5, added: 3.5 }], recommendVerification: true },
    });
    expect(t).toContain("Please re-count the marks first.");
    expect(t.indexOf("re-count")).toBeLessThan(t.indexOf("Question 27"));
  });

  it("uses no dashes as punctuation", () => {
    expect(draftRequest(base)).not.toMatch(/[–—]/);
  });
});
