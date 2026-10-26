import "server-only";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getClient, requestDefaults } from "./model";
import type { PageReading, Scheme } from "./types";
import { normaliseNumber } from "./totals";

const PageSchema = z.object({
  isCover: z.boolean().describe("True if this is the answer book's cover or marks summary page."),
  coverTotal: z.number().nullable().describe("Grand total written by the examiner on the cover, or null."),
  questions: z.array(
    z.object({
      number: z.string().describe('Question number as the paper numbers it, e.g. "27", "28A". Use the previous question number if the page continues an answer without a new number.'),
      top: z.number().describe("Where this answer starts on the page, 0 = top edge, 1 = bottom edge."),
      bottom: z.number().describe("Where this answer ends on the page, 0..1."),
      lines: z.array(z.string()).describe("The student's working, transcribed line by line exactly as written, in plain-text maths."),
      examinerMark: z.number().nullable().describe("The mark the examiner wrote for this question in red ink, as a number (1½ = 1.5). Null if there is no mark or it can't be read."),
      legible: z.boolean().describe("False if the working or the mark is too unclear to read with confidence."),
    }),
  ),
});

export function readerPrompt(scheme: Scheme, page: number, previousQuestion: string | null): string {
  const list = scheme.questions.map((q) => `${q.number} (${q.maxMarks} mark${q.maxMarks === 1 ? "" : "s"})`).join(", ");
  return [
    `This is page ${page} of a scanned, examiner-marked answer book for "${scheme.title}".`,
    `Questions in this paper: ${list}. Where the paper offers a choice, the student answers one of "A" or "B"; label it by what they answered if you can tell, otherwise use the plain number.`,
    previousQuestion
      ? `The previous page ended inside or after question ${previousQuestion}. If this page starts without a new question number, that working belongs to question ${previousQuestion}.`
      : "",
    "Read it the way a careful second examiner would:",
    "- The student writes in pen. The examiner marks in red ink: ticks, crosses, and the mark for each question, usually written and often circled in the margin or at the end of the answer.",
    "- Transcribe the student's working exactly as written, one line per line, including mistakes. Do not correct, complete or tidy the maths.",
    "- Read the examiner's mark for each question. Write ½ as 0.5. If no mark is written, use null. If a mark is there but you can't read it with confidence, use null and set legible to false.",
    "- Never guess a mark or invent working that isn't on the page.",
    "- One-mark objective questions (Section A) are usually marked with a tick (1 mark) or a cross (0 marks), with a circled subtotal for the group. Report each objective question with 1 for a tick and 0 for a cross, and ignore the group subtotal.",
    "- If this is the cover page, report only the grand total the examiner wrote, and list no questions: the marks table on the cover is a copy of the marks inside.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function readPage(opts: {
  scheme: Scheme;
  page: number;
  imageBase64: string;
  mediaType: "image/jpeg" | "image/png";
  previousQuestion: string | null;
}): Promise<PageReading> {
  const res = await getClient().beta.messages.parse({
    ...requestDefaults,
    max_tokens: 16000,
    output_config: { effort: "high", format: betaZodOutputFormat(PageSchema) },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: opts.mediaType, data: opts.imageBase64 } },
          { type: "text", text: readerPrompt(opts.scheme, opts.page, opts.previousQuestion) },
        ],
      },
    ],
  });

  if (res.stop_reason === "refusal" || !res.parsed_output) {
    return { page: opts.page, isCover: false, coverTotal: null, questions: [], unreadable: true };
  }
  const out = res.parsed_output;
  return {
    page: opts.page,
    isCover: out.isCover,
    coverTotal: out.coverTotal,
    questions: out.questions.map((q) => ({
      number: normaliseNumber(q.number),
      page: opts.page,
      top: clamp01(q.top),
      bottom: clamp01(Math.max(q.bottom, q.top)),
      lines: q.lines,
      examinerMark: q.examinerMark,
      legible: q.legible,
    })),
  };
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
