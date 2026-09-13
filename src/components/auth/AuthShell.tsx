import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-base font-extrabold tracking-tight">
            ONETRAVEL
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-[15px] text-text-secondary">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <p className="mt-6 text-center text-sm text-text-secondary">
            {footer}
          </p>
        </div>
      </main>
    </div>
  );
}

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className="rounded-control border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
    </div>
  );
}
