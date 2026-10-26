import "server-only";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getClient, requestDefaults } from "./model";
import type { Scheme } from "./types";

const Out = z.object({
  title: z.string(),
  questions: z.array(
    z.object({
      number: z.string(),
      maxMarks: z.number(),
      prompt: z.string(),
      answer: z.string().nullable(),
      steps: z.array(z.object({ text: z.string(), marks: z.number() })),
    }),
  ),
});

/** Turns a pasted marking scheme, rubric or answer key into the step-by-step form the checker uses. */
export async function buildScheme(text: string): Promise<Omit<Scheme, "rules"> | null> {
  const res = await getClient().beta.messages.parse({
    ...requestDefaults,
    max_tokens: 16000,
    output_config: { effort: "high", format: betaZodOutputFormat(Out) },
    messages: [
      {
        role: "user",
        content: [
          "Below is a marking scheme, rubric or answer key that a student pasted from their exam board, school or university.",
          "Turn it into a list of questions. For each question give its number as the paper numbers it, its maximum marks, a one-sentence summary, the final answer if one is given, and the mark-bearing steps in order: each step is what earns marks and how many.",
          "Use only what the text says. Keep its wording for each step. If a question gives only a total with no breakdown, make one step for the whole answer. The steps' marks must add up to the question's maximum.",
          "",
          text,
        ].join("\n"),
      },
    ],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output || res.parsed_output.questions.length === 0) return null;
  const out = res.parsed_output;
  return {
    id: "custom",
    title: out.title || "Your marking scheme",
    custom: true,
    sources: [],
    totalMarks: out.questions.reduce((s, q) => s + q.maxMarks, 0),
    questions: out.questions.map((q) => {
      const number = q.number.replace(/^q(uestion)?\s*/i, "").replace(/[.\s)]/g, "").toUpperCase();
      return {
        number,
        section: "B" as const,
        maxMarks: q.maxMarks,
        prompt: q.prompt,
        answer: q.answer ?? undefined,
        note: "Built from the marking scheme you pasted.",
        steps: q.steps.map((s, i) => ({ id: `${number}.${i + 1}`, text: s.text, marks: s.marks })),
      };
    }),
  };
}
