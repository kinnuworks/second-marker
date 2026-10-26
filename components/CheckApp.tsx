"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import builtIn from "@/data/schemes/cbse-xii-maths-2025-26";
import { analyse } from "@/lib/analyse";
import { fmt, rulesFor, summarise } from "@/lib/ledger";
import { preparePages, PageError, type PreparedPage } from "@/lib/pages";
import { RunError, runCheck } from "@/lib/run";
import type { CheckerResult, LedgerRow, PageReading, RemarkRules, Scheme } from "@/lib/types";
import { saveSheet } from "@/lib/sheet";
import { Ledger } from "./Ledger";
import { QuestionView } from "./QuestionView";
import { ReadingProgress, type PageState } from "./ReadingProgress";
import { SiteHeader } from "./SiteHeader";
import { TotalsBanner } from "./TotalsBanner";
import { Upload } from "./Upload";
import styles from "./CheckApp.module.css";

type Page = { page: number; src: string; width: number; height: number };
type Book = { scheme: Scheme; pages: Page[]; readings: PageReading[]; results: CheckerResult[]; isSample: boolean; sampleFromReader?: boolean };

export function CheckApp() {
  const params = useSearchParams();
  const router = useRouter();
  const wantsSample = params.get("sample") === "1";

  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prepared, setPrepared] = useState<PreparedPage[] | null>(null);
  const [pageStates, setPageStates] = useState<Record<number, PageState>>({});
  const [questionStates, setQuestionStates] = useState<Record<string, "checking" | "done" | "failed">>({});
  const abort = useRef<AbortController | null>(null);

  // Sample: the saved output of the same reader and checker, so it opens instantly.
  useEffect(() => {
    if (!wantsSample) return;
    let live = true;
    fetch("/sample/result.json")
      .then((r) => r.json())
      .then((d) => live && setBook({ scheme: builtIn, pages: d.pages, readings: d.readings, results: d.results, isSample: true, sampleFromReader: !String(d.about).includes("TEMPORARY") }))
      .catch(() => live && setError("The sample couldn't be loaded. Refresh to try again."));
    return () => {
      live = false;
    };
  }, [wantsSample]);

  const start = useCallback(async (files: File[], scheme: Scheme) => {
    setError(null);
    let pages: PreparedPage[];
    try {
      pages = await preparePages(files);
    } catch (e) {
      setError(e instanceof PageError ? e.message : "Those files couldn't be opened.");
      return;
    }
    setPrepared(pages);
    setPageStates(Object.fromEntries(pages.map((p) => [p.page, { status: "waiting", note: "Waiting" }])));
    setQuestionStates({});
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const { readings, results } = await runCheck(
        scheme,
        pages,
        (p) => {
          if (p.kind === "page") setPageStates((s) => ({ ...s, [p.page]: { status: p.status, note: p.note } }));
          else setQuestionStates((s) => ({ ...s, [p.number]: p.status }));
        },
        ctrl.signal,
      );
      const found = readings.flatMap((r) => r.questions).filter((q) => scheme.questions.some((s) => s.number === q.number));
      if (found.length === 0) {
        setPrepared(null);
        setError("No questions from the chosen marking scheme were found. Check you picked the right paper, or the pages may be too unclear to read.");
        return;
      }
      setBook({ scheme, pages: pages.map(({ page, url, width, height }) => ({ page, src: url, width, height })), readings, results, isSample: false });
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setPrepared(null);
      setError(
        e instanceof RunError && e.status === 503
          ? "Live checking isn't switched on for this site yet. You can still try the sample answer book."
          : e instanceof RunError
            ? `${e.message} Your pages weren't kept. Try again in a minute, or try the sample.`
            : "Something went wrong while reading. Try again, or try the sample.",
      );
    }
  }, []);

  const cancel = () => {
    abort.current?.abort();
    setPrepared(null);
  };

  const reset = () => {
    abort.current?.abort();
    setBook(null);
    setPrepared(null);
    setError(null);
    router.push("/check");
  };

  return (
    <div className="app-shell">
      <SiteHeader>
        {book && (
          <>
            {book.isSample && <span className="pill pill--amber">Sample answer book</span>}
            <button type="button" className="btn btn-outline" onClick={reset}>
              Check another
            </button>
          </>
        )}
      </SiteHeader>
      <main className={`wrap ${styles.main}`}>
        {book ? (
          <Results book={book} />
        ) : prepared ? (
          <ReadingProgress pages={prepared} states={pageStates} questions={questionStates} onCancel={cancel} />
        ) : wantsSample && !error ? (
          <p className={styles.loading}>Opening the sample answer book…</p>
        ) : (
          <Upload onFiles={start} error={error} />
        )}
      </main>
    </div>
  );
}

