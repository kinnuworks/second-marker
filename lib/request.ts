// The re-mark request, drafted from the filing sheet. Plain code, no AI:
// every fact in it comes from the sheet, and the student fills the placeholders.
import { fmt } from "./ledger";
import type { SheetData } from "./sheet";

export function draftRequest(data: SheetData): string {
  const out: string[] = [];
  out.push(`Subject: Request to review my marks in ${data.paper}`);
  out.push("");
  out.push("Dear Sir or Madam,");
  out.push("");
  out.push(
    `My name is [your name] and my candidate number is [candidate number]. I am writing to ask ${data.board} to review my marks in ${data.paper}.`,
  );

  if (data.totals.recommendVerification) {
    out.push("");
    const mismatch = data.totals.issues.find((i) => i.kind === "total_mismatch");
    out.push(
      mismatch && mismatch.kind === "total_mismatch"
        ? `Please re-count the marks first. The marks inside my answer book add up to ${fmt(mismatch.added)}, but the total on the cover is ${fmt(mismatch.cover)}.`
        : "Please re-count the marks first. Some answers look unmarked or above the marks allowed.",
    );
  }

  if (data.rows.length > 0) {
    out.push("");
    out.push(
      data.rows.length === 1
        ? "I would also like this answer to be marked again. It includes steps from the marking scheme that do not seem to have been credited."
        : "I would also like these answers to be marked again. They include steps from the marking scheme that do not seem to have been credited.",
    );
    for (const r of data.rows) {
      out.push("");
      out.push(`Question ${r.number}: marks given ${r.awarded === null ? "[mark]" : fmt(r.awarded)} out of ${fmt(r.max)}`);
      const steps = data.steps[r.number] ?? [];
      if (steps.length === 0) out.push("- Please review this answer against the marking scheme.");
      for (const s of steps) {
        out.push(`- Scheme step ${s.id}: ${s.text}`);
        if (s.evidence) out.push(`  In my answer: "${s.evidence}"`);
      }
    }
  }

  out.push("");
  out.push("I understand that the examiners make the final decision. Thank you for your time.");
  out.push("");
  out.push("Yours faithfully,");
  out.push("[your name]");
  out.push("[candidate number]");
  out.push("[date]");
  return out.join("\n");
}
