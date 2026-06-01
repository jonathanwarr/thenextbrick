"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Performs the actual confirmation of a double-opt-in signup — only ever
 * reached via an explicit button POST, never on an email scanner's GET
 * prefetch. This is the whole point of double opt-in: a scanner that
 * auto-fetched the confirm link must NOT be able to confirm a subscription, so
 * the status flip lives here (POST) and the [token] page is read-only.
 *
 * Rotates `confirmation_token` on success so the clicked link is single-use; a
 * replay then no longer matches and falls through to the idempotent done page.
 *
 * `redirect()` works by throwing, so it is called at the top level (never inside
 * a try/catch that would swallow the control-flow throw). Supabase errors are
 * checked via the returned `{ error }` value instead.
 */
export async function confirmSubscription(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const supabase = createServiceClient();

  const { data: subscriber, error: lookupError } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("confirmation_token", token)
    .maybeSingle();

  // No match (lookup error or already-rotated token), or a row that isn't
  // pending: idempotent — treat as already handled so a double submit can't
  // error or ping-pong.
  if (lookupError || !subscriber || subscriber.status !== "pending") {
    redirect("/subscribe/confirm/done");
  }

  const { error: updateError } = await supabase
    .from("subscribers")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      // Rotate the token so this clicked link can't be replayed.
      confirmation_token: randomUUID(),
    })
    .eq("id", subscriber.id);

  if (updateError) {
    console.error("confirm subscription update failed:", updateError);
    // Re-show the confirm button (token is still valid) so the user can retry.
    redirect("/subscribe/confirm/" + encodeURIComponent(token));
  }

  redirect("/subscribe/confirm/done");
}
