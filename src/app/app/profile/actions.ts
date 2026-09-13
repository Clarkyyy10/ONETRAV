"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; ok?: boolean };

export async function updateProfileNameAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = z
    .object({ name: z.string().trim().min(1, "Enter a name.").max(80) })
    .safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase
    .from("profiles")
    .update({ name: parsed.data.name })
    .eq("id", user.id);
  if (error) return { error: "We couldn't save your name." };

  revalidatePath("/app/profile");
  return { ok: true };
}

export async function updateAvatarAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = z
    .object({ avatarUrl: z.string().url() })
    .safeParse({ avatarUrl: formData.get("avatarUrl") });
  if (!parsed.success) return { error: "That image could not be saved." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: parsed.data.avatarUrl })
    .eq("id", user.id);
  if (error) return { error: "We couldn't save your photo." };

  revalidatePath("/app/profile");
  return { ok: true };
}
