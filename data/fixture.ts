// A hand-made example used while building, before the reader exists.
// Not a real student's answer book.
import type { CheckerResult, PageReading } from "../lib/types";

const w = (id: string, evidence: string) => ({ id, found: "written" as const, evidence, confidence: "high" as const });
const nw = (id: string) => ({ id, found: "not_written" as const, evidence: null, confidence: "high" as const });

export const fixtureReadings: PageReading[] = [
  { page: 1, isCover: true, coverTotal: 9, questions: [] },
  {
    page: 2, isCover: false, coverTotal: null,
    questions: [
      { number: "1", page: 2, top: 0.05, bottom: 0.1, lines: ["(B)"], examinerMark: 1, legible: true },
      { number: "24", page: 2, top: 0.15, bottom: 0.6, lines: ["f(0+5)=f(0)f(5) ⇒ f(0)=1", "f'(5)=lim h→0 [f(5+h)−f(5)]/h", "= lim [2f(h)−2]/h", "= 2 lim [f(h)−f(0)]/h = 2f'(0) = 6"], examinerMark: 1.5, legible: true },
      { number: "25", page: 2, top: 0.62, bottom: 0.95, lines: ["OP = ½(OA+OB) = 2i+2k", "OA×OP = 2i−2k", "Area = 2√2"], examinerMark: 2, legible: true },
    ],
  },
  {
    page: 3, isCover: false, coverTotal: null,
    questions: [
      { number: "27", page: 3, top: 0.05, bottom: 0.7, lines: ["V=4/3πr³, S=4πr²", "dV/dt = −kS", "dV/dt = 4πr² dr/dt", "−kS = S dr/dt", "dr/dt = −k ∴ constant"], examinerMark: 1.5, legible: true },
    ],
  },
  {
    page: 4, isCover: false, coverTotal: null,
    questions: [
      { number: "31", page: 4, top: 0.05, bottom: 0.6, lines: ["P(A)=0.4", "0.4(1−x)+0.6x=0.5", "x=0.5", "P(at least one) = 1 − 0.6×0.5 = 0.7"], examinerMark: 3, legible: true },
    ],
  },
];

export const fixtureResults: CheckerResult[] = [
  { number: "24", summary: "All three scheme steps are written.", steps: [w("24.1", "f(0)=1"), w("24.2", "= lim [2f(h)−2]/h"), w("24.3", "= 2f'(0) = 6")] },
  { number: "25", summary: "OP, the cross product and the area are written.", steps: [w("25.1", "OP = 2i+2k"), nw("25.2"), w("25.3", "OA×OP = 2i−2k"), w("25.4", "Area = 2√2")] },
  { number: "27", summary: "Every step of the proof is written.", steps: [w("27.1", "V=4/3πr³, S=4πr²"), w("27.2", "dV/dt = −kS"), w("27.3", "dV/dt = 4πr² dr/dt"), w("27.4", "−kS = S dr/dt"), w("27.5", "dr/dt = −k")] },
  { number: "31", summary: "Correct and complete.", steps: [w("31.1", "P(A)=0.4"), w("31.2", "x=0.5"), w("31.3", "0.7")] },
];
