"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Performs the actual unsubscribe — only ever reached via an explicit button
 * POST, never on a scanner's GET prefetch. Rotates `unsubscribe_token` on
 * success so the clicked link can't be replayed; a second click on the old
 * link then no longer matches and falls through to the graceful "Link no
 * longer valid" page.
 *
 * `redirect()` works by throwing, so it is called at the top level (never
 * inside a try/catch that would swallow the control-flow throw). Supabase
 * errors are checked via the returned `{ error }` value instead.
 */
export async function confirmUnsubscribe(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const supabase = createServiceClient();

  const { data: subscriber, error: lookupError } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  // No match (lookup error or already-rotated token): idempotent — treat as
  // already done so a double submit can't error or ping-pong.
  if (lookupError || !subscriber) {
    redirect("/subscribe/unsubscribe/done");
  }

  if (subscriber.status !== "unsubscribed") {
    const { error: updateError } = await supabase
      .from("subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
        // Rotate the token so this clicked link can't be replayed.
        unsubscribe_token: randomUUID(),
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("unsubscribe update failed:", updateError);
      // Re-show the button (token is still valid) so the user can retry.
      redirect("/subscribe/unsubscribe/" + encodeURIComponent(token));
    }
  }

  redirect("/subscribe/unsubscribe/done");
}
