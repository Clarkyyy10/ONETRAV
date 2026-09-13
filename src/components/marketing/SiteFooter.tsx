import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const groups = [
  {
    heading: "Product",
    items: [
      { href: "#how", label: "How it works" },
      { href: "#features", label: "Features" },
      { href: "#fair", label: "Fair splitting" },
      { href: "/app", label: "Open the app" },
    ],
  },
  {
    heading: "Trip flow",
    items: [
      { href: "/app", label: "Your trips" },
      { href: "/app/trips/batangas-staycation", label: "Trip overview" },
      { href: "/app/trips/batangas-staycation/itinerary", label: "Itinerary" },
      { href: "/app/trips/batangas-staycation/budget", label: "Budget" },
    ],
  },
  {
    heading: "About",
    items: [
      { href: "#fair", label: "Not a bank" },
      { href: "#", label: "Privacy" },
      { href: "#", label: "Support" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-base font-extrabold tracking-tight">
              Sama-sama
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            Plan the trip, set a shared target, track who has paid, and split
            the real costs fairly. Together.
          </p>
        </div>

        {groups.map((g) => (
          <div key={g.heading}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
              {g.heading}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {g.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-text-secondary transition-colors duration-200 hover:text-text"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Made for friend groups who travel together.</p>
          <p>A trip-planning and savings tracker, not a wallet.</p>
        </div>
      </div>
    </footer>
  );
}
