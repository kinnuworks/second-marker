// Drives a live check from the browser: read each page in order, then check
// every question against the scheme. Reports progress as it goes.
import type { PreparedPage } from "./pages";
import { mergeReadings } from "./totals";
import type { CheckerResult, PageReading, Scheme } from "./types";

export type Progress =
  | { kind: "page"; page: number; status: "reading" | "done" | "failed"; note: string }
  | { kind: "question"; number: string; status: "checking" | "done" | "failed" };

export class RunError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function post<T>(url: string, body: unknown, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new RunError(data.error ?? "Something went wrong.", res.status);
  return data as T;
}

export async function runCheck(
  scheme: Scheme,
  pages: PreparedPage[],
  onProgress: (p: Progress) => void,
  signal: AbortSignal,
): Promise<{ readings: PageReading[]; results: CheckerResult[] }> {
  const readings: PageReading[] = [];
  let previous: string | null = null;
  let failures = 0;

  for (const p of pages) {
    onProgress({ kind: "page", page: p.page, status: "reading", note: "Reading…" });
    try {
      const r: PageReading = await post<PageReading>("/api/read-page", { page: p.page, image: p.base64, mediaType: "image/jpeg", previousQuestion: previous, scheme: scheme.custom ? scheme : undefined }, signal);
      readings.push(r);
      previous = r.questions.at(-1)?.number ?? previous;
      onProgress({ kind: "page", page: p.page, status: r.unreadable ? "failed" : "done", note: describe(r) });
    } catch (e) {
      if (signal.aborted) throw e;
      // A missing key or a down service will fail every page: stop early.
      if (e instanceof RunError && (e.status === 503 || e.status === 400)) throw e;
      failures++;
      readings.push({ page: p.page, isCover: false, coverTotal: null, questions: [], unreadable: true });
      onProgress({ kind: "page", page: p.page, status: "failed", note: "Couldn't read this page." });
      if (failures >= 2 && failures === readings.length) throw new RunError("The reader is unavailable right now.");
    }
  }

  const merged = mergeReadings(readings).filter((m) => scheme.questions.find((q) => q.number === m.number)?.steps.length);
  const results: CheckerResult[] = [];
  const queue = [...merged];
  const worker = async () => {
    for (let m = queue.shift(); m; m = queue.shift()) {
      onProgress({ kind: "question", number: m.number, status: "checking" });
      try {
        results.push(await post<CheckerResult>("/api/check-question", { number: m.number, lines: m.lines, question: scheme.custom ? scheme.questions.find((q) => q.number === m.number) : undefined }, signal));
        onProgress({ kind: "question", number: m.number, status: "done" });
      } catch (e) {
        if (signal.aborted) throw e;
        onProgress({ kind: "question", number: m.number, status: "failed" });
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return { readings, results };
}

function describe(r: PageReading): string {
  if (r.unreadable) return "Couldn't read this page.";
  if (r.isCover) return r.coverTotal !== null ? `Cover · total ${r.coverTotal}` : "Cover";
  if (r.questions.length === 0) return "No answers on this page.";
  return r.questions.map((q) => `Q${q.number}${q.examinerMark !== null ? ` · ${q.examinerMark}` : ""}`).join(", ");
}
