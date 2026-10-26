import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className={`${styles.bar} no-print`}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Second Marker, home">
          <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="12" fill="#FDFDF8" />
            <path d="M10 18h44M10 30h44M10 42h44M10 54h44" stroke="#CFE3EE" strokeWidth="2" />
            <path d="M18 6v58" stroke="#E6A3A3" strokeWidth="2" />
            <path d="M26 34l7 8 16-20" fill="none" stroke="#0B6E4F" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Second Marker</span>
        </Link>
        <div className={styles.right}>{children}</div>
      </div>
    </header>
  );
}