function Results({ book }: { book: Book }) {
  const router = useRouter();
  const scheme = book.scheme;
  const rules = rulesFor(scheme);
  const analysis = useMemo(() => analyse(scheme, book.readings, book.results), [book]);
  const [rows, setRows] = useState<LedgerRow[]>(analysis.ledger);
  const [fee, setFee] = useState(rules.feePerQuestion);
  const firstDispute = analysis.ledger.find((r) => r.stamp === "DISPUTE")?.number;
  const [open, setOpen] = useState<string | null>(firstDispute ?? analysis.merged.find((m) => scheme.questions.find((q) => q.number === m.number)?.steps.length)?.number ?? null);
  const viewRef = useRef<HTMLDivElement>(null);

  const openQuestion = (n: string) => {
    setOpen(n);
    if (window.matchMedia("(max-width: 1100px)").matches) viewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sq = scheme.questions.find((q) => q.number === open);
  const merged = analysis.merged.find((m) => m.number === open);
  const unreadablePages = book.readings.filter((r) => r.unreadable).map((r) => r.page);
  const longAnswers = analysis.merged.filter((m) => scheme.questions.find((q) => q.number === m.number)?.steps.length);

  const toSheet = () => {
    saveSheet({
      paper: scheme.title,
      isSample: book.isSample,
      fee,
      currency: rules.currency,
      board: rules.board,
      totals: analysis.totals,
      rows: rows.filter((r) => r.selected),
      steps: Object.fromEntries(
        analysis.checks.map((c) => [
          c.number,
          c.steps
            .filter((s) => s.verdict === "written_not_credited")
            .map((s) => ({ id: s.id, text: scheme.questions.find((q) => q.number === c.number)?.steps.find((x) => x.id === s.id)?.text ?? "" })),
        ]),
      ),
    });
    router.push("/check/sheet");
  };

  return (
    <div className={styles.results}>
      {book.isSample && (
        <p className={styles.sampleNote}>
          This is a sample answer book written for this demo.
          {book.sampleFromReader ? " The results are the saved output of the same reader and checker that runs on uploads." : ""}
        </p>
      )}
      <Verdict rows={rows} rules={rules} recount={analysis.totals.recommendVerification} />
      <TotalsBanner totals={analysis.totals} />
      {unreadablePages.length > 0 && (
        <p className={styles.warn} role="status">
          Page{unreadablePages.length > 1 ? "s" : ""} {unreadablePages.join(", ")} couldn&rsquo;t be read. Results below cover the rest; check those pages yourself.
        </p>
      )}

      <div className={styles.grid}>
        <div ref={viewRef} className={styles.left}>
          <nav className={styles.tabs} aria-label="Questions">
            {longAnswers.map((m) => {
              const r = rows.find((x) => x.number === m.number);
              return (
                <button
                  key={m.number}
                  type="button"
                  className={`${styles.tab} ${open === m.number ? styles.tabOn : ""} ${r?.stamp === "DISPUTE" ? styles.tabDispute : ""}`}
                  onClick={() => openQuestion(m.number)}
                  aria-current={open === m.number}
                >
                  Q{m.number}
                </button>
              );
            })}
          </nav>
          {sq && merged ? (
            <QuestionView
              key={sq.number}
              question={sq}
              merged={merged}
              check={analysis.checks.find((c) => c.number === sq.number)}
              row={rows.find((r) => r.number === sq.number)}
              pages={book.pages}
            />
          ) : (
            <p className={styles.loading}>Pick a question to see it next to the scheme.</p>
          )}
        </div>

        <aside className={styles.right}>
          <Ledger
            rows={rows}
            rules={rules}
            fee={fee}
            onFeeChange={setFee}
            onToggle={(n) => setRows((rs) => rs.map((r) => (r.number === n ? { ...r, selected: !r.selected } : r)))}
            onOpen={openQuestion}
            openNumber={open}
            animate
          />
          <button type="button" className={`btn btn-candy ${styles.sheetBtn}`} onClick={toSheet} disabled={!rows.some((r) => r.selected) && !analysis.totals.recommendVerification}>
            Make my filing sheet
          </button>
          <p className={styles.small}>
            Nothing is sent for you. The sheet lists what to ask for and why. <Link href="/#how">How this works</Link>
          </p>
        </aside>
      </div>
    </div>
  );
}

/** The answer in one line, before any detail. */
function Verdict({ rows, rules, recount }: { rows: LedgerRow[]; rules: RemarkRules; recount: boolean }) {
  const disputes = rows.filter((r) => r.stamp === "DISPUTE");
  const s = summarise(rows.filter((r) => r.stamp === "DISPUTE"), rules.feePerQuestion, rules.maxQuestions);
  return (
    <section className={styles.verdict} aria-live="polite">
      <p className={styles.verdictLine}>
        {disputes.length > 0 ? (
          <>
            Send back <strong>{disputes.length} question{disputes.length === 1 ? "" : "s"}</strong>{" "}
            for up to <span className="hand" style={{ color: "var(--green)", fontWeight: 700 }}>+{fmt(s.possibleGain)}</span> marks
            {rules.feePerQuestion > 0 && <> for {rules.currency}{disputes.length * rules.feePerQuestion}</>}
            {recount && <>, and ask for a <strong>re-count</strong> first</>}.
          </>
        ) : recount ? (
          <>Ask for a <strong>re-count</strong>: the marks don&rsquo;t add up. No single question is worth a re-mark.</>
        ) : (
          <>The marking looks right. <strong>Keep your money.</strong></>
        )}
      </p>
      <p className={styles.verdictSub}>
        Leave {rows.length - disputes.length} question{rows.length - disputes.length === 1 ? "" : "s"} alone. These are signals from your own page, not a promise: examiners decide, and a re-mark can go either way.
      </p>
    </section>
  );
}
