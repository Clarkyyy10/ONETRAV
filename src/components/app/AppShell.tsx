"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  House,
  SuitcaseRolling,
  EnvelopeSimple,
  Bell,
  User,
} from "@phosphor-icons/react";
import { Logo } from "@/components/ui/Logo";
import { PageTransition } from "@/components/ui/PageTransition";

const nav = [
  { href: "/app", label: "Home", icon: House, exact: true },
  { href: "/app/trips", label: "Trips", icon: SuitcaseRolling },
  { href: "/app/invitations", label: "Invites", icon: EnvelopeSimple, badge: true },
  { href: "/app/activity", label: "Activity", icon: Bell },
  { href: "/app/profile", label: "Profile", icon: User },
];

const activeSpring = { type: "spring", stiffness: 420, damping: 34 } as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function Count({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="tnum ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-fg">
      {n > 9 ? "9+" : n}
    </span>
  );
}

export function AppShell({
  children,
  invitationCount = 0,
}: {
  children: React.ReactNode;
  invitationCount?: number;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-6xl">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-border px-4 py-6 lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2">
          <motion.span
            whileHover={reduce ? undefined : { rotate: -8, scale: 1.05 }}
            transition={activeSpring}
            className="inline-flex"
          >
            <Logo className="h-8 w-8" />
          </motion.span>
          <span className="text-base font-extrabold tracking-tight">ONETRAVEL</span>
        </Link>
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors duration-200 active:scale-[0.98] ${
                  active
                    ? "text-accent"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 -z-0 rounded-control bg-accent-soft"
                    transition={activeSpring}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <item.icon size={22} weight={active ? "fill" : "regular"} />
                  {item.label}
                </span>
                {item.badge && (
                  <span className="relative z-10 ml-auto">
                    <Count n={invitationCount} />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">
        <PageTransition>{children}</PageTransition>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/85 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around">
          {nav.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-200 ${
                    active ? "text-accent" : "text-text-muted hover:text-text"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="mobile-active"
                      className="absolute inset-x-6 top-0 h-0.5 rounded-pill bg-accent"
                      transition={activeSpring}
                    />
                  )}
                  <motion.span
                    animate={reduce ? undefined : { scale: active ? 1.12 : 1, y: active ? -1 : 0 }}
                    transition={activeSpring}
                  >
                    <item.icon size={24} weight={active ? "fill" : "regular"} />
                  </motion.span>
                  {item.label}
                  {item.badge && invitationCount > 0 && (
                    <span className="absolute right-1/2 top-1 -mr-3 h-2 w-2 rounded-full bg-accent" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
