"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pesosToCentavos, ensureGroup, logActivity } from "@/lib/data/mutations";

export type ActionState = { error?: string };

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "trip"
  );
}

const createTripSchema = z.object({
  name: z.string().trim().min(1, "Give your trip a name.").max(120),
  destination: z.string().trim().max(120).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  target: z.coerce.number().min(0).optional(),
});

export async function createTripAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createTripSchema.safeParse({
    name: formData.get("name"),
    destination: formData.get("destination") ?? undefined,
    startDate: formData.get("startDate") ?? undefined,
    endDate: formData.get("endDate") ?? undefined,
    target: formData.get("target") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { startDate, endDate } = parsed.data;
  if (startDate && endDate && endDate < startDate) {
    return { error: "The end date can't be before the start date." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const displayName =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "You";
  const groupId = await ensureGroup(supabase, user.id, displayName);
  if (!groupId) return { error: "We couldn't set up your group. Please try again." };

  const targetCentavos = pesosToCentavos(parsed.data.target ?? 0);
  const { data: trip, error } = await supabase
    .from("trips")
    .insert({
      group_id: groupId,
      name: parsed.data.name,
      destination: parsed.data.destination || null,
      start_date: startDate || null,
      end_date: endDate || null,
      status: targetCentavos > 0 ? "funding" : "planning",
      target_centavos: targetCentavos,
      cover_seed: slugify(parsed.data.destination || parsed.data.name),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !trip) {
    return { error: "We couldn't create this trip. Please try again." };
  }

  await supabase.from("trip_members").insert({
    trip_id: trip.id,
    user_id: user.id,
    contribution_target_centavos: targetCentavos,
  });

  await logActivity(supabase, {
    tripId: trip.id,
    groupId,
    actorId: user.id,
    action: "trip.created",
    entityType: "trip",
    entityId: trip.id,
    kind: "member",
    text: `Created the trip "${parsed.data.name}"`,
  });

  revalidatePath("/app");
  redirect(`/app/trips/${trip.id}`);
}

/** Seed a fully-populated sample trip so a new account has something to explore. */
export async function seedSampleTripAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const displayName =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "You";
  const groupId = await ensureGroup(supabase, user.id, displayName);
  if (!groupId) redirect("/app");

  const target = 3060000; // ₱30,600
  const { data: trip } = await supabase
    .from("trips")
    .insert({
      group_id: groupId,
      name: "Batangas Staycation",
      destination: "Laiya, Batangas",
      start_date: "2026-11-20",
      end_date: "2026-11-22",
      funding_deadline: "2026-11-10",
      status: "funding",
      target_centavos: target,
      cover_seed: "batangas-beach-resort-philippines",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (!trip) redirect("/app");
  const tripId = trip.id;

  await supabase.from("trip_members").insert({
    trip_id: tripId,
    user_id: user.id,
    contribution_target_centavos: target,
  });

  await supabase.from("budget_items").insert([
    { trip_id: tripId, category: "accommodation", name: "Beachfront villa (2 nights)", estimated_centavos: 1200000, actual_centavos: 1200000, status: "paid", created_by: user.id },
    { trip_id: tripId, category: "transportation", name: "Van rental + fuel + toll", estimated_centavos: 380000, created_by: user.id },
    { trip_id: tripId, category: "food", name: "Groceries + shared meals", estimated_centavos: 980000, created_by: user.id },
    { trip_id: tripId, category: "activity", name: "Island hopping (6 pax)", estimated_centavos: 240000, created_by: user.id },
    { trip_id: tripId, category: "entrance", name: "Resort day pass", estimated_centavos: 210000, created_by: user.id },
    { trip_id: tripId, category: "other", name: "First-aid + contingency", estimated_centavos: 50000, created_by: user.id },
  ]);

  const { data: days } = await supabase
    .from("itinerary_days")
    .insert([
      { trip_id: tripId, title: "Day 1", date: "2026-11-20", sort_order: 0 },
      { trip_id: tripId, title: "Day 2", date: "2026-11-21", sort_order: 1 },
      { trip_id: tripId, title: "Day 3", date: "2026-11-22", sort_order: 2 },
    ])
    .select("id, sort_order");

  if (days) {
    const byOrder = (n: number) => days.find((d) => d.sort_order === n)!.id;
    await supabase.from("itinerary_items").insert([
      { trip_id: tripId, itinerary_day_id: byOrder(0), start_time: "07:00", title: "Travel to Laiya", description: "Van pickup, fuel and toll", category: "transportation", estimated_centavos: 230000, sort_order: 0 },
      { trip_id: tripId, itinerary_day_id: byOrder(0), start_time: "14:00", title: "Villa check-in", description: "Beachfront villa, 2 nights", category: "accommodation", estimated_centavos: 1200000, sort_order: 1 },
      { trip_id: tripId, itinerary_day_id: byOrder(0), start_time: "18:30", title: "Welcome dinner", description: "Grilled seafood, cooked in", category: "food", estimated_centavos: 320000, sort_order: 2 },
      { trip_id: tripId, itinerary_day_id: byOrder(1), start_time: "09:00", title: "Island hopping", description: "6 pax, boat and guide", category: "activity", estimated_centavos: 240000, sort_order: 0 },
      { trip_id: tripId, itinerary_day_id: byOrder(1), start_time: "13:00", title: "Beach picnic", description: "Groceries prepared ahead", category: "food", estimated_centavos: 260000, sort_order: 1 },
      { trip_id: tripId, itinerary_day_id: byOrder(2), start_time: "10:00", title: "Check-out + brunch", description: "Last shared meal", category: "food", estimated_centavos: 220000, sort_order: 0 },
    ]);
  }

  // A verified contribution and a pending one, both from the current user.
  await supabase.from("contributions").insert([
    { trip_id: tripId, member_user_id: user.id, amount_centavos: 1200000, status: "verified", payment_method: "GCash", verified_by: user.id, verified_at: new Date().toISOString() },
    { trip_id: tripId, member_user_id: user.id, amount_centavos: 300000, status: "pending", payment_method: "Bank transfer" },
  ]);

  await logActivity(supabase, {
    tripId,
    groupId,
    actorId: user.id,
    action: "trip.created",
    entityType: "trip",
    entityId: tripId,
    kind: "member",
    text: "Created the Batangas Staycation sample trip",
  });

  revalidatePath("/app");
  redirect(`/app/trips/${tripId}`);
}
