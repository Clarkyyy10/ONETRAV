import { notFound } from "next/navigation";
import { Money } from "@/components/ui/Money";
import { Badge } from "@/components/ui/Badge";
import { AddBudgetItemForm } from "@/components/app/AddBudgetItemForm";
import { InlineDelete } from "@/components/app/InlineDelete";
import { deleteBudgetItemAction } from "@/app/app/trips/[tripId]/actions";
import { getTripView } from "@/lib/data/trips";
import type { BudgetCategory, BudgetLine } from "@/lib/mock";

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await getTripView(tripId);
  if (!trip) notFound();

  if (trip.budget.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <h2 className="text-xl font-bold tracking-tight">No budget items yet</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
          Add the expected costs, from accommodation to snacks. The total sets
          the group&rsquo;s funding target.
        </p>
        <div className="mt-6">
          <AddBudgetItemForm tripId={trip.id} />
        </div>
      </div>
    );
  }

  // Group lines by category
  const groups = new Map<BudgetCategory, BudgetLine[]>();
  for (const line of trip.budget) {
    const arr = groups.get(line.category) ?? [];
    arr.push(line);
    groups.set(line.category, arr);
  }

  const estimatedTotal = trip.budget.reduce((s, l) => s + l.estimated, 0);
  const actualTotal = trip.budget.reduce((s, l) => s + (l.actual ?? 0), 0);
  const variance = actualTotal - estimatedTotal;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Totals */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm">
          <p className="text-sm text-text-muted">Estimated</p>
          <Money centavos={estimatedTotal} size="lg" className="mt-1 block" />
        </div>
        <div className="rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm">
          <p className="text-sm text-text-muted">Actual so far</p>
          <Money centavos={actualTotal} size="lg" className="mt-1 block" />
        </div>
        <div className="rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm">
          <p className="text-sm text-text-muted">Difference</p>
          <p className="mt-1">
            {variance === 0 ? (
              <span className="text-lg font-bold text-text-secondary">On track</span>
            ) : (
              <span
                className={`tnum text-lg font-bold ${variance > 0 ? "text-danger" : "text-success"}`}
              >
                {variance > 0 ? "+" : "-"}
                <Money centavos={Math.abs(variance)} size="sm" />
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Grouped line items */}
      <div className="space-y-5">
        {[...groups.entries()].map(([category, lines]) => {
          const subtotal = lines.reduce((s, l) => s + l.estimated, 0);
          return (
            <section
              key={category}
              className="overflow-hidden rounded-card bg-surface ring-1 ring-border shadow-soft-sm"
            >
              <div className="flex items-center justify-between bg-surface-2/60 px-5 py-3">
                <h2 className="text-sm font-bold tracking-tight">{category}</h2>
                <Money centavos={subtotal} size="sm" muted />
              </div>
              <ul className="divide-y divide-border">
                {lines.map((line) => {
                  const paid = line.actual !== null;
                  return (
                    <li
                      key={line.id}
                      className="flex items-center justify-between gap-3 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{line.name}</p>
                        <div className="mt-1">
                          {paid ? (
                            <Badge tone="success">Paid</Badge>
                          ) : (
                            <Badge tone="neutral">Estimated</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="text-right">
                          <Money centavos={line.estimated} size="sm" className="block" />
                          {paid && line.actual !== line.estimated && (
                            <span className="tnum text-xs text-text-muted">
                              actual <Money centavos={line.actual!} size="sm" muted />
                            </span>
                          )}
                        </div>
                        <InlineDelete
                          action={deleteBudgetItemAction}
                          fields={{ tripId: trip.id, itemId: line.id }}
                          confirmText="Remove this budget item?"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <AddBudgetItemForm tripId={trip.id} />
    </div>
  );
}
