import { z } from "zod";
import { buildScheme } from "@/lib/schemeBuilder";
import { MissingKeyError } from "@/lib/model";

export const maxDuration = 120;

const Body = z.object({ text: z.string().min(40).max(60_000) });

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Paste the marking scheme or rubric text (at least a few lines)." }, { status: 400 });
  try {
    const scheme = await buildScheme(parsed.data.text);
    if (!scheme) return Response.json({ error: "No questions with marks were found in that text." }, { status: 422 });
    return Response.json(scheme);
  } catch (e) {
    if (e instanceof MissingKeyError) return Response.json({ error: e.message }, { status: 503 });
    console.error(e);
    return Response.json({ error: "Couldn't read that marking scheme right now." }, { status: 502 });
  }
}
