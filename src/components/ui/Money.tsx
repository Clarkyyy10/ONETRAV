"use client";

import { useEffect, useRef, useState } from "react";
import { animate as motionAnimate, useInView, useReducedMotion } from "motion/react";
import { formatPeso } from "@/lib/money";

type MoneySize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<MoneySize, string> = {
  sm: "text-base font-semibold",
  md: "text-xl font-bold",
  lg: "text-3xl font-bold",
  xl: "text-4xl sm:text-5xl font-extrabold",
};

/**
 * Currency display with strong hierarchy and tabular figures.
 * Pass `animate` to count the value up from zero when it scrolls into view
 * (used for headline figures). Static everywhere else and under
 * prefers-reduced-motion, with no SSR/CSR hydration mismatch.
 */
export function Money({
  centavos,
  size = "md",
  className = "",
  muted = false,
  animate = false,
}: {
  centavos: number;
  size?: MoneySize;
  className?: string;
  muted?: boolean;
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  // Initial state depends only on `animate` (stable across server/client).
  const [display, setDisplay] = useState(animate ? 0 : centavos);

  useEffect(() => {
    if (!animate || reduce) {
      setDisplay(centavos);
      return;
    }
    if (!inView) return;
    const controls = motionAnimate(0, centavos, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [animate, reduce, inView, centavos]);

  return (
    <span
      ref={ref}
      className={`tnum ${sizeClasses[size]} ${muted ? "text-text-muted" : ""} ${className}`}
    >
      {formatPeso(display)}
    </span>
  );
}
