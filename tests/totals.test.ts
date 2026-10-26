import { describe, expect, it } from "vitest";
import { checkTotals, mergeReadings, normaliseNumber } from "@/lib/totals";
import { miniScheme, readings } from "./fixtures";

describe("checkTotals", () => {
  it("passes when the margin marks add up to the cover total", () => {
    const r = checkTotals(readings(), miniScheme);
    expect(r.added).toBe(3.5);
    expect(r.issues).toEqual([]);
    expect(r.recommendVerification).toBe(false);
  });

  it("flags a cover total that doesn't match and recommends verification first", () => {
    const r = checkTotals(readings({ cover: 2.5 }), miniScheme);
    expect(r.issues[0]).toEqual({ kind: "total_mismatch", cover: 2.5, added: 3.5 });
    expect(r.recommendVerification).toBe(true);
  });

  it("flags a mark above the question's maximum", () => {
    const r = checkTotals(readings({ cover: 5.5, marks: { "24": 3 } }), miniScheme);
    expect(r.issues).toContainEqual({ kind: "over_max", number: "24", mark: 3, max: 2 });
  });

  it("separates an answered-but-unmarked question from an unreadable mark", () => {
    const pages = readings({ cover: 2, marks: { "27": null } });
    expect(checkTotals(pages, miniScheme).issues).toContainEqual({ kind: "unmarked", number: "27" });
    pages[2].questions[0].legible = false;
    expect(checkTotals(pages, miniScheme).issues).toContainEqual({ kind: "unreadable_mark", number: "27" });
  });

  it("notices when both internal-choice questions were answered", () => {
    const pages = readings();
    pages[2].questions.push(
      { number: "28A", page: 3, top: 0.5, bottom: 0.7, lines: ["a"], examinerMark: 1, legible: true },
      { number: "28B", page: 3, top: 0.7, bottom: 0.9, lines: ["b"], examinerMark: 2, legible: true },
    );
    const r = checkTotals(pages, miniScheme);
    expect(r.issues).toContainEqual({ kind: "both_choices", numbers: ["28A", "28B"] });
  });
});

describe("mergeReadings", () => {
  it("joins an answer that continues onto the next page and keeps the final mark", () => {
    const pages = readings();
    pages[2].questions.unshift({ number: "Q24", page: 3, top: 0, bottom: 0.1, lines: ["= 6"], examinerMark: 1.5, legible: true });
    const q24 = mergeReadings(pages).find((q) => q.number === "24")!;
    expect(q24.pages).toEqual([2, 3]);
    expect(q24.lines).toEqual(["working for 24", "= 6"]);
    expect(q24.examinerMark).toBe(1.5);
  });

  it("normalises question labels", () => {
    expect(normaliseNumber("Q. 27")).toBe("27");
    expect(normaliseNumber("28 a")).toBe("28A");
  });
});

describe("cover marks table", () => {
  it("uses the cover table when the margin reading disagrees, and flags it", () => {
    const pages = readings({ cover: 3.5, marks: { "27": 2 } });
    pages[0].coverMarks = [{ label: "27", mark: 1.5 }];
    const q27 = mergeReadings(pages).find((q) => q.number === "27")!;
    expect(q27.examinerMark).toBe(1.5);
    expect(checkTotals(pages, miniScheme).issues).toContainEqual({ kind: "posting_mismatch", number: "27", inside: 2, cover: 1.5 });
  });
});
