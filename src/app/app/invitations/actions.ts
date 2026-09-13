"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/data/mutations";

export type InviteState = { error?: string; ok?: boolean };

export async function acceptInvitationAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const parsed = z
    .object({ inviteId: z.string().uuid() })
    .safeParse({ inviteId: formData.get("inviteId") });
  if (!parsed.success) return { error: "Invalid invitation." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  // Load the invite (RLS: only the invitee can see it) and its trip/group.
  const { data: invite } = await supabase
    .from("invitations")
    .select("id, trip_id, role, status, trips(group_id, name)")
    .eq("id", parsed.data.inviteId)
    .eq("invitee_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (!invite) return { error: "This invitation is no longer available." };

  const trip = invite.trips as unknown as { group_id: string; name: string } | null;
  if (!trip) return { error: "That trip no longer exists." };

  // Join group + trip (RLS permits self-join while the invite is pending).
  await supabase
    .from("group_members")
    .upsert(
      { group_id: trip.group_id, user_id: user.id, role: invite.role, status: "active" },
      { onConflict: "group_id,user_id", ignoreDuplicates: true },
    );
  await supabase
    .from("trip_members")
    .upsert(
      { trip_id: invite.trip_id, user_id: user.id },
      { onConflict: "trip_id,user_id", ignoreDuplicates: true },
    );

  const { error } = await supabase
    .from("invitations")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", invite.id);
  if (error) return { error: "We couldn't accept this invitation." };

  await logActivity(supabase, {
    tripId: invite.trip_id,
    groupId: trip.group_id,
    actorId: user.id,
    action: "invitation.accepted",
    entityType: "invitation",
    entityId: invite.id,
    kind: "member",
    text: `Joined the trip "${trip.name}"`,
  });

  revalidatePath("/app/invitations");
  revalidatePath("/app");
  return { ok: true };
}

export async function declineInvitationAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const parsed = z
    .object({ inviteId: z.string().uuid() })
    .safeParse({ inviteId: formData.get("inviteId") });
  if (!parsed.success) return { error: "Invalid invitation." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("invitations")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .eq("id", parsed.data.inviteId);
  if (error) return { error: "We couldn't decline this invitation." };

  revalidatePath("/app/invitations");
  return { ok: true };
}
