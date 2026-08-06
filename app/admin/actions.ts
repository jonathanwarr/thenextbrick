"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TOPIC_STATUSES } from "@/lib/topics/types";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/login?error=not-admin");
}

/**
 * The admin manages exactly two `topic_bank` columns: `status` (to roll a
 * piece back a stage) and `notes` (revision direction for the pipeline).
 * Every other column is owned by the external editorial system and must stay
 * read-only here.
 */
export async function updateTopicStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(TOPIC_STATUSES as readonly string[]).includes(status)) return;

  const service = createServiceClient();
  await service.from("topic_bank").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function updateTopicNotes(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const service = createServiceClient();
  await service.from("topic_bank").update({ notes }).eq("id", id);
  revalidatePath("/admin");
}
