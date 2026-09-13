"use client";

import { useActionState } from "react";
import { SealCheck } from "@phosphor-icons/react";
import {
  verifyContributionAction,
  type ActionState,
} from "@/app/app/trips/[tripId]/actions";

export function VerifyButton({
  tripId,
  contributionId,
}: {
  tripId: string;
  contributionId: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    verifyContributionAction,
    {},
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="contributionId" value={contributionId} />
      <button
        type="submit"
        disabled={pending}
        title={state.error}
        className="inline-flex items-center gap-1.5 rounded-pill bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent transition-transform duration-200 active:scale-[0.97] disabled:opacity-60"
      >
        <SealCheck size={14} weight="fill" />
        {pending ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}
