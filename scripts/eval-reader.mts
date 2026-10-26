// Measures how well the reader and checker do on the demo answer book,
// against the answer key in eval/sample-key.json.
// Run: npm run eval
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import schemeModule from "../data/schemes/cbse-xii-maths-2025-26";
const scheme = ((schemeModule as unknown as { default?: typeof schemeModule }).default ?? schemeModule);
import { analyse } from "../lib/analyse";
import { mergeReadings } from "../lib/totals";
import { runPipeline } from "./pipeline.mts";

const dir = "public/sample/pages";
const key = JSON.parse(readFileSync("eval/sample-key.json", "utf8"));
const files = readdirSync(dir).filter((f) => /\.(jpe?g|png)$/.test(f)).sort().map((f) => path.join(dir, f));

const runs = Number(process.argv[2] ?? 1);
let markHits = 0, markTotal = 0, stepHits = 0, stepTotal = 0, stampHits = 0, stampTotal = 0, coverHits = 0;

for (let run = 1; run <= runs; run++) {
  console.log(`\n— run ${run} —`);
  const { readings, results } = await runPipeline(scheme, files);
  const merged = mergeReadings(readings);
  const a = analyse(scheme, readings, results);

  if (a.totals.cover === key.coverTotal) coverHits++;
  for (const [n, mark] of Object.entries(key.marks)) {
    markTotal++;
    const got = merged.find((m) => m.number === n)?.examinerMark;
    if (got === mark) markHits++;
    else console.log(`  ✗ mark Q${n}: expected ${mark}, read ${got}`);
  }
  for (const [n, steps] of Object.entries(key.steps as Record<string, Record<string, string>>)) {
    const r = results.find((x) => x.number === n);
    for (const [id, found] of Object.entries(steps)) {
      stepTotal++;
      const got = r?.steps.find((s) => s.id === id)?.found;
      if (got === found) stepHits++;
      else console.log(`  ✗ step ${id}: expected ${found}, got ${got}`);
    }
  }
  for (const [n, stamp] of Object.entries(key.expectedStamps)) {
    stampTotal++;
    const got = a.ledger.find((r) => r.number === n)?.stamp;
    if (got === stamp) stampHits++;
    else console.log(`  ✗ stamp Q${n}: expected ${stamp}, got ${got}`);
  }
  console.log(`  verification recommended: ${a.totals.recommendVerification} (expected ${key.expectVerification})`);
}

const pct = (a: number, b: number) => `${a}/${b} (${Math.round((100 * a) / b)}%)`;
console.log(`\nAccuracy over ${runs} run(s)`);
console.log(`  cover total read:  ${pct(coverHits, runs)}`);
console.log(`  examiner marks:    ${pct(markHits, markTotal)}`);
console.log(`  scheme steps:      ${pct(stepHits, stepTotal)}`);
console.log(`  final stamps:      ${pct(stampHits, stampTotal)}`);
