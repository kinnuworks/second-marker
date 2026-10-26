"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import builtIn from "@/data/schemes/cbse-xii-maths-2025-26";
import { MAX_PAGES } from "@/lib/pages";
import type { Scheme } from "@/lib/types";
import styles from "./Upload.module.css";

type Mode = "builtin" | "custom";

export function Upload({ onFiles, error }: { onFiles: (files: File[], scheme: Scheme) => void; error?: string | null }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [mode, setMode] = useState<Mode>("custom");
  const [text, setText] = useState("");
  const [board, setBoard] = useState("");
  const [currency, setCurrency] = useState("$");
  const [fee, setFee] = useState(0);
  const [cap, setCap] = useState("");
  const [custom, setCustom] = useState<Scheme | null>(null);
  const [building, setBuilding] = useState(false);
  const [schemeError, setSchemeError] = useState<string | null>(null);

  const scheme: Scheme | null =
    mode === "builtin"
      ? builtIn
      : custom && {
          ...custom,
          rules: {
            board: board.trim() || "your exam board",
            currency,
            feePerQuestion: fee,
            maxQuestions: cap ? Math.max(1, parseInt(cap, 10)) : undefined,
            canGoDown: true,
          },
        };

  const readScheme = async () => {
    setBuilding(true);
    setSchemeError(null);
    try {
      const res = await fetch("/api/build-scheme", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't read that marking scheme.");
      setCustom(data as Scheme);
    } catch (e) {
      setSchemeError(e instanceof Error ? e.message : "Couldn't read that marking scheme.");
    } finally {
      setBuilding(false);
    }
  };

  const take = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (files.length && scheme) onFiles(files, scheme);
  };

  return (
    <section className={styles.wrap}>
      <span className="eyebrow"><span className="dot" /> Check a marked paper</span>
      <h1>Which marking scheme was your paper marked against?</h1>
      <p className={styles.lede}>
        Second Marker compares your answers with the marking scheme, rubric or answer key your examiner used. Any exam works if you have the scheme.
      </p>

      <div className="segmented" role="tablist" aria-label="Marking scheme">
        <button type="button" role="tab" aria-selected={mode === "custom"} onClick={() => setMode("custom")}>Paste my own scheme</button>
        <button type="button" role="tab" aria-selected={mode === "builtin"} onClick={() => setMode("builtin")}>Built-in paper</button>
      </div>

      {mode === "builtin" ? (
        <div className={`card ${styles.paperCard}`}>
          <p className="t-title">{builtIn.title}</p>
          <p className="t-small">Official marking scheme, typed in and checked step by step. Re-marks cost ₹100 per question, up to 10 per subject.</p>
        </div>
      ) : (
        <div className={`card ${styles.paperCard}`}>
          <label className={styles.label} htmlFor="scheme-text">Marking scheme, rubric or answer key</label>
          <textarea
            id="scheme-text"
            className={styles.textarea}
            rows={8}
            placeholder={"Paste it here, for example:\nQ3 (4 marks)\n• Correct formula: 1 mark\n• Substitution: 1 mark\n• Working: 1 mark\n• Final answer with units: 1 mark"}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setCustom(null);
            }}
          />
          <div className={styles.rules}>
            <label>Board, school or university<input value={board} onChange={(e) => setBoard(e.target.value)} placeholder="e.g. IB, Cambridge, my university" /></label>
            <label>Currency<select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {["$", "£", "€", "₹", "A$", "C$", "¥", "R", "₦", ""].map((c) => <option key={c} value={c}>{c || "none"}</option>)}
            </select></label>
            <label>Fee per question<input type="number" min={0} value={fee} onChange={(e) => setFee(Math.max(0, Number(e.target.value) || 0))} /></label>
            <label>Max questions<input type="number" min={1} value={cap} onChange={(e) => setCap(e.target.value)} placeholder="no limit" /></label>
          </div>
          <div className={styles.row}>
            <button type="button" className="btn btn-ink" onClick={readScheme} disabled={building || text.trim().length < 40}>
              {building ? "Reading the scheme…" : custom ? "Read it again" : "Read my scheme"}
            </button>
            {custom && (
              <span className="pill pill--green">
                {custom.questions.length} question{custom.questions.length === 1 ? "" : "s"} · {custom.totalMarks} marks found
              </span>
            )}
          </div>
          {schemeError && <p className={styles.error} role="alert">{schemeError}</p>}
        </div>
      )}

      <button
        type="button"
        className={`${styles.drop} ${over ? styles.over : ""}`}
        disabled={!scheme}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files);
        }}
      >
        <span className={styles.big}>{scheme ? "Drop your marked paper here" : "Read your marking scheme first"}</span>
        <span className={styles.small}>The scanned copy or phone photos of each page · JPG, PNG or PDF · up to {MAX_PAGES} pages</span>
      </button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple hidden onChange={(e) => take(e.target.files)} />

      {error && <p className={styles.error} role="alert">{error}</p>}

      <p className={styles.privacy}>Pages are read to check them and are not stored. Closing this tab clears everything.</p>
      <p className={styles.alt}>
        No paper to hand? <Link href="/check?sample=1">Try the sample answer book</Link>.
      </p>
    </section>
  );
}
