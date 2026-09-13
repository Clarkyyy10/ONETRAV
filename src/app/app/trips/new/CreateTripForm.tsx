"use client";

import { useActionState } from "react";
import { Warning } from "@phosphor-icons/react";
import { createTripAction, type ActionState } from "@/app/app/actions";

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold">
      {children}
    </label>
  );
}

const inputClass =
  "rounded-control border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/30";

export function CreateTripForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createTripAction,
    {},
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Trip name</Label>
        <input id="name" name="name" required placeholder="e.g. Batangas Staycation" className={inputClass} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="destination">Destination</Label>
        <input id="destination" name="destination" placeholder="e.g. Laiya, Batangas" className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startDate">Start date</Label>
          <input id="startDate" name="startDate" type="date" className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="endDate">End date</Label>
          <input id="endDate" name="endDate" type="date" className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="target">Funding target (optional)</Label>
        <div className="flex items-center rounded-control border border-border-strong bg-surface px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
          <span className="mr-1 text-text-muted">₱</span>
          <input
            id="target"
            name="target"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            className="tnum w-full bg-transparent text-text outline-none placeholder:text-text-muted"
          />
        </div>
        <p className="text-xs text-text-muted">
          You can set this later once the budget takes shape.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-control bg-danger-soft px-3 py-2.5 text-sm text-danger">
          <Warning size={16} weight="fill" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 self-start rounded-pill bg-accent px-7 py-3 text-sm font-semibold text-accent-fg ease-fluid transition-all duration-300 hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create trip"}
      </button>
    </form>
  );
}
