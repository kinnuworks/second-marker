import { z } from "zod";
import scheme from "@/data/schemes/cbse-xii-maths-2025-26";
import { checkQuestion } from "@/lib/checker";
import { MissingKeyError } from "@/lib/model";

export const maxDuration = 120;

const Body = z.object({
  number: z.string().max(8),
  lines: z.array(z.string().max(500)).max(200),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const q = scheme.questions.find((x) => x.number === parsed.data.number);
  if (!q) return Response.json({ error: "That question isn't in this paper." }, { status: 404 });
  if (q.steps.length === 0) return Response.json({ number: q.number, summary: "One-mark question.", steps: [] });
  try {
    return Response.json(await checkQuestion(q, parsed.data.lines));
  } catch (e) {
    if (e instanceof MissingKeyError) return Response.json({ error: e.message }, { status: 503 });
    console.error(e);
    return Response.json({ error: "The checker is busy or unavailable right now." }, { status: 502 });
  }
}
