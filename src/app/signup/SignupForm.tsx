"use client";

import { useActionState } from "react";
import { Warning, CheckCircle } from "@phosphor-icons/react";
import { signUpAction, type AuthState } from "@/app/auth/actions";
import { Field } from "@/components/auth/AuthShell";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signUpAction,
    {},
  );

  if (state.message) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-card bg-success-soft p-5 text-success"
      >
        <CheckCircle size={22} weight="fill" className="mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Name" name="name" autoComplete="name" placeholder="e.g. Clark" />
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
        autoComplete="new-password"
        placeholder="At least 8 characters"
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
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
