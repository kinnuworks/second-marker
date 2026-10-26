"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { acceptedFile, MAX_PAGES } from "@/lib/pages";
import styles from "./Upload.module.css";

export function Upload({ onFiles, error }: { onFiles: (files: File[]) => void; error?: string | null }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const take = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (files.length) onFiles(files);
  };

  return (
    <section className={styles.wrap}>
      <h1>Check your answer book</h1>
      <p className={styles.lede}>
        Add the scanned copy of your marked answer book: the PDF the board sent, or a photo of each page.
      </p>
      <p className={styles.paper}>
        <span className="pill pill--green">Supported</span> CBSE Class 12 Mathematics, 2025–26 sample paper, with its official
        marking scheme. Other papers aren&rsquo;t supported yet.
      </p>

      <button
        type="button"
        className={`${styles.drop} ${over ? styles.over : ""}`}
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
        <span className={styles.big}>Drop the PDF or page photos here</span>
        <span className={styles.small}>or tap to choose · JPG, PNG or PDF · up to {MAX_PAGES} pages</span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        multiple
        hidden
        onChange={(e) => take(e.target.files)}
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <p className={styles.privacy}>
        Pages are read to check them and are not stored. Closing this tab clears everything.
      </p>
      <p className={styles.alt}>
        No scan to hand? <Link href="/check?sample=1">Try the sample answer book</Link>.
      </p>
    </section>
  );
}

export { acceptedFile };
