import { z } from "zod";
import scheme from "@/data/schemes/cbse-xii-maths-2025-26";
import { readPage } from "@/lib/reader";
import { MissingKeyError } from "@/lib/model";

export const maxDuration = 120;

const Body = z.object({
  page: z.number().int().min(1).max(40),
  image: z.string().min(100).max(8_000_000), // base64, ~6 MB cap
  mediaType: z.enum(["image/jpeg", "image/png"]),
  previousQuestion: z.string().max(8).nullable(),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "That page couldn't be sent. Try a JPG or PNG under 6 MB." }, { status: 400 });
  try {
    const reading = await readPage({
      scheme,
      page: parsed.data.page,
      imageBase64: parsed.data.image,
      mediaType: parsed.data.mediaType,
      previousQuestion: parsed.data.previousQuestion,
    });
    return Response.json(reading);
  } catch (e) {
    return errorResponse(e);
  }
}

function errorResponse(e: unknown) {
  if (e instanceof MissingKeyError) return Response.json({ error: e.message }, { status: 503 });
  console.error(e);
  return Response.json({ error: "The reader is busy or unavailable right now." }, { status: 502 });
}
