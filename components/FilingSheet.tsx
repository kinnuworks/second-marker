"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/ledger";
import { loadSheet, type SheetData } from "@/lib/sheet";
import { SiteHeader } from "./SiteHeader";
import { Stamp } from "./Stamp";
import styles from "./FilingSheet.module.css";

export function FilingSheet() {
  const [data, setData] = useState<SheetData | null | undefined>(undefined);
  useEffect(() => setData(loadSheet()), []);

  if (data === undefined) return null;

  if (data === null) {
    return (
      <>
        <SiteHeader />
        <main className="wrap" style={{ padding: "40px 20px" }}>
          <p>There&rsquo;s no filing sheet yet. <Link href="/check">Check an answer book</Link> first.</p>
        </main>
      </>
    );
  }

  const gain = data.rows.reduce((s, r) => s + r.possibleGain, 0);
  const mismatch = data.totals.issues.find((i) => i.kind === "total_mismatch");
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <SiteHeader>
        <Link href="/check?sample=1" className="btn btn--ghost" onClick={(e) => { if (!data.isSample) { e.preventDefault(); history.back(); } }}>
          Back to results
        </Link>
        <button type="button" className="btn" onClick={() => window.print()}>
          Print
        </button>
      </SiteHeader>
      <main className={styles.desk}>
        <article className={styles.sheet}>
          <header className={styles.head}>
            <div>
              <p className={styles.kicker}>Second Marker · filing sheet</p>
              <h1>What to apply for</h1>
              <p className={styles.meta}>{data.paper} · prepared {today}</p>
            </div>
            {data.isSample && <span className={`${styles.sample} tag tag--amber`}>Sample answer book</span>}
          </header>

          <section className={styles.block}>
            <h2><span className={styles.n}>1</span> Verification of marks</h2>
            {data.totals.recommendVerification ? (
              <>
                <p>
                  <strong>Apply for this first.</strong>{" "}
                  {mismatch && mismatch.kind === "total_mismatch"
                    ? `The marks inside add up to ${fmt(mismatch.added)}, but the cover total is ${fmt(mismatch.cover)}.`
                    : "Some answers look unmarked or over the limit."}{" "}
                  Verification checks totalling and unmarked answers, and costs less than re-evaluation.
                </p>
                <div className={styles.stampRow}><Stamp kind="DISPUTE" size="sm" /> <span>Totalling error</span></div>
              </>
            ) : (
              <p>Not needed: the marks inside add up to the cover total ({fmt(data.totals.added)}).</p>
            )}
          </section>

          <section className={styles.block}>
            <h2><span className={styles.n}>2</span> Re-evaluation of these questions</h2>
            {data.rows.length === 0 ? (
              <p>No questions selected. Based on the marking scheme, re-evaluation isn&rsquo;t worth paying for.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Marks given</th>
                    <th>Scheme steps to cite</th>
                    <th>Could gain</th>
                    <th>Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.number}>
                      <td className={styles.q}>Q{r.number}</td>
                      <td className="num"><span className="hand" style={{ color: "var(--red)" }}>{r.awarded === null ? "?" : fmt(r.awarded)}</span> / {r.max}</td>
                      <td>
                        {(data.steps[r.number] ?? []).map((s) => (
                          <div key={s.id} className={styles.cite}><strong>{s.id}</strong> {s.text}</div>
                        ))}
                      </td>
                      <td className="num hand" style={{ color: "var(--green)", fontSize: 22 }}>+{fmt(r.possibleGain)}</td>
                      <td className="num">₹{data.fee}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>{data.rows.length} question{data.rows.length === 1 ? "" : "s"} (the limit is 10 per subject)</td>
                    <td className="num hand" style={{ color: "var(--green)", fontSize: 22 }}>+{fmt(gain)}</td>
                    <td className="num"><strong>₹{data.rows.length * data.fee}</strong></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </section>

          <section className={styles.block}>
            <h2><span className={styles.n}>3</span> Before you pay</h2>
            <ul className={styles.list}>
              <li>Apply on the board&rsquo;s post-result portal, inside its dates. Late or offline applications aren&rsquo;t accepted.</li>
              <li>Re-evaluation can lower a mark as well as raise it. Only file questions where the missed steps are clearly on your page.</li>
              <li>Show this sheet and your scanned copy to a subject teacher if you can. A second pair of eyes is cheap.</li>
              <li>Fees and dates change each year: check the board&rsquo;s current notice before paying.</li>
            </ul>
          </section>

          <footer className={styles.foot}>
            Second Marker compares your answer book with the official marking scheme. It gives evidence, not a guaranteed result: the board makes the final decision.
          </footer>
        </article>
      </main>
    </>
  );
}
