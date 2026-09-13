import { notFound } from "next/navigation";
import { SealCheck, Clock, XCircle } from "@phosphor-icons/react/dist/ssr";
import { Money } from "@/components/ui/Money";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { AddContributionForm } from "@/components/app/AddContributionForm";
import { VerifyButton } from "@/components/app/VerifyButton";
import {
  getTripView,
  getSessionProfile,
  getTripContributions,
  getMyTripContext,
} from "@/lib/data/trips";
import { fundingPercent } from "@/lib/money";

export default async function ContributionsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, profile, contributions, ctx] = await Promise.all([
    getTripView(tripId),
    getSessionProfile(),
    getTripContributions(tripId),
    getMyTripContext(tripId),
  ]);
  if (!trip) notFound();

  const me =
    trip.members.find((m) => m.id === profile?.id) ?? trip.members[0];
  const myPct = me ? fundingPercent(me.paid, me.target) : 0;
  const myRemaining = me ? Math.max(0, me.target - me.paid) : 0;
  const fullyFunded = trip.members.filter(
    (m) => m.paid >= m.target && m.target > 0,
  ).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* My contribution + add */}
      <section className="rounded-card bg-accent p-6 text-accent-fg shadow-soft-md">
        <p className="text-sm font-medium text-accent-fg/85">My contribution</p>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-accent-fg/75">Target</p>
            <Money centavos={me?.target ?? 0} size="md" className="mt-0.5 block" />
          </div>
          <div>
            <p className="text-xs text-accent-fg/75">Paid</p>
            <Money centavos={me?.paid ?? 0} size="md" className="mt-0.5 block" />
          </div>
          <div>
            <p className="text-xs text-accent-fg/75">Remaining</p>
            <Money centavos={myRemaining} size="md" className="mt-0.5 block" />
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-pill bg-white/25">
          <div
            className="h-full rounded-pill bg-white ease-fluid transition-[width] duration-700"
            style={{ width: `${myPct}%` }}
          />
        </div>
        <div className="mt-5 border-t border-white/20 pt-5">
          <AddContributionForm tripId={trip.id} />
        </div>
      </section>

      {/* Group progress — supportive framing, not shaming */}
      <section className="rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">The group</h2>
          <p className="text-sm font-medium text-text-secondary">
            {fullyFunded} of {trip.members.length} fully funded
          </p>
        </div>
        <ul className="mt-4 space-y-2">
          {trip.members.map((m) => {
            const pct = fundingPercent(m.paid, m.target);
            const done = m.paid >= m.target && m.target > 0;
            return (
              <li key={m.id} className="flex items-center gap-3 py-1.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-text-secondary ring-1 ring-border">
                  {m.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{m.name}</span>
                    {done ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                        <SealCheck size={15} weight="fill" />
                        Funded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted">
                        <Clock size={14} weight="fill" />
                        <Money centavos={Math.max(0, m.target - m.paid)} size="sm" muted /> to go
                      </span>
                    )}
                  </div>
                  <ProgressBar
                    value={pct}
                    tone={done ? "success" : "accent"}
                    label={`${m.name} contribution progress`}
                    className="mt-2 h-1.5"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Contribution log */}
      <section className="rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-sm">
        <h2 className="text-lg font-bold tracking-tight">Contribution log</h2>
        {contributions.length === 0 ? (
          <p className="mt-3 text-sm text-text-secondary">
            No contributions yet. Add yours above once you&rsquo;ve paid.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {contributions.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-text-secondary ring-1 ring-border">
                  {c.memberInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.memberName}</span>
                    {c.status === "verified" && <Badge tone="success">Verified</Badge>}
                    {c.status === "pending" && <Badge tone="warning">Pending</Badge>}
                    {c.status === "rejected" && (
                      <Badge tone="danger">
                        <XCircle size={12} weight="fill" />
                        Rejected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    {c.method ? `${c.method} · ` : ""}
                    {c.when}
                  </p>
                </div>
                <Money centavos={c.amount} size="sm" className="shrink-0" />
                {ctx.canManageFinance && c.status === "pending" && (
                  <VerifyButton tripId={trip.id} contributionId={c.id} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="px-2 text-center text-xs text-text-muted">
        ONETRAVEL records contributions made outside the app. It does not hold
        your money.
      </p>
    </div>
  );
}
