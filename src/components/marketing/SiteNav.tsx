import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#fair", label: "Fair splitting" },
];

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-5">
      <nav
        aria-label="Primary"
        className="flex w-full max-w-5xl items-center justify-between gap-4 rounded-pill border border-border bg-surface/70 py-2 pl-4 pr-2 shadow-soft-md backdrop-blur-xl backdrop-saturate-150"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-pill pl-1 pr-2 py-1"
        >
          <Logo className="h-7 w-7" />
          <span className="text-[15px] font-extrabold tracking-tight">
            Sama-sama
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-pill px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 hover:bg-surface-2 hover:text-text"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <ButtonLink href="/app" size="md" trailingIcon>
          Open the app
        </ButtonLink>
      </nav>
    </header>
  );
}
