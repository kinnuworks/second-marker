import type { PageReading, QuestionCheck, Scheme } from "@/lib/types";

export const miniScheme: Scheme = {
  id: "mini",
  title: "Mini paper",
  totalMarks: 11,
  sources: [],
  questions: [
    { number: "1", section: "A", maxMarks: 1, prompt: "MCQ", steps: [], answer: "(B)" },
    {
      number: "24", section: "B", maxMarks: 2, prompt: "f'(5)",
      steps: [
        { id: "24.1", text: "f(0) = 1", marks: 0.5 },
        { id: "24.2", text: "limit set-up", marks: 1 },
        { id: "24.3", text: "= 6", marks: 0.5 },
      ],
    },
    {
      number: "27", section: "C", maxMarks: 3, prompt: "ice ball",
      steps: [
        { id: "27.1", text: "V and S", marks: 0.5 },
        { id: "27.2", text: "dV/dt = -kS", marks: 0.5 },
        { id: "27.3", text: "differentiate V", marks: 1 },
        { id: "27.4", text: "combine", marks: 0.5 },
        { id: "27.5", text: "dr/dt = -k", marks: 0.5 },
      ],
    },
    {
      number: "28A", section: "C", maxMarks: 3, prompt: "choice A",
      steps: [{ id: "28A.1", text: "all", marks: 3 }],
    },
    {
      number: "28B", section: "C", maxMarks: 3, prompt: "choice B",
      steps: [{ id: "28B.1", text: "all", marks: 3 }],
    },
  ],
};

const q = (number: string, page: number, mark: number | null, legible = true) => ({
  number, page, top: 0.1, bottom: 0.5, lines: [`working for ${number}`], examinerMark: mark, legible,
});

export const readings = (overrides: { cover?: number | null; marks?: Record<string, number | null> } = {}): PageReading[] => {
  const m = { "1": 1, "24": 1, "27": 1.5, ...overrides.marks };
  return [
    { page: 1, isCover: true, coverTotal: overrides.cover === undefined ? 3.5 : overrides.cover, questions: [] },
    { page: 2, isCover: false, coverTotal: null, questions: [q("1", 2, m["1"]), q("24", 2, m["24"])] },
    { page: 3, isCover: false, coverTotal: null, questions: [q("27", 3, m["27"])] },
  ];
};

export const checks: QuestionCheck[] = [
  {
    number: "24", summary: "",
    steps: [
      { id: "24.1", verdict: "credited", evidence: "f(0)=1", confidence: "high" },
      { id: "24.2", verdict: "credited", evidence: "lim", confidence: "high" },
      { id: "24.3", verdict: "written_not_credited", evidence: "= 2 x 3 = 6", confidence: "high" },
    ],
  },
  {
    number: "27", summary: "",
    steps: [
      { id: "27.1", verdict: "credited", evidence: "V=4/3 pi r^3", confidence: "high" },
      { id: "27.2", verdict: "credited", evidence: "dV/dt=-kS", confidence: "high" },
      { id: "27.3", verdict: "credited", evidence: "dV/dt = 4 pi r^2 dr/dt", confidence: "high" },
      { id: "27.4", verdict: "written_not_credited", evidence: "-kS = S dr/dt", confidence: "high" },
      { id: "27.5", verdict: "written_not_credited", evidence: "dr/dt = -k", confidence: "high" },
    ],
  },
];
