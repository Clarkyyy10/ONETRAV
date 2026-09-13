"use client";

import { useActionState } from "react";
import { Check, X } from "@phosphor-icons/react";
import {
  acceptInvitationAction,
  declineInvitationAction,
  type InviteState,
} from "@/app/app/invitations/actions";

export function InviteResponseButtons({ inviteId }: { inviteId: string }) {
  const [accState, accept, accepting] = useActionState<InviteState, FormData>(
    acceptInvitationAction,
    {},
  );
  const [, decline, declining] = useActionState<InviteState, FormData>(
    declineInvitationAction,
    {},
  );

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex gap-2">
        <form action={accept} className="flex-1">
          <input type="hidden" name="inviteId" value={inviteId} />
          <button
            type="submit"
            disabled={accepting || declining}
            className="flex w-full items-center justify-center gap-1.5 rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            <Check size={16} weight="bold" />
            {accepting ? "Joining..." : "Accept"}
          </button>
        </form>
        <form action={decline}>
          <input type="hidden" name="inviteId" value={inviteId} />
          <button
            type="submit"
            disabled={accepting || declining}
            className="flex items-center justify-center gap-1.5 rounded-pill bg-surface-2 px-5 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:text-text disabled:opacity-60"
          >
            <X size={16} weight="bold" />
            Decline
          </button>
        </form>
      </div>
      {accState.error && (
        <p role="alert" className="text-sm text-danger">
          {accState.error}
        </p>
      )}
    </div>
  );
}
