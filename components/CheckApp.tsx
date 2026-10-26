"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import scheme from "@/data/schemes/cbse-xii-maths-2025-26";
import { analyse } from "@/lib/analyse";
import { DEFAULT_FEE_PER_QUESTION } from "@/lib/ledger";
import { preparePages, PageError, type PreparedPage } from "@/lib/pages";
import { RunError, runCheck } from "@/lib/run";
import type { CheckerResult, LedgerRow, PageReading } from "@/lib/types";
import { saveSheet } from "@/lib/sheet";
import { Ledger } from "./Ledger";
import { QuestionView } from "./QuestionView";
import { ReadingProgress, type PageState } from "./ReadingProgress";
import { SiteHeader } from "./SiteHeader";
import { TotalsBanner } from "./TotalsBanner";
import { Upload } from "./Upload";
import styles from "./CheckApp.module.css";

type Page = { page: number; src: string; width: number; height: number };
type Book = { pages: Page[]; readings: PageReading[]; results: CheckerResult[]; isSample: boolean };

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
      .then((d) => live && setBook({ pages: d.pages, readings: d.readings, results: d.results, isSample: true }))
      .catch(() => live && setError("The sample couldn't be loaded. Refresh to try again."));
    return () => {
      live = false;
    };
  }, [wantsSample]);

  const start = useCallback(async (files: File[]) => {
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
        setError("No questions from the supported paper were found. This looks like a different paper, or the pages are too unclear to read.");
        return;
      }
      setBook({ pages: pages.map(({ page, url, width, height }) => ({ page, src: url, width, height })), readings, results, isSample: false });
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
    <>
      <SiteHeader>
        {book && (
          <>
            {book.isSample && <span className="tag tag--amber">Sample answer book</span>}
            <button type="button" className="btn btn--ghost" onClick={reset}>
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
    </>
  );
}

function Results({ book }: { book: Book }) {
  const router = useRouter();
  const analysis = useMemo(() => analyse(scheme, book.readings, book.results), [book]);
  const [rows, setRows] = useState<LedgerRow[]>(analysis.ledger);
  const [fee, setFee] = useState(DEFAULT_FEE_PER_QUESTION);
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
          This is a sample answer book written for this demo. The results are the saved output of the same reader and checker that runs on uploads.
        </p>
      )}
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
            fee={fee}
            onFeeChange={setFee}
            onToggle={(n) => setRows((rs) => rs.map((r) => (r.number === n ? { ...r, selected: !r.selected } : r)))}
            onOpen={openQuestion}
            openNumber={open}
            animate
          />
          <button type="button" className={`btn btn--green ${styles.sheetBtn}`} onClick={toSheet} disabled={!rows.some((r) => r.selected) && !analysis.totals.recommendVerification}>
            Make my filing sheet
          </button>
          <p className={styles.small}>
            Nothing is filed for you. The sheet lists what to apply for on the board&rsquo;s website. <Link href="/#how">How this works</Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
