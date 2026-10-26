import type { TotalsReport } from "@/lib/totals";
import { fmt } from "@/lib/ledger";
import styles from "./TotalsBanner.module.css";

export function TotalsBanner({ totals }: { totals: TotalsReport }) {
  const mismatch = totals.issues.find((i) => i.kind === "total_mismatch");
  const others = totals.issues.filter((i) => i.kind !== "total_mismatch");

  return (
    <section className={`${styles.banner} ${mismatch ? styles.bad : others.length ? styles.warn : styles.ok}`} aria-live="polite">
      <div className={styles.sum}>
        <div>
          <span className={styles.label}>Cover total</span>
          <span className={`${styles.big} hand`} style={{ color: "var(--red)" }}>{totals.cover ?? "—"}</span>
        </div>
        <span className={styles.vs} aria-hidden="true">{mismatch ? "≠" : "="}</span>
        <div>
          <span className={styles.label}>Marks inside, added up</span>
          <span className={`${styles.big} hand`} style={{ color: "var(--green)" }}>{fmt(totals.added)}</span>
        </div>
      </div>
      <div className={styles.msg}>
        {mismatch && mismatch.kind === "total_mismatch" ? (
          <>
            <h2>The total doesn&rsquo;t add up.</h2>
            <p>
              The marks inside come to <strong>{fmt(mismatch.added)}</strong>, but the cover says <strong>{fmt(mismatch.cover)}</strong>.
              That&rsquo;s a totalling error. Apply for <strong>verification of marks</strong> first: it&rsquo;s cheaper than re-evaluation and it exists for exactly this.
            </p>
          </>
        ) : others.length === 0 ? (
          <>
            <h2>The totals add up.</h2>
            <p>Every mark inside is counted on the cover. Any gain has to come from re-evaluating questions.</p>
          </>
        ) : (
          <h2>The total matches, but check these:</h2>
        )}
        {others.length > 0 && (
          <ul>
            {others.map((i, k) => (
              <li key={k}>
                {i.kind === "unmarked" && <>Question {i.number} was answered but has no mark: verification covers unmarked answers.</>}
                {i.kind === "unreadable_mark" && <>The mark for question {i.number} couldn&rsquo;t be read. Check it on the page.</>}
                {i.kind === "over_max" && <>Question {i.number} got {fmt(i.mark)}, more than its {i.max} marks.</>}
                {i.kind === "both_choices" && <>Both {i.numbers[0]} and {i.numbers[1]} were answered; only one counts.</>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
