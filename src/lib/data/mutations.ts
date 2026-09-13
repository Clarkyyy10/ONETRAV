import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/database.types";

type DB = SupabaseClient<Database>;

/** Peso decimal string/number to integer centavos. */
export function pesosToCentavos(input: string | number): number {
  const n = typeof input === "string" ? parseFloat(input) : input;
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

/** Append an audit record. Best-effort: logging never blocks the main write. */
export async function logActivity(
  supabase: DB,
  entry: {
    tripId?: string;
    groupId?: string;
    actorId: string;
    action: string;
    entityType: string;
    entityId?: string;
    kind: string;
    text: string;
  },
): Promise<void> {
  await supabase.from("activity_logs").insert({
    trip_id: entry.tripId ?? null,
    group_id: entry.groupId ?? null,
    actor_user_id: entry.actorId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    metadata: { kind: entry.kind, text: entry.text } as Json,
  });
}

/**
 * Ensure the user has a group to hang trips off. Returns a group id the user
 * owns, creating a personal group (and owner membership) on first use.
 */
export async function ensureGroup(
  supabase: DB,
  userId: string,
  userName: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("groups")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name: `${userName}'s group`, owner_id: userId })
    .select("id")
    .single();
  if (error || !group) return null;

  await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: userId,
    role: "owner",
    status: "active",
  });

  return group.id;
}
