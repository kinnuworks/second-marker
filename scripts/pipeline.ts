// Runs the real reader and checker over a set of page images, the same way the
// website does, but from the command line.
import { readFileSync } from "node:fs";
import { readPage } from "../lib/reader";
import { checkQuestion } from "../lib/checker";
import { mergeReadings } from "../lib/totals";
import type { CheckerResult, PageReading, Scheme } from "../lib/types";

export async function runPipeline(scheme: Scheme, files: string[], log = console.log) {
  const readings: PageReading[] = [];
  let previous: string | null = null;
  for (const [i, file] of files.entries()) {
    const t = Date.now();
    const r = await readPage({
      scheme,
      page: i + 1,
      imageBase64: readFileSync(file).toString("base64"),
      mediaType: file.endsWith(".png") ? "image/png" : "image/jpeg",
      previousQuestion: previous,
    });
    readings.push(r);
    previous = r.questions.at(-1)?.number ?? previous;
    log(`page ${i + 1}: ${r.isCover ? `cover, total ${r.coverTotal}` : r.questions.map((q) => `Q${q.number}=${q.examinerMark}`).join(" ")}  (${((Date.now() - t) / 1000).toFixed(1)}s)`);
  }

  const merged = mergeReadings(readings);
  const results: CheckerResult[] = await Promise.all(
    merged
      .map((m) => ({ m, q: scheme.questions.find((q) => q.number === m.number) }))
      .filter((x) => x.q && x.q.steps.length > 0)
      .map(({ m, q }) => checkQuestion(q!, m.lines)),
  );
  for (const r of results) log(`Q${r.number}: ${r.steps.map((s) => `${s.id}=${s.found}`).join(" ")}`);
  return { readings, results };
}
