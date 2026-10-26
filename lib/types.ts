// Shared shapes for the answer book, the marking scheme and the ledger.

export type SchemeStep = {
  id: string; // e.g. "27.3"
  text: string; // what the step is, in the scheme's words
  marks: number; // ½ steps are 0.5
};

export type SchemeQuestion = {
  number: string; // "27", "28A", "28B" (internal choice)
  section: "A" | "B" | "C" | "D" | "E";
  maxMarks: number;
  prompt: string; // short version of the question
  steps: SchemeStep[]; // empty for 1-mark MCQs (all or nothing)
  answer?: string; // final answer, when the scheme gives one
  note?: string; // e.g. "full marks for any correct alternative method"
};

export type Scheme = {
  id: string;
  title: string;
  totalMarks: number;
  sources: { label: string; url: string }[];
  questions: SchemeQuestion[];
};

export type Confidence = "high" | "medium" | "low";

export type QuestionReading = {
  number: string;
  page: number; // 1-based page in the uploaded answer book
  top: number; // 0..1 position of the answer on that page
  bottom: number;
  lines: string[]; // the student's working, transcribed line by line
  examinerMark: number | null; // mark written in the margin; null if none or unreadable
  legible: boolean;
};

export type PageReading = {
  page: number;
  isCover: boolean;
  coverTotal: number | null; // total written on the cover, if this is the cover
  coverMarks?: { label: string; mark: number | null }[]; // the cover's per-question marks table
  questions: QuestionReading[];
  unreadable?: boolean;
};

export type StepVerdict =
  | "credited"
  | "written_not_credited"
  | "not_written"
  | "alternative_method";

/** What the checker saw on the page for one scheme step. */
export type StepFinding = "written" | "wrong" | "not_written" | "alternative_method";

export type CheckerResult = {
  number: string;
  steps: { id: string; found: StepFinding; evidence: string | null; confidence: Confidence }[];
  summary: string;
};

/** After plain code has matched the examiner's mark against the steps found. */
export type QuestionCheck = {
  number: string;
  steps: { id: string; verdict: StepVerdict; evidence: string | null; confidence: Confidence }[];
  summary: string; // one plain sentence
};

export type AnswerBook = {
  schemeId: string;
  pages: { page: number; src: string; width: number; height: number }[];
  readings: PageReading[];
  checks: QuestionCheck[];
  isSample?: boolean;
};

export type Stamp = "DISPUTE" | "SKIP";

export type LedgerRow = {
  number: string;
  awarded: number | null;
  max: number;
  possibleGain: number;
  confidence: Confidence;
  stamp: Stamp;
  reason: string;
  risk: string;
  selected: boolean;
};
