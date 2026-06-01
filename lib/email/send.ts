import { Resend } from "resend";

/**
 * Send a single transactional/newsletter email via Resend.
 *
 * Server-only: reads `RESEND_API_KEY` and `EMAIL_FROM`, which have no
 * NEXT_PUBLIC_ prefix and so are stripped from the client bundle. Never import
 * this from client code.
 *
 * Two regimes, mirroring `lib/security/turnstile.ts`:
 * - **No key** (`RESEND_API_KEY` unset/empty) → sending is DISABLED. The full
 *   message (recipient, subject, and the composed body including any confirm/
 *   unsubscribe links) is logged to the server console so a developer can click
 *   the link locally, then returns `{ ok: true }`. RESEND_API_KEY MUST be set
 *   before the first real send.
 * - **Configured** → sends via the Resend SDK.
 *
 * Every subscriber-facing send should pass `unsubscribeUrl`: the footer it
 * appends is required for CASL / CAN-SPAM compliance. Bodies are plain text
 * only for now; an HTML variant is a future addition.
 *
 * Never throws — always resolves to a `SendEmailResult` so callers can branch
 * without half-creating or corrupting subscriber state on a failed send.
 */

export type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  /** When provided, a standard unsubscribe footer with this link is appended to the body. */
  unsubscribeUrl?: string;
};

export type SendEmailResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  // Compose the final plain-text body, appending the compliance footer when an
  // unsubscribe link is supplied.
  const body = params.unsubscribeUrl
    ? `${params.text}\n\n—\nThe Next Brick\nUnsubscribe: ${params.unsubscribeUrl}`
    : params.text;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev-friendly fallback: log the message instead of sending. RESEND_API_KEY
    // MUST be set before the first real send.
    console.warn(
      "[email] RESEND_API_KEY is not set — email sending is DISABLED; logging the message instead. Set it before the first real send.",
    );
    console.info("[email] would send:", {
      to: params.to,
      subject: params.subject,
      body,
    });
    return { ok: true };
  }

  const from = process.env.EMAIL_FROM || "The Next Brick <news@thenextbrick.ai>";

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      text: body,
    });
    if (error) {
      // Log context for debugging, but never the API key.
      console.error(`[email] Resend returned an error sending to ${params.to}:`, error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error(`[email] failed to send to ${params.to}:`, err);
    const message = err instanceof Error ? err.message : "Unknown error sending email.";
    return { ok: false, error: message };
  }
}
