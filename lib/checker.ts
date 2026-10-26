import "server-only";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getClient, requestDefaults } from "./model";
import type { CheckerResult, SchemeQuestion } from "./types";

const CheckSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string(),
      found: z.enum(["written", "wrong", "not_written", "alternative_method"]),
      evidence: z.string().nullable().describe("The student's own line that shows this step, copied exactly. Null if not written."),
      confidence: z.enum(["high", "medium", "low"]),
    }),
  ),
  summary: z.string().describe("One plain sentence a student would understand."),
});

export function checkerPrompt(q: SchemeQuestion, lines: string[]): string {
  const steps = q.steps.map((s) => `- ${s.id} (${s.marks} mark${s.marks === 1 ? "" : "s"}): ${s.text}`).join("\n");
  return [
    `Official marking scheme, question ${q.number} (${q.maxMarks} marks): ${q.prompt}`,
    q.answer ? `Final answer: ${q.answer}` : "",
    `Mark-bearing steps:\n${steps}`,
    q.note ? `Scheme note: ${q.note}` : "",
    `The student's working, transcribed from their answer book:\n${lines.map((l) => `| ${l}`).join("\n")}`,
    "For each step, say whether the student's working shows it:",
    '- "written": the step is there and mathematically correct. Equivalent forms count (different letters, order or notation).',
    '- "wrong": the student attempted this step but it contains a mistake.',
    '- "not_written": the step is missing.',
    '- "alternative_method": the student reached this point correctly by a different valid method.',
    "Quote the exact student line as evidence. Judge only what is written; do not give credit for steps you have to imagine. Use low confidence when the transcription is ambiguous.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function checkQuestion(q: SchemeQuestion, lines: string[]): Promise<CheckerResult> {
  const res = await getClient().beta.messages.parse({
    ...requestDefaults,
    max_tokens: 16000,
    output_config: { effort: "high", format: betaZodOutputFormat(CheckSchema) },
    messages: [{ role: "user", content: checkerPrompt(q, lines) }],
  });

  if (res.stop_reason === "refusal" || !res.parsed_output) {
    return {
      number: q.number,
      summary: "This question couldn't be checked.",
      steps: q.steps.map((s) => ({ id: s.id, found: "not_written", evidence: null, confidence: "low" })),
    };
  }
  // Keep only steps that exist in the scheme, in scheme order.
  const out = res.parsed_output;
  return {
    number: q.number,
    summary: out.summary,
    steps: q.steps.map((s) => {
      const f = out.steps.find((x) => x.id === s.id);
      return f ?? { id: s.id, found: "not_written", evidence: null, confidence: "low" };
    }),
  };
}
