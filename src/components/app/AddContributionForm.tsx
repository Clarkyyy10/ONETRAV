"use client";

import { useActionState, useEffect, useRef } from "react";
import { Warning, CheckCircle } from "@phosphor-icons/react";
import {
  addContributionAction,
  type ActionState,
} from "@/app/app/trips/[tripId]/actions";

export function AddContributionForm({ tripId }: { tripId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addContributionAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="tripId" value={tripId} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="amount" className="sr-only">
            Amount in pesos
          </label>
          <div className="flex items-center rounded-control bg-white/15 px-3.5 py-2.5 ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-white/50">
            <span className="mr-1 text-accent-fg/80">₱</span>
            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="0.01"
              required
              placeholder="Amount"
              className="tnum w-full bg-transparent text-accent-fg outline-none placeholder:text-accent-fg/60"
            />
          </div>
        </div>
        <input
          name="method"
          type="text"
          placeholder="Method (e.g. GCash)"
          className="rounded-control bg-white/15 px-3.5 py-2.5 text-accent-fg outline-none ring-1 ring-white/20 placeholder:text-accent-fg/60 focus:ring-2 focus:ring-white/50 sm:w-44"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-pill bg-white px-5 py-2.5 text-sm font-semibold text-accent transition-transform duration-200 active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Saving..." : "Add"}
        </button>
      </div>

      {state.error && (
        <p role="alert" className="flex items-center gap-2 text-sm text-white">
          <Warning size={15} weight="fill" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="flex items-center gap-2 text-sm text-white">
          <CheckCircle size={15} weight="fill" />
          Contribution logged. A treasurer will verify it.
        </p>
      )}
    </form>
  );
}
