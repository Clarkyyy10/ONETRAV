"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pesosToCentavos, logActivity } from "@/lib/data/mutations";

export type ManageState = { error?: string; ok?: boolean };

export type SearchState = {
  error?: string;
  results?: { id: string; name: string; publicId: string; avatarUrl: string | null }[];
};

/* ------------------------- Trip settings ------------------------- */
const tripSchema = z.object({
  tripId: z.string().uuid(),
  name: z.string().trim().min(1, "Give your trip a name.").max(120),
  destination: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  fundingDeadline: z.string().optional(),
  status: z.enum(["planning", "funding", "ready", "ongoing", "completed", "cancelled"]),
  target: z.coerce.number().min(0).optional(),
  contributionMode: z.enum(["equal", "custom"]),
});

export async function updateTripAction(
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const parsed = tripSchema.safeParse({
    tripId: formData.get("tripId"),
    name: formData.get("name"),
    destination: formData.get("destination") ?? undefined,
    description: formData.get("description") ?? undefined,
    startDate: formData.get("startDate") ?? undefined,
    endDate: formData.get("endDate") ?? undefined,
    fundingDeadline: formData.get("fundingDeadline") ?? undefined,
    status: formData.get("status"),
    target: formData.get("target") ?? undefined,
    contributionMode: formData.get("contributionMode"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (parsed.data.startDate && parsed.data.endDate && parsed.data.endDate < parsed.data.startDate) {
    return { error: "The end date can't be before the start date." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase
    .from("trips")
    .update({
      name: parsed.data.name,
      destination: parsed.data.destination || null,
      description: parsed.data.description || null,
      start_date: parsed.data.startDate || null,
      end_date: parsed.data.endDate || null,
      funding_deadline: parsed.data.fundingDeadline || null,
      status: parsed.data.status,
      target_centavos: pesosToCentavos(parsed.data.target ?? 0),
      contribution_mode: parsed.data.contributionMode,
    })
    .eq("id", parsed.data.tripId);
  if (error) return { error: "You don't have permission to edit this trip." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "trip.updated",
    entityType: "trip",
    entityId: parsed.data.tripId,
    kind: "budget",
    text: "Updated the trip details",
  });
  revalidatePath(`/app/trips/${parsed.data.tripId}`);
  revalidatePath(`/app/trips/${parsed.data.tripId}/settings`);
  return { ok: true };
}

export async function updateTripCoverAction(
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const parsed = z
    .object({ tripId: z.string().uuid(), coverUrl: z.string().url() })
    .safeParse({ tripId: formData.get("tripId"), coverUrl: formData.get("coverUrl") });
  if (!parsed.success) return { error: "That image could not be saved." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase
    .from("trips")
    .update({ cover_image_url: parsed.data.coverUrl })
    .eq("id", parsed.data.tripId);
  if (error) return { error: "You don't have permission to change the cover." };

  revalidatePath(`/app/trips/${parsed.data.tripId}`);
  revalidatePath(`/app/trips/${parsed.data.tripId}/settings`);
  return { ok: true };
}

/* ------------------------- Invitations ------------------------- */
export async function searchUsersAction(
  _prev: SearchState,
  formData: FormData,
): Promise<SearchState> {
  const query = String(formData.get("query") ?? "").trim();
  if (query.length < 2) return { results: [] };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, public_id, avatar_url")
    .or(`public_id.ilike.%${query}%,name.ilike.%${query}%`)
    .limit(8);
  if (error) return { error: "Search failed. Please try again." };

  return {
    results: (data ?? [])
      .filter((p) => p.id !== user?.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        publicId: p.public_id,
        avatarUrl: p.avatar_url,
      })),
  };
}

export async function sendInvitationAction(
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const parsed = z
    .object({
      tripId: z.string().uuid(),
      inviteeId: z.string().uuid(),
      role: z.enum(["admin", "treasurer", "member"]).default("member"),
    })
    .safeParse({
      tripId: formData.get("tripId"),
      inviteeId: formData.get("inviteeId"),
      role: formData.get("role") ?? "member",
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase.from("invitations").insert({
    trip_id: parsed.data.tripId,
    inviter_id: user.id,
    invitee_id: parsed.data.inviteeId,
    role: parsed.data.role,
    status: "pending",
  });
  if (error) {
    return { error: "That person may already be invited or a member." };
  }

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "invitation.sent",
    entityType: "invitation",
    kind: "member",
    text: "Invited someone to the trip",
  });
  revalidatePath(`/app/trips/${parsed.data.tripId}/members`);
  return { ok: true };
}

export async function cancelInvitationAction(
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const parsed = z
    .object({ tripId: z.string().uuid(), inviteId: z.string().uuid() })
    .safeParse({ tripId: formData.get("tripId"), inviteId: formData.get("inviteId") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("invitations")
    .update({ status: "cancelled", responded_at: new Date().toISOString() })
    .eq("id", parsed.data.inviteId);
  if (error) return { error: "We couldn't cancel this invitation." };

  revalidatePath(`/app/trips/${parsed.data.tripId}/members`);
  return { ok: true };
}

/* ------------------------- Members ------------------------- */
export async function updateMemberRoleAction(
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const parsed = z
    .object({
      tripId: z.string().uuid(),
      userId: z.string().uuid(),
      role: z.enum(["admin", "treasurer", "member"]),
    })
    .safeParse({
      tripId: formData.get("tripId"),
      userId: formData.get("userId"),
      role: formData.get("role"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { data: trip } = await supabase
    .from("trips")
    .select("group_id, created_by")
    .eq("id", parsed.data.tripId)
    .maybeSingle();
  if (!trip) return { error: "Trip not found." };
  if (parsed.data.userId === trip.created_by) {
    return { error: "The trip creator's role can't be changed." };
  }

  const { error } = await supabase
    .from("group_members")
    .update({ role: parsed.data.role })
    .eq("group_id", trip.group_id)
    .eq("user_id", parsed.data.userId);
  if (error) return { error: "You don't have permission to change roles." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "member.role_changed",
    entityType: "member",
    entityId: parsed.data.userId,
    kind: "member",
    text: `Changed a member's role to ${parsed.data.role}`,
  });
  revalidatePath(`/app/trips/${parsed.data.tripId}/members`);
  return { ok: true };
}

export async function removeMemberAction(
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const parsed = z
    .object({ tripId: z.string().uuid(), userId: z.string().uuid() })
    .safeParse({ tripId: formData.get("tripId"), userId: formData.get("userId") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { data: trip } = await supabase
    .from("trips")
    .select("group_id, created_by")
    .eq("id", parsed.data.tripId)
    .maybeSingle();
  if (!trip) return { error: "Trip not found." };
  if (parsed.data.userId === trip.created_by) {
    return { error: "The trip creator can't be removed." };
  }

  // Safe removal: preserve financial history. Mark participation as left and
  // revoke access via group membership status. Contributions are untouched.
  await supabase
    .from("trip_members")
    .update({ participation_status: "left" })
    .eq("trip_id", parsed.data.tripId)
    .eq("user_id", parsed.data.userId);
  const { error } = await supabase
    .from("group_members")
    .update({ status: "removed" })
    .eq("group_id", trip.group_id)
    .eq("user_id", parsed.data.userId);
  if (error) return { error: "You don't have permission to remove members." };

  await logActivity(supabase, {
    tripId: parsed.data.tripId,
    actorId: user.id,
    action: "member.removed",
    entityType: "member",
    entityId: parsed.data.userId,
    kind: "member",
    text: "Removed a member from the trip",
  });
  revalidatePath(`/app/trips/${parsed.data.tripId}/members`);
  return { ok: true };
}
