"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Warning } from "@phosphor-icons/react";
import {
  addItineraryItemAction,
  updateItineraryItemAction,
  type ActionState,
} from "@/app/app/trips/[tripId]/actions";

const inputClass =
  "w-full rounded-control border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/30";

const categorySuggestions = [
  "transportation",
  "accommodation",
  "food",
  "snacks",
  "activity",
  "entrance",
  "shopping",
  "beach",
  "museum",
  "rest",
  "other",
];

export interface ItemDefaults {
  itemId: string;
  title: string;
  description: string;
  time: string;
  location: string;
  mapLink: string;
  category: string;
  costType: "fixed" | "per_person" | "quantity";
  amount: string;
  unitPrice: string;
  quantity: string;
}

export function ItineraryItemForm({
  tripId,
  dayId,
  defaults,
  onDone,
}: {
  tripId: string;
  dayId: string;
  defaults?: ItemDefaults;
  onDone?: () => void;
}) {
  const isEdit = Boolean(defaults);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateItineraryItemAction : addItineraryItemAction,
    {},
  );
  const [costType, setCostType] = useState(defaults?.costType ?? "fixed");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.ok) return;
    if (isEdit) onDone?.();
    else formRef.current?.reset();
  }, [state.ok, isEdit, onDone]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-card bg-surface p-4 ring-1 ring-border shadow-soft-sm"
    >
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="dayId" value={dayId} />
      {defaults && <input type="hidden" name="itemId" value={defaults.itemId} />}

      <div className="flex flex-col gap-3">
        <input name="title" required defaultValue={defaults?.title} placeholder="What is it? e.g. Visit People's Park" className={inputClass} />
        <input name="description" defaultValue={defaults?.description} placeholder="Description (optional)" className={inputClass} />

        <div className="grid grid-cols-2 gap-3">
          <input name="time" defaultValue={defaults?.time} placeholder="Time (e.g. 10:00)" className={inputClass} />
          <input
            name="category"
            defaultValue={defaults?.category}
            placeholder="Category"
            list="cat-suggestions"
            className={`${inputClass} capitalize`}
          />
          <datalist id="cat-suggestions">
            {categorySuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <input name="location" defaultValue={defaults?.location} placeholder="Location (e.g. Tagaytay, Cavite)" className={inputClass} />
        <input name="mapLink" defaultValue={defaults?.mapLink} placeholder="Google Maps link (optional)" className={inputClass} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

          {costType === "fixed" ? (
            <div className="flex items-center rounded-control border border-border-strong bg-surface px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30 sm:col-span-2">
              <span className="mr-1 text-text-muted">₱</span>
              <input name="amount" type="number" min="0" step="0.01" defaultValue={defaults?.amount} placeholder="Amount" className="tnum w-full bg-transparent outline-none placeholder:text-text-muted" />
            </div>
          ) : (
            <>
              <div className="flex items-center rounded-control border border-border-strong bg-surface px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
                <span className="mr-1 text-text-muted">₱</span>
                <input name="unitPrice" type="number" min="0" step="0.01" defaultValue={defaults?.unitPrice} placeholder="Unit price" className="tnum w-full bg-transparent outline-none placeholder:text-text-muted" />
              </div>
              <input name="quantity" type="number" min="0" step="1" defaultValue={defaults?.quantity} placeholder={costType === "per_person" ? "People" : "Quantity"} className={`tnum ${inputClass}`} />
            </>
          )}
        </div>

        {state.error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-danger">
            <Warning size={15} weight="fill" />
            {state.error}
          </p>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-transform active:scale-[0.98] disabled:opacity-60">
            {pending ? "Saving..." : isEdit ? "Save changes" : "Add stop"}
          </button>
          {onDone && (
            <button type="button" onClick={onDone} className="rounded-pill px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-2">
              {isEdit ? "Cancel" : "Close"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
