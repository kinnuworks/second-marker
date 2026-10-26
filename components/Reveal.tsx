"use client";

import { useEffect, useRef, useState } from "react";

/** Fades a block in when it scrolls into view. Visible by default if JS or IO is missing. */
export function Reveal({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "in">("idle");
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setState("hidden");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={
        state === "idle"
          ? undefined
          : {
              opacity: state === "in" ? 1 : 0,
              transform: state === "in" ? "none" : "translateY(14px)",
              transition: "opacity .7s var(--ease-out), transform .7s var(--ease-out)",
            }
      }
    >
      {children}
    </div>
  );
}
