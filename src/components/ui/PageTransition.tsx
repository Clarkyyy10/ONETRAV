"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

/**
 * Per-route entrance animation. Keyed on the pathname so every navigation
 * inside the app shell re-triggers a gentle fade + rise. Collapses to a plain
 * wrapper under prefers-reduced-motion.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();

  if (reduce) {
    return <div className="flex min-w-0 flex-1 flex-col">{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      className="flex min-w-0 flex-1 flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
