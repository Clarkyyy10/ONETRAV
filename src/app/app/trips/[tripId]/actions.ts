"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pesosToCentavos, logActivity } from "@/lib/data/mutations";
import { formatPeso, computeEstimatedCentavos, type CostType } from "@/lib/money";

export type ActionState = { error?: string; ok?: boolean };

function revalidateTrip(tripId: string, ...subpaths: string[]) {
  revalidatePath(`/app/trips/${tripId}`);
  for (const p of subpaths) revalidatePath(`/app/trips/${tripId}/${p}`);
}

const costTypeSchema = z.enum(["fixed", "per_person", "quantity"]);

/** Estimated centavos from cost-type inputs (peso decimals in). */
function estimate(
  costType: CostType,
  amount?: number,
  unitPrice?: number,
  quantity?: number,
): number {
  return computeEstimatedCentavos(costType, {
    amount: pesosToCentavos(amount ?? 0),
    unitPriceCentavos: pesosToCentavos(unitPrice ?? 0),
    quantity: quantity ?? 0,
  });
}

/* ============================ CONTRIBUTIONS ============================ */

const contributionSchema = z.object({
  tripId: z.string().uuid(),
  amount: z.coerce.number().positive("Enter an amount greater than zero."),
  method: z.string().trim().max(40).optional(),
});

export async function addContributionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = contributionSchema.safeParse({
    tripId: formData.get("tripId"),
    amount: formData.get("amount"),
    method: formData.get("method") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const amountCentavos = pesosToCentavos(parsed.data.amount);
  const { error } = await supabase.from("contributions").insert({
    trip_id: parsed.data.tripId,
    member_user_id: user.id,
    amount_centavos: amountCentavos,
    payment_method: parsed.data.method || null,
    status: "pending",
  });
  if (error) return { error: "We couldn't record this contribution. Please try again." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "contribution.submitted",
    entityType: "contribution",
    kind: "contribution",
    text: `Logged a ${formatPeso(amountCentavos)} contribution (pending)`,
  });

  revalidateTrip(parsed.data.tripId, "contributions");
  return { ok: true };
}

const verifySchema = z.object({
  tripId: z.string().uuid(),
  contributionId: z.string().uuid(),
});

