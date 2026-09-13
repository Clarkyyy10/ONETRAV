import { notFound } from "next/navigation";
import { Money } from "@/components/ui/Money";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { AddExpenseForm } from "@/components/app/AddExpenseForm";
import { InlineDelete } from "@/components/app/InlineDelete";
import { deleteExpenseAction } from "@/app/app/trips/[tripId]/actions";
import { getTripView, getTripExpenses, getTripMembers } from "@/lib/data/trips";
import { toViewCategory } from "@/lib/format";

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, expenses, members] = await Promise.all([
    getTripView(tripId),
    getTripExpenses(tripId),
    getTripMembers(tripId),
  ]);
  if (!trip) notFound();

  const estimated = trip.budget.reduce((s, l) => s + l.estimated, 0);
  const actual = expenses.reduce((s, e) => s + e.amount, 0);
  const variance = actual - estimated;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm">
          <p className="text-sm text-text-muted">Estimated budget</p>
          <Money centavos={estimated} size="lg" className="mt-1 block" />
        </div>
        <div className="rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm">
          <p className="text-sm text-text-muted">Actual spent</p>
          <Money centavos={actual} size="lg" className="mt-1 block" />
        </div>
        <div className="rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm">
          <p className="text-sm text-text-muted">Difference</p>
          <p className="mt-1">
            {actual === 0 ? (
              <span className="text-lg font-bold text-text-secondary">Nothing yet</span>
            ) : (
              <span className={`tnum text-lg font-bold ${variance > 0 ? "text-danger" : "text-success"}`}>
                {variance > 0 ? "+" : variance < 0 ? "-" : ""}
                <Money centavos={Math.abs(variance)} size="sm" />
                {variance > 0 ? " over" : variance < 0 ? " under" : ""}
              </span>
            )}
          </p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-card bg-surface p-8 text-center ring-1 ring-border shadow-soft-sm">
          <h2 className="text-lg font-bold tracking-tight">No expenses yet</h2>
          <p className="mt-2 text-[15px] text-text-secondary">
            Record what the group actually spends during the trip to compare it
            against the plan.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-card bg-surface ring-1 ring-border shadow-soft-sm">
          {expenses.map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-5 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.7rem] bg-accent-soft text-accent">
                <CategoryIcon category={e.category} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.description}</p>
                <p className="text-sm text-text-muted">
                  {toViewCategory(e.category)} · Paid by {e.paidByName}
                  {e.date ? ` · ${new Date(e.date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}` : ""}
                </p>
              </div>
              <Money centavos={e.amount} size="sm" className="shrink-0" />
              <InlineDelete
                action={deleteExpenseAction}
                fields={{ tripId: trip.id, expenseId: e.id }}
                confirmText="Remove this expense?"
              />
            </li>
          ))}
        </ul>
      )}

      <AddExpenseForm tripId={trip.id} members={members.map((m) => ({ id: m.id, name: m.name }))} />
    </div>
  );
}
