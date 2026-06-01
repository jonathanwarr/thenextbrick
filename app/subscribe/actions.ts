"use server";

import { randomUUID } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { CONSENT_TEXT } from "./consent";

export type SubscribeState =
  | { ok: true; outcome: "subscribed" | "already" }
  | { ok: false; error: string };

/**
 * Single-opt-in newsletter subscribe. Designed for `useActionState`, so it
 * takes the previous state as its first argument and RETURNS a result (it does
 * not redirect) — the form transforms in place from this returned state.
 *
 * Uses the service-role client because the `subscribers` table is default-deny
 * under RLS (anon cannot write). Stores the exact disclosure shown
 * (`consent_text`) plus `consented_at` as the CASL consent record.
 */
// Conservative email shape: a single "@", a dot in the domain, and no
// whitespace/control characters (\s covers CR/LF, blocking header injection in
// whatever later consumes subscribers.email as a send-to address).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Server Actions are directly-callable POST endpoints, so `source` is fully
// attacker-controlled. Only persist values the UI actually emits; anything else
// falls back to "site" so the column stays clean for admin filtering.
const KNOWN_SOURCES = new Set([
  "site",
  "subscribe-page",
  "home",
  "bricks-index",
  "brick-article",
]);

export async function subscribe(
  _prevState: SubscribeState | null,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rawSource = String(formData.get("source") ?? "site");
  const source = KNOWN_SOURCES.has(rawSource) ? rawSource : "site";

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data: existing, error: lookupError } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("subscribe lookup failed:", lookupError);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  if (existing?.status === "confirmed") {
    return { ok: true, outcome: "already" };
  }

  if (existing) {
    // Re-subscribe a previously unsubscribed address → confirm now.
    const { error } = await supabase
      .from("subscribers")
      .update({
        status: "confirmed",
        confirmed_at: now,
        unsubscribed_at: null,
        // confirmation_token is NOT NULL; rotate it to keep the column valid.
        confirmation_token: randomUUID(),
        consent_text: CONSENT_TEXT,
        consented_at: now,
        source,
      })
      .eq("id", existing.id);
    if (error) {
      console.error("subscribe update failed:", error);
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  } else {
    const { error } = await supabase.from("subscribers").insert({
      email,
      status: "confirmed",
      confirmed_at: now,
      consent_text: CONSENT_TEXT,
      consented_at: now,
      source,
    });
    if (error) {
      // Lookup-then-insert is not atomic; a concurrent/double submit for the
      // same new email can lose the race to the email UNIQUE constraint. Treat
      // that as "already subscribed" rather than a generic failure — and avoid
      // overwriting the existing row's original consent record.
      if (error.code === "23505") {
        return { ok: true, outcome: "already" };
      }
      console.error("subscribe insert failed:", error);
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  }

  return { ok: true, outcome: "subscribed" };
}
