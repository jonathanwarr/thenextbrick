"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

export async function updateSubscriberStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as
    | "confirmed"
    | "unsubscribed";
  if (!id || !status) return;

  // Stamp the matching lifecycle timestamp when an admin changes status.
  const now = new Date().toISOString();
  const patch: {
    status: typeof status;
    confirmed_at?: string;
    unsubscribed_at?: string;
  } = { status };
  if (status === "confirmed") patch.confirmed_at = now;
  if (status === "unsubscribed") patch.unsubscribed_at = now;

  const service = createServiceClient();
  await service.from("subscribers").update(patch).eq("id", id);
  revalidatePath("/admin/subscribers");
}

export async function deleteSubscriber(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const service = createServiceClient();
  await service.from("subscribers").delete().eq("id", id);
  revalidatePath("/admin/subscribers");
}
