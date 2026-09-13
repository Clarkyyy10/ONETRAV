import type { TripStatus } from "@/lib/mock";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-2 text-text-secondary ring-border",
  accent: "bg-accent-soft text-accent ring-transparent",
  success: "bg-success-soft text-success ring-transparent",
  warning: "bg-warning-soft text-warning ring-transparent",
  danger: "bg-danger-soft text-danger ring-transparent",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold ring-1 ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const statusTone: Record<TripStatus, Tone> = {
  Planning: "neutral",
  Funding: "accent",
  Ready: "success",
  Ongoing: "success",
  Completed: "neutral",
  Cancelled: "danger",
};

export function StatusBadge({ status }: { status: TripStatus }) {
  const tone = statusTone[status];
  return (
    <Badge tone={tone}>
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
      />
      {status}
    </Badge>
  );
}
