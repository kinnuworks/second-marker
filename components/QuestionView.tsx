import type { MergedQuestion } from "@/lib/totals";
import { fmt } from "@/lib/ledger";
import type { LedgerRow, QuestionCheck, SchemeQuestion } from "@/lib/types";
import { Stamp } from "./Stamp";
import styles from "./QuestionView.module.css";

type Page = { page: number; src: string; width: number; height: number };

const VERDICT: Record<string, { label: string; cls: string }> = {
  credited: { label: "Credited", cls: "credited" },
  written_not_credited: { label: "Written · not credited", cls: "missed" },
  not_written: { label: "Not written", cls: "absent" },
  alternative_method: { label: "Different method", cls: "alt" },
};

export function QuestionView({
  question,
  merged,
  check,
  row,
  pages,
}: {
  question: SchemeQuestion;
  merged: MergedQuestion;
  check?: QuestionCheck;
  row?: LedgerRow;
  pages: Page[];
}) {
  const missed = check?.steps.filter((s) => s.verdict === "written_not_credited") ?? [];

  return (
    <article className={styles.view} aria-labelledby={`q-${question.number}`}>
      <header className={styles.head}>
        <div>
          <h2 id={`q-${question.number}`}>
            Question {question.number} <span className={styles.max}>· {question.maxMarks} mark{question.maxMarks === 1 ? "" : "s"}</span>
          </h2>
          <p className={styles.prompt}>{question.prompt}</p>
        </div>
        {row && <Stamp kind={row.stamp} size="md" />}
      </header>

      <div className={styles.cols}>
        <figure className={styles.crops}>
          <figcaption>Your answer book</figcaption>
          {merged.parts.map((part, i) => {
            const page = pages.find((p) => p.page === part.page);
            if (!page) return null;
            const top = Math.max(0, part.top - 0.025);
            const bottom = Math.min(1, part.bottom + 0.03);
            const h = Math.max(0.06, bottom - top);
            return (
              <div key={i} className={styles.crop} style={{ aspectRatio: `${page.width} / ${h * page.height}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page.src} alt={`Page ${page.page} of the answer book, question ${question.number}`} style={{ top: `${(-top / h) * 100}%`, height: `${100 / h}%` }} />
                <span className={styles.pageTag}>p.{page.page}</span>
                {i === merged.parts.length - 1 && row && row.possibleGain > 0 && (
                  <span className={`${styles.note} hand`}>+{fmt(row.possibleGain)} missed?</span>
                )}
              </div>
            );
          })}
          <p className={styles.awarded}>
            Examiner gave <span className="hand" style={{ color: "var(--red)", fontSize: 24 }}>{merged.examinerMark === null ? "?" : fmt(merged.examinerMark)}</span> of {question.maxMarks}
          </p>
        </figure>

        <section className={styles.scheme}>
          <h3>Official marking scheme</h3>
          {question.steps.length === 0 ? (
            <p className={styles.empty}>One-mark objective question. Correct answer: {question.answer}</p>
          ) : (
            <ol className={styles.steps}>
              {question.steps.map((s) => {
                const v = check?.steps.find((x) => x.id === s.id);
                const meta = v ? VERDICT[v.verdict] : null;
                return (
                  <li key={s.id} className={`${styles.step} ${meta ? styles[meta.cls] : ""}`}>
                    <span className={`${styles.marks} num`}>{fmt(s.marks)}</span>
                    <div className={styles.body}>
                      <p className={styles.text}>{s.text}</p>
                      {v?.evidence && (
                        <p className={styles.evidence}>
                          <span className={styles.quoteMark}>on the page:</span> {v.evidence}
                        </p>
                      )}
                      {meta && (
                        <span className={styles.verdict}>
                          {meta.label}
                          {v?.verdict === "written_not_credited" && <span className="hand"> +{fmt(s.marks)}</span>}
                          {v && v.confidence !== "high" && <span className={styles.conf}> · {v.confidence} confidence</span>}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          {check?.summary && <p className={`${styles.summary} hand`}>{check.summary}</p>}
          {missed.length > 0 && row && (
            <p className={styles.cite}>
              To cite in your application: step{missed.length > 1 ? "s" : ""} {missed.map((m) => m.id).join(", ")} of the official marking scheme.
            </p>
          )}
          {question.note && <p className={styles.note2}>{question.note}</p>}
        </section>
      </div>
    </article>
  );
}
