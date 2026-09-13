"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Warning } from "@phosphor-icons/react";
import {
  addItineraryDayAction,
  type ActionState,
} from "@/app/app/trips/[tripId]/actions";

const inputClass =
  "rounded-control border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/30";

export function AddDayForm({
  tripId,
  variant = "button",
}: {
  tripId: string;
  variant?: "button" | "primary";
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addItineraryDayAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  if (!open) {
    const cls =
      variant === "primary"
        ? "inline-flex items-center gap-2 rounded-pill bg-accent px-6 py-3 text-sm font-semibold text-accent-fg shadow-soft-md transition-all hover:bg-accent-hover active:scale-[0.98]"
        : "inline-flex items-center gap-1.5 rounded-pill bg-surface px-5 py-2.5 text-sm font-semibold text-text ring-1 ring-border-strong shadow-soft-sm transition-colors hover:bg-surface-2";
    return (
      <div className={variant === "primary" ? "flex justify-center" : ""}>
        <button onClick={() => setOpen(true)} className={cls}>
          <Plus size={18} weight="bold" />
          Add a day
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm"
    >
      <input type="hidden" name="tripId" value={tripId} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="title"
          placeholder="Day label (optional, e.g. Day 1)"
          className={`${inputClass} flex-1`}
        />
        <input name="date" type="date" className={inputClass} />
      </div>
      {state.error && (
        <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-danger">
          <Warning size={15} weight="fill" />
          {state.error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Adding..." : "Add day"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-pill px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
