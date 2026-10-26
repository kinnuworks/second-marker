import type { Stamp as StampKind } from "@/lib/types";
import styles from "./Stamp.module.css";

/** A rubber stamp, like the ones on exam-office paperwork. */
export function Stamp({ kind, size = "md", animate = false }: { kind: StampKind; size?: "sm" | "md" | "lg"; animate?: boolean }) {
  const label = kind === "DISPUTE" ? "DISPUTE" : "SKIP";
  return (
    <span
      className={`${styles.stamp} ${styles[kind.toLowerCase()]} ${styles[size]} ${animate ? styles.animate : ""}`}
      role="img"
      aria-label={kind === "DISPUTE" ? "Stamped: dispute" : "Stamped: skip"}
    >
      <svg viewBox="0 0 160 56" aria-hidden="true">
        <defs>
          <filter id={`rough-${kind}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" seed={kind === "DISPUTE" ? 3 : 7} />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.55 1.05" />
            <feComposite in="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <g filter={`url(#rough-${kind})`}>
          <rect x="4" y="4" width="152" height="48" rx="6" fill="none" stroke="currentColor" strokeWidth="5" />
          <rect x="10" y="10" width="140" height="36" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text x="80" y="37" textAnchor="middle" fontSize="24" fontWeight="700" letterSpacing="4" fill="currentColor" fontFamily="var(--font-sans)">
            {label}
          </text>
        </g>
      </svg>
    </span>
  );
}
