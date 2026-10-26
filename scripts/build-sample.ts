// Runs the real reader and checker on the demo answer book and saves the
// result, so the sample opens instantly and the same way for everyone.
// Run: npm run sample
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import scheme from "../data/schemes/cbse-xii-maths-2025-26";
import { runPipeline } from "./pipeline";

const dir = "public/sample/pages";
const files = readdirSync(dir).filter((f) => /\.(jpe?g)$/.test(f)).sort();
const { readings, results } = await runPipeline(scheme, files.map((f) => path.join(dir, f)));

const saved = {
  about: "Saved output of the reader and checker on the demo answer book (scripts/build-sample.ts). Not a real student's answer book.",
  schemeId: scheme.id,
  createdAt: new Date().toISOString(),
  pages: files.map((f, i) => ({ page: i + 1, src: `/sample/pages/${f}`, width: 1240, height: 1754 })),
  readings,
  results,
};
writeFileSync("public/sample/result.json", JSON.stringify(saved, null, 2));
console.log("saved public/sample/result.json");