export async function verifyContributionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = verifySchema.safeParse({
    tripId: formData.get("tripId"),
    contributionId: formData.get("contributionId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { data: updated, error } = await supabase
    .from("contributions")
    .update({
      status: "verified",
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.contributionId)
    .eq("status", "pending")
    .select("amount_centavos")
    .maybeSingle();

  if (error) return { error: "You don't have permission to verify contributions." };
  if (updated) {
    await logActivity(supabase, {
      tripId: parsed.data.tripId,
      actorId: user.id,
      action: "contribution.verified",
      entityType: "contribution",
      entityId: parsed.data.contributionId,
      kind: "verified",
      text: `Verified a ${formatPeso(updated.amount_centavos)} contribution`,
    });
  }
  revalidateTrip(parsed.data.tripId, "contributions");
  return { ok: true };
}

const contributionStatuses = ["pending", "verified", "rejected", "refunded", "cancelled"] as const;

export async function setContributionStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({
      tripId: z.string().uuid(),
      contributionId: z.string().uuid(),
      status: z.enum(contributionStatuses),
    })
    .safeParse({
      tripId: formData.get("tripId"),
      contributionId: formData.get("contributionId"),
      status: formData.get("status"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const patch: {
    status: (typeof contributionStatuses)[number];
    verified_by?: string;
    verified_at?: string;
  } = { status: parsed.data.status };
  if (parsed.data.status === "verified") {
    patch.verified_by = user.id;
    patch.verified_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from("contributions")
    .update(patch)
    .eq("id", parsed.data.contributionId);
  if (error) return { error: "You don't have permission to change this contribution." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "contribution.status_changed",
    entityType: "contribution",
    entityId: parsed.data.contributionId,
    kind: "verified",
    text: `Marked a contribution as ${parsed.data.status}`,
  });
  revalidateTrip(parsed.data.tripId, "contributions");
  return { ok: true };
}

export async function deleteContributionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = verifySchema.safeParse({
    tripId: formData.get("tripId"),
    contributionId: formData.get("contributionId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase
    .from("contributions")
    .delete()
    .eq("id", parsed.data.contributionId);
  if (error) return { error: "This contribution can't be removed." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "contribution.deleted",
    entityType: "contribution",
    kind: "contribution",
    text: "Removed a pending contribution",
  });
  revalidateTrip(parsed.data.tripId, "contributions");
  return { ok: true };
}

/* ============================== BUDGET ============================== */

const budgetSchema = z.object({
  tripId: z.string().uuid(),
  name: z.string().trim().min(1, "Give the item a name.").max(120),
  category: z.string().trim().min(1, "Choose or type a category.").max(40),
  costType: costTypeSchema.default("fixed"),
  amount: z.coerce.number().min(0).optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().int().min(0).optional(),
});

export async function addBudgetItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = budgetSchema.safeParse({
    tripId: formData.get("tripId"),
    name: formData.get("name"),
    category: formData.get("category"),
    costType: formData.get("costType") ?? "fixed",
    amount: formData.get("amount") ?? undefined,
    unitPrice: formData.get("unitPrice") ?? undefined,
    quantity: formData.get("quantity") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const estimatedCentavos = estimate(
    parsed.data.costType,
    parsed.data.amount,
    parsed.data.unitPrice,
    parsed.data.quantity,
  );
  const { error } = await supabase.from("budget_items").insert({
    trip_id: parsed.data.tripId,
    name: parsed.data.name,
    category: parsed.data.category.toLowerCase(),
    cost_type: parsed.data.costType,
    unit_price_centavos: pesosToCentavos(parsed.data.unitPrice ?? 0),
    quantity: parsed.data.quantity ?? 1,
    estimated_centavos: estimatedCentavos,
    created_by: user.id,
  });
  if (error) return { error: "We couldn't add this budget item. Please try again." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "budget.added",
    entityType: "budget_item",
    kind: "budget",
    text: `Added "${parsed.data.name}" (${formatPeso(estimatedCentavos)}) to the budget`,
  });
  revalidateTrip(parsed.data.tripId, "budget");
  return { ok: true };
}

export async function updateBudgetItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = budgetSchema
    .extend({ itemId: z.string().uuid(), actual: z.coerce.number().min(0).optional() })
    .safeParse({
      itemId: formData.get("itemId"),
      tripId: formData.get("tripId"),
      name: formData.get("name"),
      category: formData.get("category"),
      costType: formData.get("costType") ?? "fixed",
      amount: formData.get("amount") ?? undefined,
      unitPrice: formData.get("unitPrice") ?? undefined,
      quantity: formData.get("quantity") ?? undefined,
      actual: formData.get("actual") ?? undefined,
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const estimatedCentavos = estimate(
    parsed.data.costType,
    parsed.data.amount,
    parsed.data.unitPrice,
    parsed.data.quantity,
  );
  const actualStr = formData.get("actual");
  const { error } = await supabase
    .from("budget_items")
    .update({
      name: parsed.data.name,
      category: parsed.data.category.toLowerCase(),
      cost_type: parsed.data.costType,
      unit_price_centavos: pesosToCentavos(parsed.data.unitPrice ?? 0),
      quantity: parsed.data.quantity ?? 1,
      estimated_centavos: estimatedCentavos,
      actual_centavos:
        actualStr === null || actualStr === ""
          ? null
          : pesosToCentavos(parsed.data.actual ?? 0),
    })
    .eq("id", parsed.data.itemId);
  if (error) return { error: "We couldn't save this budget item." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "budget.updated",
    entityType: "budget_item",
    entityId: parsed.data.itemId,
    kind: "budget",
    text: `Updated "${parsed.data.name}" in the budget`,
  });
  revalidateTrip(parsed.data.tripId, "budget");
  return { ok: true };
}

export async function deleteBudgetItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({ tripId: z.string().uuid(), itemId: z.string().uuid() })
    .safeParse({ tripId: formData.get("tripId"), itemId: formData.get("itemId") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase.from("budget_items").delete().eq("id", parsed.data.itemId);
  if (error) return { error: "We couldn't remove this budget item." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "budget.deleted",
    entityType: "budget_item",
    kind: "budget",
    text: "Removed a budget item",
  });
  revalidateTrip(parsed.data.tripId, "budget");
  return { ok: true };
}

/* ========================= ITINERARY DAYS ========================= */

const daySchema = z.object({
  tripId: z.string().uuid(),
  title: z.string().trim().max(80).optional(),
  date: z.string().optional(),
});

export async function addItineraryDayAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = daySchema.safeParse({
    tripId: formData.get("tripId"),
    title: formData.get("title") ?? undefined,
    date: formData.get("date") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { count } = await supabase
    .from("itinerary_days")
    .select("id", { count: "exact", head: true })
    .eq("trip_id", parsed.data.tripId);
  const order = count ?? 0;
  const title = parsed.data.title?.trim() || `Day ${order + 1}`;

  const { error } = await supabase.from("itinerary_days").insert({
    trip_id: parsed.data.tripId,
    title,
    date: parsed.data.date || null,
    sort_order: order,
  });
  if (error) return { error: "We couldn't add this day. Please try again." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "itinerary.day_added",
    entityType: "itinerary_day",
    kind: "budget",
    text: `Added ${title} to the itinerary`,
  });
  revalidateTrip(parsed.data.tripId, "itinerary", "locations");
  return { ok: true };
}

export async function updateItineraryDayAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = daySchema
    .extend({ dayId: z.string().uuid() })
    .safeParse({
      dayId: formData.get("dayId"),
      tripId: formData.get("tripId"),
      title: formData.get("title") ?? undefined,
      date: formData.get("date") ?? undefined,
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase
    .from("itinerary_days")
    .update({
      title: parsed.data.title?.trim() || null,
      date: parsed.data.date || null,
    })
    .eq("id", parsed.data.dayId);
  if (error) return { error: "We couldn't rename this day." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "itinerary.day_updated",
    entityType: "itinerary_day",
    entityId: parsed.data.dayId,
    kind: "budget",
    text: "Updated an itinerary day",
  });
  revalidateTrip(parsed.data.tripId, "itinerary", "locations");
  return { ok: true };
}

export async function deleteItineraryDayAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({ tripId: z.string().uuid(), dayId: z.string().uuid() })
    .safeParse({ tripId: formData.get("tripId"), dayId: formData.get("dayId") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase.from("itinerary_days").delete().eq("id", parsed.data.dayId);
  if (error) return { error: "We couldn't remove this day." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "itinerary.day_deleted",
    entityType: "itinerary_day",
    kind: "budget",
    text: "Removed an itinerary day",
  });
  revalidateTrip(parsed.data.tripId, "itinerary", "locations");
  return { ok: true };
}

/* ========================= ITINERARY ITEMS ========================= */

const itemSchema = z.object({
  tripId: z.string().uuid(),
  dayId: z.string().uuid(),
  title: z.string().trim().min(1, "Give the stop a name.").max(120),
  category: z.string().trim().min(1).max(40).default("other"),
  time: z.string().trim().max(20).optional(),
  location: z.string().trim().max(160).optional(),
  mapLink: z.string().trim().max(600).optional(),
  description: z.string().trim().max(300).optional(),
  costType: costTypeSchema.default("fixed"),
  amount: z.coerce.number().min(0).optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().int().min(0).optional(),
});

function itemInsertFields(d: z.infer<typeof itemSchema>) {
  return {
    title: d.title,
    category: d.category.toLowerCase(),
    start_time: d.time || null,
    location: d.location || null,
    map_link: d.mapLink || null,
    description: d.description || null,
    cost_type: d.costType,
    unit_price_centavos: pesosToCentavos(d.unitPrice ?? 0),
    quantity: d.quantity ?? 1,
    estimated_centavos: estimate(d.costType, d.amount, d.unitPrice, d.quantity),
  };
}

function parseItem(formData: FormData) {
  return itemSchema.safeParse({
    tripId: formData.get("tripId"),
    dayId: formData.get("dayId"),
    title: formData.get("title"),
    category: formData.get("category") || "other",
    time: formData.get("time") ?? undefined,
    location: formData.get("location") ?? undefined,
    mapLink: formData.get("mapLink") ?? undefined,
    description: formData.get("description") ?? undefined,
    costType: formData.get("costType") ?? "fixed",
    amount: formData.get("amount") ?? undefined,
    unitPrice: formData.get("unitPrice") ?? undefined,
    quantity: formData.get("quantity") ?? undefined,
  });
}

export async function addItineraryItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseItem(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { count } = await supabase
    .from("itinerary_items")
    .select("id", { count: "exact", head: true })
    .eq("itinerary_day_id", parsed.data.dayId);

  const fields = itemInsertFields(parsed.data);
  const { error } = await supabase.from("itinerary_items").insert({
    trip_id: parsed.data.tripId,
    itinerary_day_id: parsed.data.dayId,
    sort_order: count ?? 0,
    ...fields,
  });
  if (error) return { error: "We couldn't add this stop. Please try again." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "itinerary.item_added",
    entityType: "itinerary_item",
    kind: "budget",
    text: `Added "${parsed.data.title}" (${formatPeso(fields.estimated_centavos)}) to the itinerary`,
  });
  revalidateTrip(parsed.data.tripId, "itinerary", "budget", "locations");
  return { ok: true };
}

export async function updateItineraryItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const base = parseItem(formData);
  const itemId = formData.get("itemId");
  if (!base.success) return { error: base.error.issues[0].message };
  if (typeof itemId !== "string") return { error: "Missing item." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase
    .from("itinerary_items")
    .update(itemInsertFields(base.data))
    .eq("id", itemId);
  if (error) return { error: "We couldn't save this stop." };

  await logActivity(supabase, {
    tripId: base.data.tripId,
    actorId: user.id,
    action: "itinerary.item_updated",
    entityType: "itinerary_item",
    entityId: itemId,
    kind: "budget",
    text: `Updated "${base.data.title}" in the itinerary`,
  });
  revalidateTrip(base.data.tripId, "itinerary", "budget", "locations");
  return { ok: true };
}

export async function deleteItineraryItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({ tripId: z.string().uuid(), itemId: z.string().uuid() })
    .safeParse({ tripId: formData.get("tripId"), itemId: formData.get("itemId") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase.from("itinerary_items").delete().eq("id", parsed.data.itemId);
  if (error) return { error: "We couldn't remove this stop." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "itinerary.item_deleted",
    entityType: "itinerary_item",
    kind: "budget",
    text: "Removed an itinerary stop",
  });
  revalidateTrip(parsed.data.tripId, "itinerary", "budget", "locations");
  return { ok: true };
}

export async function moveItineraryItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({
      tripId: z.string().uuid(),
      itemId: z.string().uuid(),
      direction: z.enum(["up", "down"]),
    })
    .safeParse({
      tripId: formData.get("tripId"),
      itemId: formData.get("itemId"),
      direction: formData.get("direction"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { data: item } = await supabase
    .from("itinerary_items")
    .select("id, itinerary_day_id, sort_order")
    .eq("id", parsed.data.itemId)
    .maybeSingle();
  if (!item) return { error: "That stop no longer exists." };

  const { data: siblings } = await supabase
    .from("itinerary_items")
    .select("id, sort_order")
    .eq("itinerary_day_id", item.itinerary_day_id)
    .order("sort_order");
  if (!siblings) return { ok: true };

  const idx = siblings.findIndex((s) => s.id === item.id);
  const target = parsed.data.direction === "up" ? idx - 1 : idx + 1;
  if (target < 0 || target >= siblings.length) return { ok: true };

  const neighbor = siblings[target];
  await supabase.from("itinerary_items").update({ sort_order: neighbor.sort_order }).eq("id", item.id);
  await supabase.from("itinerary_items").update({ sort_order: item.sort_order }).eq("id", neighbor.id);

  revalidateTrip(parsed.data.tripId, "itinerary");
  return { ok: true };
}

/* ============================== EXPENSES ============================== */

const expenseSchema = z.object({
  tripId: z.string().uuid(),
  description: z.string().trim().min(1, "Describe the expense.").max(160),
  category: z.string().trim().min(1).max(40).default("other"),
  amount: z.coerce.number().min(0, "Amount can't be negative."),
  paidBy: z.string().uuid().optional(),
  date: z.string().optional(),
});

export async function addExpenseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = expenseSchema.safeParse({
    tripId: formData.get("tripId"),
    description: formData.get("description"),
    category: formData.get("category") || "other",
    amount: formData.get("amount"),
    paidBy: formData.get("paidBy") || undefined,
    date: formData.get("date") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const amountCentavos = pesosToCentavos(parsed.data.amount);
  const { error } = await supabase.from("expenses").insert({
    trip_id: parsed.data.tripId,
    description: parsed.data.description,
    category: parsed.data.category.toLowerCase(),
    amount_centavos: amountCentavos,
    paid_by: parsed.data.paidBy || user.id,
    expense_date: parsed.data.date || null,
    created_by: user.id,
    status: "recorded",
  });
  if (error) return { error: "We couldn't record this expense. Please try again." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "expense.added",
    entityType: "expense",
    kind: "expense",
    text: `Recorded "${parsed.data.description}" (${formatPeso(amountCentavos)})`,
  });
  revalidateTrip(parsed.data.tripId, "expenses");
  return { ok: true };
}

export async function updateExpenseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = expenseSchema
    .extend({ expenseId: z.string().uuid() })
    .safeParse({
      expenseId: formData.get("expenseId"),
      tripId: formData.get("tripId"),
      description: formData.get("description"),
      category: formData.get("category") || "other",
      amount: formData.get("amount"),
      paidBy: formData.get("paidBy") || undefined,
      date: formData.get("date") ?? undefined,
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase
    .from("expenses")
    .update({
      description: parsed.data.description,
      category: parsed.data.category.toLowerCase(),
      amount_centavos: pesosToCentavos(parsed.data.amount),
      paid_by: parsed.data.paidBy || user.id,
      expense_date: parsed.data.date || null,
    })
    .eq("id", parsed.data.expenseId);
  if (error) return { error: "We couldn't save this expense." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "expense.updated",
    entityType: "expense",
    entityId: parsed.data.expenseId,
    kind: "expense",
    text: `Updated "${parsed.data.description}"`,
  });
  revalidateTrip(parsed.data.tripId, "expenses");
  return { ok: true };
}

export async function deleteExpenseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({ tripId: z.string().uuid(), expenseId: z.string().uuid() })
    .safeParse({ tripId: formData.get("tripId"), expenseId: formData.get("expenseId") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase.from("expenses").delete().eq("id", parsed.data.expenseId);
  if (error) return { error: "We couldn't remove this expense." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "expense.deleted",
    entityType: "expense",
    kind: "expense",
    text: "Removed an expense",
  });
  revalidateTrip(parsed.data.tripId, "expenses");
  return { ok: true };
}
