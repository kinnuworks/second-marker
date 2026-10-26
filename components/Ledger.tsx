"use client";

import { fmt, summarise } from "@/lib/ledger";
import type { LedgerRow, RemarkRules } from "@/lib/types";
import { Stamp } from "./Stamp";
import styles from "./Ledger.module.css";

type Props = {
  rows: LedgerRow[];
  rules: RemarkRules;
  fee: number;
  onFeeChange: (fee: number) => void;
  onToggle: (number: string) => void;
  onOpen?: (number: string) => void;
  openNumber?: string | null;
  animate?: boolean;
};

export function Ledger({ rows, rules, fee, onFeeChange, onToggle, onOpen, openNumber, animate }: Props) {
  const s = summarise(rows, fee, rules.maxQuestions);
  const money = (n: number) => (rules.currency ? `${rules.currency}${n}` : n === 0 ? "Free" : String(n));
  const disputes = rows.filter((r) => r.stamp === "DISPUTE");
  const skips = rows.filter((r) => r.stamp === "SKIP");

  return (
    <section className={styles.ledger} aria-labelledby="ledger-title">
      <header className={styles.head}>
        <h2 id="ledger-title">What to dispute</h2>
        <p className={styles.sub}>
          {rules.feePerQuestion > 0 ? "Re-marking is paid per question" : "Every re-mark request costs you something"}
          {rules.maxQuestions ? `, capped at ${rules.maxQuestions} per subject` : ""}
          {rules.canGoDown ? ", and marks can go down as well as up" : ""}. Tick only what you&rsquo;re sure of.
        </p>
      </header>

      {disputes.length === 0 ? (
        <p className={styles.none}>
          <strong>The marking looks right.</strong> Nothing here is worth sending back for a re-mark.
        </p>
      ) : (
        <ul className={styles.list}>
          {disputes.map((r, i) => (
            <Row key={r.number} row={r} onToggle={onToggle} onOpen={onOpen} open={openNumber === r.number} animate={animate} delay={i} />
          ))}
        </ul>
      )}

      {skips.length > 0 && (
        <details className={styles.skips}>
          <summary>
            {skips.length} question{skips.length === 1 ? "" : "s"} to leave alone
          </summary>
          <ul className={styles.list}>
            {skips.map((r) => (
              <Row key={r.number} row={r} onToggle={onToggle} onOpen={onOpen} open={openNumber === r.number} />
            ))}
          </ul>
        </details>
      )}

      <footer className={styles.foot}>
        <label className={styles.fee}>
          Fee per question {rules.currency}
          <input
            type="number"
            min={0}
            step={10}
            value={fee}
            onChange={(e) => onFeeChange(Math.max(0, Number(e.target.value) || 0))}
            aria-label="Fee per question in rupees"
          />
        </label>
        <dl className={styles.totals}>
          <div>
            <dt>Questions</dt>
            <dd className="num">{s.selectedCount}</dd>
          </div>
          <div>
            <dt>Fee</dt>
            <dd className="num">{money(s.totalFee)}</dd>
          </div>
          <div>
            <dt>Possible gain</dt>
            <dd className="num hand">+{fmt(s.possibleGain)}</dd>
          </div>
        </dl>
        {s.overCap && <p className={styles.warn}>That&rsquo;s more than {rules.maxQuestions}. The board won&rsquo;t accept it.</p>}
      </footer>
    </section>
  );
}

function Row({
  row,
  onToggle,
  onOpen,
  open,
  animate,
  delay = 0,
}: {
  row: LedgerRow;
  onToggle: (n: string) => void;
  onOpen?: (n: string) => void;
  open?: boolean;
  animate?: boolean;
  delay?: number;
}) {
  const canSelect = row.stamp === "DISPUTE" || row.possibleGain > 0;
  return (
    <li className={`${styles.row} ${open ? styles.open : ""}`} style={{ animationDelay: `${delay * 140}ms` }}>
      <label className={styles.tick} title={canSelect ? "Include in my filing sheet" : "Nothing to gain here"}>
        <input type="checkbox" checked={row.selected} disabled={!canSelect} onChange={() => onToggle(row.number)} />
        <span className={styles.box} aria-hidden="true" />
        <span className="sr-only">Dispute question {row.number}</span>
      </label>
      <button type="button" className={styles.q} onClick={() => onOpen?.(row.number)} aria-label={`Open question ${row.number}`}>
        <span className={styles.qnum}>Q{row.number}</span>
        <span className={`${styles.marks} num`}>
          <span className="hand" style={{ color: "var(--red)" }}>{row.awarded === null ? "?" : fmt(row.awarded)}</span>
          <span className={styles.of}>/{row.max}</span>
          {row.possibleGain > 0 && <span className={`hand ${styles.gain}`}>+{fmt(row.possibleGain)}</span>}
        </span>
      </button>
      <div className={styles.why}>
        <p>{row.reason}</p>
        <p className={styles.risk}>
          <span>Risk:</span> {row.risk}
        </p>
      </div>
      <div className={styles.stampCell}>
        <Stamp kind={row.stamp} size="sm" animate={animate && row.stamp === "DISPUTE"} />
      </div>
    </li>
  );
}
