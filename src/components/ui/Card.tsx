interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Double-bezel: outer shell + inner core (machined-hardware look). */
  bezel?: boolean;
}

/**
 * Surface card. With `bezel`, wraps the content in an outer shell with a
 * hairline and small padding, and an inner core with concentric radius —
 * the "Doppelrand" nested-enclosure pattern.
 */
export function Card({ children, className = "", bezel = false }: CardProps) {
  if (bezel) {
    return (
      <div className="rounded-card bg-surface-2 p-1.5 ring-1 ring-border shadow-soft-sm">
        <div
          className={`rounded-[calc(var(--radius-card)-0.375rem)] bg-surface p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.6)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] ${className}`}
        >
          {children}
        </div>
      </div>
    );
  }
  return (
    <div
      className={`rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm ${className}`}
    >
      {children}
    </div>
  );
}
