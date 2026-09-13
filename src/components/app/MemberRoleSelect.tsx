"use client";

import { updateMemberRoleAction, type ManageState } from "@/app/app/trips/[tripId]/manage";

export function MemberRoleSelect({
  tripId,
  userId,
  role,
}: {
  tripId: string;
  userId: string;
  role: "admin" | "treasurer" | "member";
}) {
  return (
    <form
      action={(fd) => {
        void (updateMemberRoleAction as (p: ManageState, f: FormData) => Promise<ManageState>)(
          {},
          fd,
        );
      }}
    >
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={role}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-pill border border-border-strong bg-surface px-3 py-1.5 text-xs font-semibold capitalize outline-none focus:border-accent"
      >
        <option value="admin">Admin</option>
        <option value="treasurer">Treasurer</option>
        <option value="member">Member</option>
      </select>
    </form>
  );
}
