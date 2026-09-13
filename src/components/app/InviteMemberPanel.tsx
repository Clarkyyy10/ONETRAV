"use client";

import { useActionState } from "react";
import { MagnifyingGlass, UserPlus, Warning } from "@phosphor-icons/react";
import {
  searchUsersAction,
  sendInvitationAction,
  type SearchState,
  type ManageState,
} from "@/app/app/trips/[tripId]/manage";

const asFormAction =
  (a: (p: ManageState, fd: FormData) => Promise<ManageState>) =>
  (fd: FormData) => {
    void a({}, fd);
  };

export function InviteMemberPanel({ tripId }: { tripId: string }) {
  const [state, formAction, pending] = useActionState<SearchState, FormData>(
    searchUsersAction,
    {},
  );

  return (
    <div className="rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-sm">
      <h2 className="text-lg font-bold tracking-tight">Invite people</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Search by unique ID (like SAM-8F42K) or name. The ID is the sure way to
        find the right person.
      </p>

      <form action={formAction} className="mt-4 flex gap-2">
        <div className="flex flex-1 items-center rounded-control border border-border-strong bg-surface px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
          <MagnifyingGlass size={16} className="mr-2 text-text-muted" />
          <input
            name="query"
            placeholder="SAM-8F42K or a name"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-text-muted"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "..." : "Search"}
        </button>
      </form>

      {state.error && (
        <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-danger">
          <Warning size={15} weight="fill" />
          {state.error}
        </p>
      )}

      {state.results && (
        <ul className="mt-4 space-y-2">
          {state.results.length === 0 && (
            <li className="text-sm text-text-muted">No matching people found.</li>
          )}
          {state.results.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-control bg-surface-2/60 px-3 py-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                {r.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{r.name}</p>
                <p className="tnum text-xs text-text-muted">@{r.publicId}</p>
              </div>
              <form action={asFormAction(sendInvitationAction)}>
                <input type="hidden" name="tripId" value={tripId} />
                <input type="hidden" name="inviteeId" value={r.id} />
                <input type="hidden" name="role" value="member" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-4 py-2 text-xs font-semibold text-accent-fg transition-transform active:scale-[0.97]"
                >
                  <UserPlus size={14} weight="bold" />
                  Invite
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
