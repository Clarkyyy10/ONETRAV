"use client";

import { useActionState } from "react";
import { Warning } from "@phosphor-icons/react";
import { signInAction, type AuthState } from "@/app/auth/actions";
import { Field } from "@/components/auth/AuthShell";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signInAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
      />

      {state.error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-control bg-danger-soft px-3 py-2.5 text-sm text-danger"
        >
          <Warning size={16} weight="fill" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-pill bg-accent px-5 py-3 text-sm font-semibold text-accent-fg ease-fluid transition-all duration-300 hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
