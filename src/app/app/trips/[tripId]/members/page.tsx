import { notFound } from "next/navigation";
import { Crown, Clock } from "@phosphor-icons/react/dist/ssr";
import { Money } from "@/components/ui/Money";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { InviteMemberPanel } from "@/components/app/InviteMemberPanel";
import { MemberRoleSelect } from "@/components/app/MemberRoleSelect";
import { InlineDelete } from "@/components/app/InlineDelete";
import { cancelInvitationAction, removeMemberAction } from "@/app/app/trips/[tripId]/manage";
import {
  getTripMembers,
  getTripInvitations,
  getMyTripContext,
} from "@/lib/data/trips";
import { fundingPercent } from "@/lib/money";

const roleTone: Record<string, "accent" | "success" | "warning" | "neutral"> = {
  owner: "accent",
  admin: "success",
  treasurer: "warning",
  member: "neutral",
};

export default async function MembersPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [members, invites, ctx] = await Promise.all([
    getTripMembers(tripId),
    getTripInvitations(tripId),
    getMyTripContext(tripId),
  ]);
  if (members.length === 0) notFound();

  const canManage = ctx.canManageFinance;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Member cards */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight">
          Members <span className="text-text-muted">({members.length})</span>
        </h2>
        {members.map((m) => {
          const pct = fundingPercent(m.paid, m.target);
          const editableRole = m.role !== "owner" && !m.isCreator;
          return (
            <div
              key={m.id}
              className="rounded-card bg-surface p-4 ring-1 ring-border shadow-soft-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
                  {m.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{m.name}</p>
                    {m.isCreator && (
                      <Crown size={15} weight="fill" className="shrink-0 text-warning" />
                    )}
                  </div>
                  <p className="tnum text-xs text-text-muted">@{m.publicId}</p>
                </div>
                {canManage && editableRole ? (
                  <MemberRoleSelect
                    tripId={tripId}
                    userId={m.id}
                    role={m.role as "admin" | "treasurer" | "member"}
                  />
                ) : (
                  <Badge tone={roleTone[m.role] ?? "neutral"}>
                    <span className="capitalize">{m.role}</span>
                  </Badge>
                )}
                {canManage && editableRole && (
                  <InlineDelete
                    action={removeMemberAction}
                    fields={{ tripId, userId: m.id }}
                    confirmText={`Remove ${m.name}? Their contribution history is kept.`}
                    label="Remove member"
                  />
                )}
              </div>

              {m.target > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>
                      <Money centavos={m.paid} size="sm" /> of{" "}
                      <Money centavos={m.target} size="sm" muted />
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <ProgressBar
                    value={pct}
                    tone={pct >= 100 ? "success" : "accent"}
                    label={`${m.name} contribution`}
                    className="mt-1.5 h-1.5"
                  />
                </div>
              )}
              {m.participation === "left" && (
                <p className="mt-2 text-xs font-medium text-text-muted">
                  No longer participating. History preserved.
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* Pending invitations */}
      {invites.length > 0 && (
        <section className="rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-text-muted">
            Pending invitations
          </h2>
          <ul className="mt-3 space-y-2">
            {invites.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3 py-1.5">
                <Clock size={18} weight="fill" className="shrink-0 text-warning" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{inv.inviteeName}</p>
                  <p className="tnum text-xs text-text-muted">
                    @{inv.inviteePublicId} · invited {inv.when}
                  </p>
                </div>
                {canManage && (
                  <InlineDelete
                    action={cancelInvitationAction}
                    fields={{ tripId, inviteId: inv.id }}
                    label="Cancel invitation"
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <InviteMemberPanel tripId={tripId} />
    </div>
  );
}
