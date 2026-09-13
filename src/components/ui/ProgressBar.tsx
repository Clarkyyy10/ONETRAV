"use client";

import { motion, useReducedMotion } from "motion/react";

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  tone?: "accent" | "success" | "warning";
  className?: string;
}

const tones = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
};

export function ProgressBar({
  value,
  label,
  tone = "accent",
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const reduce = useReducedMotion();

  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-pill bg-surface-inset ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
    >
      <motion.div
        className={`h-full rounded-pill ${tones[tone]}`}
        initial={reduce ? false : { width: 0 }}
        whileInView={{ width: `${clamped}%` }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={reduce ? { width: `${clamped}%` } : undefined}
      />
    </div>
  );
}
