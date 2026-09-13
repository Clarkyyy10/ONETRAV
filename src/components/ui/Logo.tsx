/**
 * ONETRAVEL mark — two overlapping rings ("together"), a single simple
 * geometric brand mark. Uses currentColor + the accent token so it works
 * in light and dark.
 */
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[0.7rem] bg-accent text-accent-fg ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-[62%] w-[62%]"
        stroke="currentColor"
        strokeWidth={2.1}
      >
        <circle cx="9" cy="12" r="5.2" />
        <circle cx="15" cy="12" r="5.2" opacity={0.65} />
      </svg>
    </span>
  );
}
