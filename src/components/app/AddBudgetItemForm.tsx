"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Warning, CheckCircle } from "@phosphor-icons/react";
import {
  addBudgetItemAction,
  type ActionState,
} from "@/app/app/trips/[tripId]/actions";

const categories = [
  "accommodation",
  "transportation",
  "food",
  "snacks",
  "activity",
  "entrance",
  "shopping",
  "other",
];

const inputClass =
  "w-full rounded-control border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/30";

export function AddBudgetItemForm({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const [costType, setCostType] = useState<"fixed" | "per_person" | "quantity">("fixed");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addBudgetItemAction,
    {},
  );
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
          Add budget item
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
      <div className="flex flex-col gap-3">
        <input name="name" required placeholder="What is it? e.g. Kayak rental" className={inputClass} />
        <div className="grid grid-cols-2 gap-3">
          <input name="category" list="budget-cats" defaultValue="other" placeholder="Category" className={`${inputClass} capitalize`} />
          <datalist id="budget-cats">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <select
            name="costType"
            value={costType}
            onChange={(e) => setCostType(e.target.value as typeof costType)}
            className={inputClass}
          >
            <option value="fixed">Fixed cost</option>
            <option value="per_person">Per person</option>
            <option value="quantity">Quantity x price</option>
          </select>
        </div>

        {costType === "fixed" ? (
          <div className="flex items-center rounded-control border border-border-strong bg-surface px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
            <span className="mr-1 text-text-muted">₱</span>
            <input name="amount" type="number" min="0" step="0.01" required placeholder="Amount" className="tnum w-full bg-transparent outline-none placeholder:text-text-muted" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center rounded-control border border-border-strong bg-surface px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
              <span className="mr-1 text-text-muted">₱</span>
              <input name="unitPrice" type="number" min="0" step="0.01" required placeholder="Unit price" className="tnum w-full bg-transparent outline-none placeholder:text-text-muted" />
            </div>
            <input name="quantity" type="number" min="0" step="1" required placeholder={costType === "per_person" ? "People" : "Quantity"} className={`tnum ${inputClass}`} />
          </div>
        )}

        {state.error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-danger">
            <Warning size={15} weight="fill" />
            {state.error}
          </p>
        )}
        {state.ok && (
          <p role="status" className="flex items-center gap-2 text-sm text-success">
            <CheckCircle size={15} weight="fill" />
            Added. Add another, or close this panel.
          </p>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-transform active:scale-[0.98] disabled:opacity-60">
            {pending ? "Adding..." : "Add item"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-pill px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-2">
            Close
          </button>
        </div>
      </div>
    </form>
  );
}
