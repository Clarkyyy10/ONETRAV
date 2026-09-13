import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle,
  SealCheck,
  PencilSimple,
  UserPlus,
  Receipt,
  CaretRight,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { Money } from "@/components/ui/Money";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { getTripView } from "@/lib/data/trips";
import type { BudgetCategory, ActivityEntry } from "@/lib/mock";
import { fundingPercent } from "@/lib/money";

const activityIcon: Record<ActivityEntry["kind"], React.ReactNode> = {
  contribution: <CheckCircle size={18} weight="fill" className="text-accent" />,
  verified: <SealCheck size={18} weight="fill" className="text-success" />,
  budget: <PencilSimple size={18} weight="fill" className="text-warning" />,
  expense: <Receipt size={18} weight="fill" className="text-text-secondary" />,
  member: <UserPlus size={18} weight="fill" className="text-accent" />,
};

export default async function TripOverviewPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await getTripView(tripId);
  if (!trip) notFound();

  const pct = fundingPercent(trip.raised, trip.target);
  const stillNeeded = Math.max(0, trip.target - trip.raised);
  const funded = trip.members.filter((m) => m.paid >= m.target && m.target > 0).length;

  // Budget totals by category
  const byCategory = new Map<BudgetCategory, number>();
  for (const line of trip.budget) {
    byCategory.set(line.category, (byCategory.get(line.category) ?? 0) + line.estimated);
  }
  const categories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const estimatedTotal = trip.budget.reduce((sum, l) => sum + l.estimated, 0);

  // Planning trip with no target yet: friendly empty state
  if (trip.target === 0) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Sparkle size={28} weight="duotone" />
        </span>
        <h2 className="mt-5 text-xl font-bold tracking-tight">
          This trip is still being planned
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
          Add a day-by-day itinerary and expected costs. ONETRAVEL will total it
          up and work out each person&rsquo;s share.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/app/trips/${trip.id}/itinerary`}>
            <Button trailingIcon>Build the itinerary</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      {/* Left column */}
      <div className="space-y-6">
        {/* Funding summary */}
        <section className="rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-sm">
          <div className="flex items-baseline justify-between">
            <div>
              <Money centavos={trip.raised} size="xl" className="block" />
              <p className="mt-1 text-sm text-text-muted">
                of <Money centavos={trip.target} size="sm" muted /> target
              </p>
            </div>
            <span className="tnum text-lg font-bold text-accent">{pct}%</span>
          </div>
          <ProgressBar value={pct} label="Trip funding progress" className="mt-4" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[15px] font-medium text-text-secondary">
              <Money centavos={stillNeeded} size="sm" /> still needed
            </p>
            <p className="text-sm text-text-muted">
              {funded} of {trip.members.length} members funded
            </p>
          </div>
        </section>

        {/* Budget breakdown */}
        <section className="rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Budget</h2>
            <Link
              href={`/app/trips/${trip.id}/budget`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
            >
              View all
              <CaretRight size={14} weight="bold" />
            </Link>
          </div>
          <div className="mt-4 space-y-3.5">
            {categories.map(([cat, amount]) => {
              const share = estimatedTotal > 0 ? (amount / estimatedTotal) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat}</span>
                    <Money centavos={amount} size="sm" />
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-surface-inset">
                    <div
                      className="h-full rounded-pill bg-accent/70"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold text-text-secondary">
              Estimated total
            </span>
            <Money centavos={estimatedTotal} size="md" />
          </div>
        </section>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        {/* Members */}
        <section className="rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-sm">
          <h2 className="text-lg font-bold tracking-tight">Who&rsquo;s going</h2>
          <ul className="mt-4 space-y-3">
            {trip.members.map((m) => {
              const done = m.paid >= m.target && m.target > 0;
              return (
                <li key={m.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-text-secondary ring-1 ring-border">
                    {m.initials}
                  </span>
                  <span className="flex-1 text-sm font-medium">{m.name}</span>
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                      <SealCheck size={15} weight="fill" />
                      Funded
                    </span>
                  ) : (
                    <span className="tnum text-xs font-medium text-text-muted">
                      <Money centavos={Math.max(0, m.target - m.paid)} size="sm" /> left
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Recent activity */}
        <section className="rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-sm">
          <h2 className="text-lg font-bold tracking-tight">Recent activity</h2>
          <ul className="mt-4 space-y-3.5">
            {trip.activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">{activityIcon[a.kind]}</span>
                <div className="min-w-0">
                  <p className="text-sm leading-snug text-text">{a.text}</p>
                  <p className="text-xs text-text-muted">{a.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
