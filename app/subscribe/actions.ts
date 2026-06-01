"use server";

import { randomUUID } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { sendEmail } from "@/lib/email/send";
import { getSiteUrl } from "@/lib/site-url";
import { CONSENT_TEXT } from "./consent";

// Deliberately neutral on success: the client always gets the same { ok: true }
// whether the email was new, already subscribed, or re-subscribed — so the form
// can't be used to probe who is on the list (enumeration). Any per-case handling
// stays server-side only.
export type SubscribeState = { ok: true } | { ok: false; error: string };

/**
 * Double-opt-in (confirmed) newsletter subscribe. Designed for `useActionState`,
 * so it takes the previous state as its first argument and RETURNS a result (it
 * does not redirect) — the form transforms in place from this returned state.
 *
 * Signup never confirms directly: it creates (or resets) a `pending` row and
 * emails a single-use confirmation link. The address is added to the list — and
 * receives newsletters — only after the recipient clicks that link and the
 * status flips to 'confirmed' (see app/subscribe/confirm). This keeps someone
 * from being subscribed against their will by a third party entering their
 * address, and the confirm step itself is a button POST (immune to email
 * scanner GET prefetch).
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
    .select("id, status, unsubscribe_token")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("subscribe lookup failed:", lookupError);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  if (existing?.status === "confirmed") {
    // Already on the list — same neutral success, no "already" signal, and no
    // re-send (they don't need to confirm again, and re-mailing a confirmed
    // address would leak that it's on the list).
    return { ok: true };
  }

  // Mint a fresh confirmation token for this attempt; only redeeming it (via the
  // button POST) will flip the row to 'confirmed'.
  const confirmationToken = randomUUID();

  // The unsubscribe token reused/created here is what the confirmation email's
  // compliance footer links to.
  let unsubscribeToken: string;

  if (existing) {
    // An existing pending-or-unsubscribed row → reset it back to pending and
    // re-arm the confirmation token (this also lets a user with a failed/lost
    // send simply re-submit to get a fresh link). Reuse the row's current
    // unsubscribe token (don't rotate it) so the new confirmation email's
    // footer points at this address's live unsubscribe link.
    unsubscribeToken = existing.unsubscribe_token;
    const { error } = await supabase
      .from("subscribers")
      .update({
        status: "pending",
        confirmed_at: null,
        unsubscribed_at: null,
        confirmation_token: confirmationToken,
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
    unsubscribeToken = randomUUID();
    const { error } = await supabase.from("subscribers").insert({
      email,
      status: "pending",
      confirmation_token: confirmationToken,
      unsubscribe_token: unsubscribeToken,
      consent_text: CONSENT_TEXT,
      consented_at: now,
      source,
    });
    if (error) {
      // Lookup-then-insert is not atomic; a concurrent/double submit for the
      // same new email can lose the race to the email UNIQUE constraint. Treat
      // that as success rather than a generic failure — the winning submit
      // already created the pending row and sent its confirmation email — and
      // avoid overwriting that row's consent record.
      if (error.code === "23505") {
        return { ok: true };
      }
      console.error("subscribe insert failed:", error);
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  }

  // The row is now pending. Build the absolute links the email needs (they're
  // opened from a mail client, not relative to this request).
  const base = await getSiteUrl();
  const confirmUrl = `${base}/subscribe/confirm/${confirmationToken}`;
  const unsubscribeUrl = `${base}/subscribe/unsubscribe/${unsubscribeToken}`;

  const sent = await sendEmail({
    to: email,
    subject: "Confirm your subscription to The Next Brick",
    text: `Thanks for subscribing to The Next Brick — weekly essays on building with Claude.\n\nConfirm your subscription by clicking the link below:\n${confirmUrl}\n\nIf you didn't sign up, you can ignore this email — you won't be added to the list, and you won't hear from us again.`,
    unsubscribeUrl,
  });
  if (!sent.ok) {
    // The pending row already exists, so a failed send is not corruption: the
    // user can retry and the existing-pending branch above re-sends a fresh
    // link. Surface a retryable error rather than a misleading success.
    return { ok: false, error: "We couldn't send your confirmation email. Please try again." };
  }

  return { ok: true };
}
