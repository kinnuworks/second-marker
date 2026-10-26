import type { PreparedPage } from "@/lib/pages";
import styles from "./ReadingProgress.module.css";

export type PageState = { status: "waiting" | "reading" | "done" | "failed"; note: string };

export function ReadingProgress({
  pages,
  states,
  questions,
  onCancel,
}: {
  pages: PreparedPage[];
  states: Record<number, PageState>;
  questions: Record<string, "checking" | "done" | "failed">;
  onCancel: () => void;
}) {
  const doneCount = Object.values(states).filter((s) => s.status === "done" || s.status === "failed").length;
  const qs = Object.entries(questions);
  return (
    <section className={styles.wrap} aria-live="polite">
      <header className={styles.head}>
        <div>
          <h1>Reading your answer book</h1>
          <p>
            {doneCount < pages.length
              ? `Page ${Math.min(doneCount + 1, pages.length)} of ${pages.length}: writing down your working and the examiner's marks.`
              : qs.length
                ? `Comparing ${qs.length} answer${qs.length === 1 ? "" : "s"} with the official marking scheme, step by step.`
                : "Adding up the marks."}
          </p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      </header>
      <ol className={styles.pages}>
        {pages.map((p) => {
          const s = states[p.page] ?? { status: "waiting", note: "Waiting" };
          return (
            <li key={p.page} className={`${styles.page} ${styles[s.status]}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Page ${p.page}`} />
              <span className={styles.n}>Page {p.page}</span>
              <span className={styles.note}>{s.note}</span>
              {s.status === "reading" && <span className={styles.scan} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
      {qs.length > 0 && (
        <ul className={styles.qs}>
          {qs.map(([n, st]) => (
            <li key={n} className={styles[st]}>
              Q{n} {st === "checking" ? "…" : st === "done" ? "✓" : "✗"}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
