import Link from "next/link";
import { AppIcon } from "./AppIcon";

/** Floating glass pill nav. */
export function SiteHeader({ children, links }: { children?: React.ReactNode; links?: { href: string; label: string }[] }) {
  return (
    <nav className="nav no-print" aria-label="Main">
      <div className="nav__bar">
        <Link href="/" className="nav__brand" aria-label="Second Marker, home">
          <AppIcon className="app-icon" />
          <span>Second Marker</span>
        </Link>
        {links ? (
          <div className="nav__links">
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
        ) : (
          <span style={{ marginInline: "auto" }} />
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{children}</div>
      </div>
    </nav>
  );
}
