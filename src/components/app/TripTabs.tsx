"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TripTabs({ tripId }: { tripId: string }) {
  const pathname = usePathname();
  const base = `/app/trips/${tripId}`;
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/itinerary`, label: "Itinerary" },
    { href: `${base}/locations`, label: "Locations" },
    { href: `${base}/budget`, label: "Budget" },
    { href: `${base}/contributions`, label: "Contributions" },
    { href: `${base}/expenses`, label: "Expenses" },
    { href: `${base}/members`, label: "Members" },
    { href: `${base}/activity`, label: "Activity" },
  ];

  return (
    <nav
      aria-label="Trip sections"
      className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-1 border-b border-border">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-block px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                  active
                    ? "text-accent"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-pill bg-accent" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
