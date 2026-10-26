import { z } from "zod";

// Validation for marking schemes that arrive from the browser (custom rubrics).
export const StepZ = z.object({ id: z.string().max(16), text: z.string().max(600), marks: z.number().min(0).max(100) });
export const QuestionZ = z.object({
  number: z.string().max(8),
  section: z.string().max(4).default("B"),
  maxMarks: z.number().min(0).max(200),
  prompt: z.string().max(600),
  steps: z.array(StepZ).max(40),
  answer: z.string().max(300).optional(),
  note: z.string().max(600).optional(),
});
export const RulesZ = z.object({
  board: z.string().max(80),
  currency: z.string().max(4),
  feePerQuestion: z.number().min(0).max(100000),
  maxQuestions: z.number().int().min(1).max(200).optional(),
  canGoDown: z.boolean(),
});
export const SchemeZ = z.object({
  id: z.string().max(80),
  title: z.string().max(200),
  totalMarks: z.number().min(0).max(1000),
  rules: RulesZ.optional(),
  custom: z.boolean().optional(),
  sources: z.array(z.object({ label: z.string().max(100), url: z.string().max(400) })).max(5).default([]),
  questions: z.array(QuestionZ).min(1).max(80),
});
