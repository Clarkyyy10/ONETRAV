"use client";

import { useState } from "react";
import {
  PencilSimple,
  Trash,
  ArrowUp,
  ArrowDown,
  MapPin,
  ArrowSquareOut,
  Plus,
  Check,
} from "@phosphor-icons/react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { AddDayForm } from "@/components/app/AddDayForm";
import { ItineraryItemForm, type ItemDefaults } from "@/components/app/ItineraryItemForm";
import {
  moveItineraryItemAction,
  deleteItineraryItemAction,
  deleteItineraryDayAction,
  updateItineraryDayAction,
  type ActionState,
} from "@/app/app/trips/[tripId]/actions";
import { formatPeso } from "@/lib/money";
import type { ItineraryDayRaw, ItineraryItemRaw } from "@/lib/data/trips";

/** Adapt a useActionState-style action for use as a plain <form action>. */
const asFormAction =
  (a: (p: ActionState, fd: FormData) => Promise<ActionState>) =>
  (fd: FormData) => {
    void a({}, fd);
  };

function peso(c: number): string {
  return c % 100 === 0 ? String(c / 100) : (c / 100).toFixed(2);
}

function mapHref(item: ItineraryItemRaw): string | null {
  if (item.map_link) return item.map_link;
  if (item.location)
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`;
  return null;
}

function toDefaults(it: ItineraryItemRaw): ItemDefaults {
  const fixed = it.cost_type === "fixed";
  return {
    itemId: it.id,
    title: it.title,
    description: it.description ?? "",
    time: it.start_time ?? "",
    location: it.location ?? "",
    mapLink: it.map_link ?? "",
    category: it.category,
    costType: it.cost_type,
    amount: fixed ? peso(it.estimated_centavos) : "",
    unitPrice: fixed ? "" : peso(it.unit_price_centavos),
    quantity: fixed ? "" : String(it.quantity),
  };
}

const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-40";

export function ItineraryEditor({
  tripId,
  days,
}: {
  tripId: string;
  days: ItineraryDayRaw[];
}) {
  const [editItem, setEditItem] = useState<string | null>(null);
  const [addItemDay, setAddItemDay] = useState<string | null>(null);
  const [editDay, setEditDay] = useState<string | null>(null);

  if (days.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <h2 className="text-xl font-bold tracking-tight">No days yet</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
          Add the first day, then drop in each stop with its location and cost.
        </p>
        <div className="mt-6">
          <AddDayForm tripId={tripId} variant="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      {days.map((day, dayIndex) => {
        const dayTotal = day.items.reduce((s, i) => s + i.estimated_centavos, 0);
        return (
          <section key={day.id}>
            <div className="flex items-start justify-between gap-3">
              {editDay === day.id ? (
                <form
                  action={asFormAction(updateItineraryDayAction)}
                  className="flex flex-1 flex-wrap items-center gap-2"
                  onSubmit={() => setTimeout(() => setEditDay(null), 0)}
                >
                  <input type="hidden" name="tripId" value={tripId} />
                  <input type="hidden" name="dayId" value={day.id} />
                  <input
                    name="title"
                    defaultValue={day.title ?? ""}
                    placeholder={`Day ${dayIndex + 1}`}
                    className="rounded-control border border-border-strong bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
                  />
                  <input
                    name="date"
                    type="date"
                    defaultValue={day.date ?? ""}
                    className="rounded-control border border-border-strong bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
                  />
                  <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-fg">
                    <Check size={16} weight="bold" />
                  </button>
                </form>
              ) : (
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">
                    {day.title || `Day ${dayIndex + 1}`}
                  </h2>
                  {day.date && (
                    <p className="text-sm text-text-muted">
                      {new Date(day.date).toLocaleDateString("en-PH", {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1">
                <p className="tnum mr-1 text-sm font-semibold text-text-secondary">
                  {formatPeso(dayTotal)}
                </p>
                <button onClick={() => setEditDay(editDay === day.id ? null : day.id)} className={iconBtn} title="Rename day">
                  <PencilSimple size={16} weight="bold" />
                </button>
                <form
                  action={asFormAction(deleteItineraryDayAction)}
                  onSubmit={(e) => {
                    if (!confirm("Remove this day and its stops?")) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="tripId" value={tripId} />
                  <input type="hidden" name="dayId" value={day.id} />
                  <button type="submit" className={iconBtn} title="Delete day">
                    <Trash size={16} weight="bold" />
                  </button>
                </form>
              </div>
            </div>

            <ol className="mt-4 space-y-3 border-l border-border pl-5">
              {day.items.map((item, itemIndex) => {
                const href = mapHref(item);
                if (editItem === item.id) {
                  return (
                    <li key={item.id} className="relative">
                      <ItineraryItemForm
                        tripId={tripId}
                        dayId={day.id}
                        defaults={toDefaults(item)}
                        onDone={() => setEditItem(null)}
                      />
                    </li>
                  );
                }
                return (
                  <li key={item.id} className="relative">
                    <span className="absolute -left-[27px] top-4 flex h-5 w-5 items-center justify-center rounded-full bg-surface ring-2 ring-border">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    </span>
                    <div className="rounded-card bg-surface p-4 ring-1 ring-border shadow-soft-sm">
                      <div className="flex items-start gap-3">
                        <span className="tnum w-12 shrink-0 pt-0.5 text-sm font-semibold text-text-muted">
                          {item.start_time || "--"}
                        </span>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.7rem] bg-accent-soft text-accent">
                          <CategoryIcon category={item.category} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{item.title}</p>
                          {item.description && (
                            <p className="text-sm text-text-muted">{item.description}</p>
                          )}
                          {item.location && (
                            <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
                              <MapPin size={14} weight="fill" className="text-accent" />
                              {item.location}
                            </p>
                          )}
                          {href && (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                            >
                              Open in Google Maps
                              <ArrowSquareOut size={13} weight="bold" />
                            </a>
                          )}
                        </div>
                        <span className="tnum shrink-0 text-sm font-semibold">
                          {formatPeso(item.estimated_centavos)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-end gap-1 border-t border-border pt-2">
                        <form action={asFormAction(moveItineraryItemAction)}>
                          <input type="hidden" name="tripId" value={tripId} />
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="direction" value="up" />
                          <button type="submit" disabled={itemIndex === 0} className={iconBtn} title="Move up">
                            <ArrowUp size={15} weight="bold" />
                          </button>
                        </form>
                        <form action={asFormAction(moveItineraryItemAction)}>
                          <input type="hidden" name="tripId" value={tripId} />
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="direction" value="down" />
                          <button type="submit" disabled={itemIndex === day.items.length - 1} className={iconBtn} title="Move down">
                            <ArrowDown size={15} weight="bold" />
                          </button>
                        </form>
                        <button onClick={() => setEditItem(item.id)} className={iconBtn} title="Edit stop">
                          <PencilSimple size={15} weight="bold" />
                        </button>
                        <form
                          action={asFormAction(deleteItineraryItemAction)}
                          onSubmit={(e) => {
                            if (!confirm("Remove this stop?")) e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="tripId" value={tripId} />
                          <input type="hidden" name="itemId" value={item.id} />
                          <button type="submit" className={iconBtn} title="Delete stop">
                            <Trash size={15} weight="bold" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-3 pl-5">
              {addItemDay === day.id ? (
                <ItineraryItemForm
                  tripId={tripId}
                  dayId={day.id}
                  onDone={() => setAddItemDay(null)}
                />
              ) : (
                <button
                  onClick={() => setAddItemDay(day.id)}
                  className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft"
                >
                  <Plus size={16} weight="bold" />
                  Add a stop
                </button>
              )}
            </div>
          </section>
        );
      })}

      <div className="flex justify-center border-t border-border pt-8">
        <AddDayForm tripId={tripId} />
      </div>
    </div>
  );
}
