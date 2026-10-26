import type { Stamp as StampKind } from "@/lib/types";
import styles from "./Stamp.module.css";

/** A rubber stamp, like the ones on exam-office paperwork. */
export function Stamp({ kind, size = "md", animate = false }: { kind: StampKind; size?: "sm" | "md" | "lg"; animate?: boolean }) {
  const label = kind === "DISPUTE" ? "WORTH ASKING" : "LEAVE IT";
  return (
    <span
      className={`${styles.stamp} ${styles[kind.toLowerCase()]} ${styles[size]} ${animate ? styles.animate : ""}`}
      role="img"
      aria-label={kind === "DISPUTE" ? "Stamped: worth asking for a re-mark" : "Stamped: leave it"}
    >
      <svg viewBox="0 0 200 56" aria-hidden="true">
        <defs>
          <filter id={`rough-${kind}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" seed={kind === "DISPUTE" ? 3 : 7} />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.55 1.05" />
            <feComposite in="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <g filter={`url(#rough-${kind})`}>
          <rect x="4" y="4" width="192" height="48" rx="6" fill="none" stroke="currentColor" strokeWidth="5" />
          <rect x="10" y="10" width="180" height="36" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text x="100" y="37" textAnchor="middle" fontSize="18" fontWeight="700" letterSpacing="1.5" fill="currentColor" fontFamily="var(--font-display)">
            {label}
          </text>
        </g>
      </svg>
    </span>
  );
}
