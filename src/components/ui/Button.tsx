import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface BaseProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  /** Show the nested "button-in-button" trailing icon. */
  trailingIcon?: boolean;
  className?: string;
}

const base =
  "group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill font-semibold ease-fluid transition-all duration-300 active:scale-[0.98] focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";

const sizes: Record<Size, string> = {
  md: "text-sm pl-5 pr-2 py-2",
  lg: "text-base pl-7 pr-2.5 py-3",
};

const sizesNoIcon: Record<Size, string> = {
  md: "text-sm px-5 py-2",
  lg: "text-base px-7 py-3",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg shadow-soft-md hover:bg-accent-hover hover:shadow-soft-lg",
  secondary:
    "bg-surface text-text ring-1 ring-border-strong shadow-soft-sm hover:bg-surface-2",
  ghost: "bg-transparent text-text hover:bg-surface-2",
};

const iconWrap: Record<Variant, string> = {
  primary: "bg-white/15",
  secondary: "bg-accent-soft text-accent",
  ghost: "bg-surface-2",
};

function Inner({
  children,
  trailingIcon,
  variant,
}: {
  children: React.ReactNode;
  trailingIcon: boolean;
  variant: Variant;
}) {
  return (
    <>
      <span className="inline-flex items-center">{children}</span>
      {trailingIcon && (
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${iconWrap[variant]} ease-fluid transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5`}
        >
          <ArrowUpRight size={16} weight="bold" />
        </span>
      )}
    </>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  trailingIcon = false,
  className = "",
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizing = trailingIcon ? sizes[size] : sizesNoIcon[size];
  return (
    <button
      className={`${base} ${sizing} ${variants[variant]} ${className}`}
      {...rest}
    >
      <Inner trailingIcon={trailingIcon} variant={variant}>
        {children}
      </Inner>
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  size = "md",
  trailingIcon = false,
  className = "",
}: BaseProps & { href: string }) {
  const sizing = trailingIcon ? sizes[size] : sizesNoIcon[size];
  return (
    <Link
      href={href}
      className={`${base} ${sizing} ${variants[variant]} ${className}`}
    >
      <Inner trailingIcon={trailingIcon} variant={variant}>
        {children}
      </Inner>
    </Link>
  );
}
