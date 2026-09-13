"use client";

import { useActionState } from "react";
import { Warning, CheckCircle } from "@phosphor-icons/react";
import { updateTripAction, type ManageState } from "@/app/app/trips/[tripId]/manage";

const inputClass =
  "w-full rounded-control border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/30";

export interface TripSettingsDefaults {
  id: string;
  name: string;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  fundingDeadline: string;
  status: string;
  target: string;
  contributionMode: string;
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold">
      {children}
    </label>
  );
}

export function TripSettingsForm({ trip }: { trip: TripSettingsDefaults }) {
  const [state, formAction, pending] = useActionState<ManageState, FormData>(
    updateTripAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="tripId" value={trip.id} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Trip name</Label>
        <input id="name" name="name" required defaultValue={trip.name} className={inputClass} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="destination">Destination</Label>
        <input id="destination" name="destination" defaultValue={trip.destination} className={inputClass} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <textarea id="description" name="description" rows={3} defaultValue={trip.description} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startDate">Start date</Label>
          <input id="startDate" name="startDate" type="date" defaultValue={trip.startDate} className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="endDate">End date</Label>
          <input id="endDate" name="endDate" type="date" defaultValue={trip.endDate} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fundingDeadline">Funding deadline</Label>
          <input id="fundingDeadline" name="fundingDeadline" type="date" defaultValue={trip.fundingDeadline} className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={trip.status} className={`${inputClass} capitalize`}>
            {["planning", "funding", "ready", "ongoing", "completed", "cancelled"].map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="target">Funding target</Label>
          <div className="flex items-center rounded-control border border-border-strong bg-surface px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
            <span className="mr-1 text-text-muted">₱</span>
            <input id="target" name="target" type="number" min="0" step="0.01" defaultValue={trip.target} className="tnum w-full bg-transparent outline-none" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contributionMode">Contribution rule</Label>
          <select id="contributionMode" name="contributionMode" defaultValue={trip.contributionMode} className={inputClass}>
            <option value="equal">Equal split</option>
            <option value="custom">Custom per member</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-control bg-danger-soft px-3 py-2.5 text-sm text-danger">
          <Warning size={16} weight="fill" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="flex items-center gap-2 text-sm text-success">
          <CheckCircle size={16} weight="fill" />
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-pill bg-accent px-7 py-3 text-sm font-semibold text-accent-fg transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
