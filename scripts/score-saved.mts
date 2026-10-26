// Scores the saved sample result (public/sample/result.json) against eval/sample-key.json
// without calling the API again. Run: npx tsx scripts/score-saved.mts
import { readFileSync } from "node:fs";
import schemeModule from "../data/schemes/cbse-xii-maths-2025-26";
import { analyse } from "../lib/analyse";
const scheme = ((schemeModule as unknown as { default?: typeof schemeModule }).default ?? schemeModule);
const key = JSON.parse(readFileSync("eval/sample-key.json", "utf8"));
const saved = JSON.parse(readFileSync("public/sample/result.json", "utf8"));
const a = analyse(scheme, saved.readings, saved.results);
let hit = 0, tot = 0;
const miss: string[] = [];
const check = (label: string, ok: boolean) => { tot++; if (ok) hit++; else miss.push(label); };
check("cover total", a.totals.cover === key.coverTotal);
for (const [n, m] of Object.entries(key.marks)) check(`mark Q${n}`, a.merged.find((q) => q.number === n)?.examinerMark === m);
for (const [n, steps] of Object.entries(key.steps as Record<string, Record<string, string>>))
  for (const [id, f] of Object.entries(steps)) check(`step ${id}`, saved.results.find((r: { number: string }) => r.number === n)?.steps.find((s: { id: string }) => s.id === id)?.found === f);
for (const [n, s] of Object.entries(key.expectedStamps)) check(`stamp Q${n}`, a.ledger.find((r) => r.number === n)?.stamp === s);
check("verification recommended", a.totals.recommendVerification === key.expectVerification);
console.log(`${hit}/${tot} correct (${Math.round((100 * hit) / tot)}%)`);
if (miss.length) console.log("missed:", miss.join(", "));
console.log("issues:", JSON.stringify(a.totals.issues));
console.log("ledger:", a.ledger.filter((r) => r.stamp === "DISPUTE").map((r) => `Q${r.number} +${r.possibleGain}`).join(", "));
