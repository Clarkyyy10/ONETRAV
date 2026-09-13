"use client";

import { useActionState } from "react";
import { Check } from "@phosphor-icons/react";
import { updateProfileNameAction, type ProfileState } from "@/app/app/profile/actions";

export function ProfileNameForm({ name }: { name: string }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfileNameAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label htmlFor="name" className="text-sm font-semibold">
        Display name
      </label>
      <div className="flex gap-2">
        <input
          id="name"
          name="name"
          defaultValue={name}
          required
          className="flex-1 rounded-control border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          <Check size={16} weight="bold" />
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p role="status" className="text-sm text-success">Saved.</p>}
    </form>
  );
}
