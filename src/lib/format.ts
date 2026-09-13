import type { TripStatus, BudgetCategory } from "@/lib/mock";
import type { Enums } from "@/lib/database.types";

/** Initials from a display name, e.g. "Ysa Villanueva" -> "YV". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Compact relative time, e.g. "2h ago", "Yesterday", "3 days ago". */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Human date range, e.g. "Jun 20-22" or "Jun 30 - Jul 2". Uses a hyphen. */
export function formatDateRange(
  start: string | null,
  end: string | null,
): string {
  if (!start) return "Dates to be set";
  const s = new Date(start);
  const startLabel = `${MONTHS[s.getMonth()]} ${s.getDate()}`;
  if (!end) return startLabel;
  const e = new Date(end);
  if (s.getMonth() === e.getMonth()) {
    return `${startLabel}-${e.getDate()}`;
  }
  return `${startLabel} - ${MONTHS[e.getMonth()]} ${e.getDate()}`;
}

const statusMap: Record<Enums<"trip_status">, TripStatus> = {
  planning: "Planning",
  funding: "Funding",
  ready: "Ready",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function toViewStatus(s: Enums<"trip_status">): TripStatus {
  return statusMap[s];
}

/**
 * Categories are now free-form text. Present them nicely: turn snake_case or
 * lowercase into Title Case, leaving already-custom labels intact.
 */
export function toViewCategory(c: string): BudgetCategory {
  const cleaned = c.replace(/_/g, " ").trim();
  if (!cleaned) return "Other";
  return cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
