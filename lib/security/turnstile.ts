const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Cloudflare Turnstile token server-side (bot/spam protection for the
 * public subscribe action).
 *
 * Behaviour is intentionally fail-safe for a small newsletter:
 * - No `TURNSTILE_SECRET_KEY` configured → returns `true` (no-op). Local dev and
 *   not-yet-configured deploys are never blocked.
 * - Configured but token missing/invalid → `false` (reject).
 * - Network/exception talking to Cloudflare → logs and returns `true` (fail
 *   open) so an outage can't lock real subscribers out.
 *
 * Reads only the server-only `TURNSTILE_SECRET_KEY`; never import this from
 * client code.
 */
export async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured → skip
  if (!token) return false;

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification error (failing open):", err);
    return true;
  }
}
