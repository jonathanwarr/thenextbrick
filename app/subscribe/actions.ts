"use server";

import { randomUUID } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { CONSENT_TEXT } from "./consent";

// Deliberately neutral on success: the client always gets the same { ok: true }
// whether the email was new, already subscribed, or re-subscribed — so the form
// can't be used to probe who is on the list (enumeration). Any per-case handling
// stays server-side only.
export type SubscribeState = { ok: true } | { ok: false; error: string };

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

  // Honeypot: a hidden field no human fills. If it has content, it's a bot —
  // pretend it worked (so it doesn't probe further) but write nothing.
  if (String(formData.get("tnb_hp") ?? "").trim() !== "") {
    return { ok: true };
  }

  // Bot/spam gate. No-op until TURNSTILE_SECRET_KEY is configured (see
  // lib/security/turnstile.ts). Runs before any DB work.
  const token = formData.get("cf-turnstile-response");
  const human = await verifyTurnstile(typeof token === "string" ? token : null);
  if (!human) {
    return { ok: false, error: "Couldn't verify you're human. Please try again." };
  }

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
    // Already on the list — same neutral success, no "already" signal.
    return { ok: true };
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
        return { ok: true };
      }
      console.error("subscribe insert failed:", error);
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  }

  return { ok: true };
}
