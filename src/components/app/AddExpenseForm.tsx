"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Warning, CheckCircle } from "@phosphor-icons/react";
import { addExpenseAction, type ActionState } from "@/app/app/trips/[tripId]/actions";

const categories = ["transportation", "accommodation", "food", "snacks", "activity", "entrance", "shopping", "other"];

const inputClass =
  "w-full rounded-control border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/30";

export function AddExpenseForm({
  tripId,
  members,
}: {
  tripId: string;
  members: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addExpenseAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  if (!open) {
    return (
      <div className="flex justify-center">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-5 py-2.5 text-sm font-semibold text-text ring-1 ring-border-strong shadow-soft-sm transition-colors hover:bg-surface-2"
        >
          <Plus size={18} weight="bold" />
          Record an expense
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm">
      <input type="hidden" name="tripId" value={tripId} />
      <div className="flex flex-col gap-3">
        <input name="description" required placeholder="What was it for? e.g. Dinner at the market" className={inputClass} />
        <div className="grid grid-cols-2 gap-3">
          <input name="category" list="exp-cats" defaultValue="food" placeholder="Category" className={`${inputClass} capitalize`} />
          <datalist id="exp-cats">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <div className="flex items-center rounded-control border border-border-strong bg-surface px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
            <span className="mr-1 text-text-muted">₱</span>
            <input name="amount" type="number" min="0" step="0.01" required placeholder="Amount" className="tnum w-full bg-transparent outline-none placeholder:text-text-muted" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select name="paidBy" defaultValue={members[0]?.id ?? ""} className={inputClass}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                Paid by {m.name}
              </option>
            ))}
          </select>
          <input name="date" type="date" className={inputClass} />
        </div>

        {state.error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-danger">
            <Warning size={15} weight="fill" />
            {state.error}
          </p>
        )}
        {state.ok && (
          <p role="status" className="flex items-center gap-2 text-sm text-success">
            <CheckCircle size={15} weight="fill" />
            Recorded.
          </p>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-transform active:scale-[0.98] disabled:opacity-60">
            {pending ? "Saving..." : "Record expense"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-pill px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-2">
            Close
          </button>
        </div>
      </div>
    </form>
  );
}
