const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

let warnedMissingSecret = false;

/**
 * Verify a Cloudflare Turnstile token server-side (bot/spam protection for the
 * public subscribe action).
 *
 * Two regimes, by design:
 * - **Not configured** (`TURNSTILE_SECRET_KEY` unset) → returns `true` (skip),
 *   so local dev and not-yet-keyed deploys keep working. Emits a one-time
 *   warning so a forgotten secret in production is visible rather than silent.
 *   (The honeypot in the subscribe action stays active regardless.)
 * - **Configured** → enforced strictly and **fails closed**: a missing/invalid
 *   token, a non-2xx response, or a network/parse error all return `false`. A
 *   security control that passes on error isn't a control; transient blips
 *   surface to the user as a "please try again" retry.
 *
 * Reads only the server-only `TURNSTILE_SECRET_KEY`; never import from client code.
 */
export async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (!warnedMissingSecret) {
      warnedMissingSecret = true;
      console.warn(
        "[turnstile] TURNSTILE_SECRET_KEY is not set — bot verification is DISABLED. Set it before launch.",
      );
    }
    return true;
  }

  if (!token) return false;

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    if (!res.ok) {
      console.error(`[turnstile] siteverify returned HTTP ${res.status} — rejecting.`);
      return false;
    }
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] verification error — rejecting:", err);
    return false;
  }
}
