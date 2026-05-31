# Newsletter Delivery Readiness

**Date authored:** 2026-05-24
**Status:** Draft — pending decisions on open questions
**Scope:** Two gaps surfaced during the item 5 audit (admin workflow follow-ups). Both are about making the newsletter mechanism actually production-ready, not security holes in what's already shipped.

---

## Context

The item 5 verification of the subscriber flow confirmed every existing DB write path correctly uses the service-role client. RLS is enforced (default-deny on `subscribers`), and no client-side code can reach the table. So the *security* answer is clean.

But two things surfaced during the audit that block actually running a newsletter:

1. **There is no public unsubscribe handler.** Today, "unsubscribed" is a status the admin can set via the dropdown in `/admin/subscribers`. A recipient who opens a newsletter and clicks an unsubscribe link has nowhere to land — the route doesn't exist. This matters for compliance once real sends begin (CAN-SPAM in the US, CASL in Canada, GDPR/PECR in EU/UK all expect a working one-click unsubscribe in every commercial email).
2. **The email sender is a stub.** [`lib/email/send.ts`](../../lib/email/send.ts) just `console.log`s the message. The double-opt-in confirmation flow is wired up correctly on both ends but no email actually leaves the server. Until a real provider is integrated, the subscriber flow can't be tested end-to-end and can't be used to send anything to anyone.

This brief captures both items so they can be planned and built when ready.

---

## Scope summary

| # | Item | Type | Priority |
|---|------|------|----------|
| 1 | Public unsubscribe handler | Feature | High (before first send) |
| 2 | Replace email stub with real provider | Feature | High (before first send) |

These are coupled in practice — item 1 can be built and tested via DB inspection without item 2, but neither flow is end-to-end usable until item 2 lands. Recommend building 1 first (smaller, scoped, no external dependency) then 2 (provider choice, domain auth, template work).

---

## 1. Public unsubscribe handler

### Problem

[`app/subscribe/confirm/[token]/page.tsx`](../../app/subscribe/confirm/%5Btoken%5D/page.tsx) handles the double-opt-in confirmation by matching a `confirmation_token` and flipping status to `confirmed`. There is no symmetric route for setting status to `unsubscribed` from a user-clicked link. The `subscribers` table has no `unsubscribe_token` column, and the existing `confirmation_token` is cleared to `null` once confirmation completes — so it can't be reused for unsubscribe.

### Files likely affected

- New: `app/subscribe/unsubscribe/[token]/page.tsx` (route handler / page)
- A new migration adding an `unsubscribe_token` column to `subscribers`, OR a schema change to repurpose `confirmation_token`
- Wherever email templates eventually live: each outgoing email needs an unsubscribe URL that includes the token

### Changes

- Add the chosen token mechanism (see open question #1).
- Add a route at `/subscribe/unsubscribe/[token]` that:
  - Matches the token to a subscriber via the service-role client
  - Flips status to `unsubscribed`
  - Voids the token (sets to null or rotates) so the link can't be replayed
  - Renders a confirmation page ("You're unsubscribed. Sorry to see you go.")
- The handler is the only way for a user to unsubscribe themselves. Admin override (the dropdown in `/admin/subscribers`) stays as-is.

### Acceptance criteria

- A subscriber with a valid unsubscribe token clicks the link → status flips to `unsubscribed`, token is voided, confirmation page renders.
- Re-clicking the same link → graceful "this link has already been used" message; status doesn't ping-pong.
- Clicking with a missing or invalid token → 404 or "link expired" message (mirroring the confirmation page pattern).
- A subscriber the admin later re-confirms (via the dropdown) doesn't get a new unsubscribe token unless a new email is sent (since tokens are minted per-send, see open question #1).

### Notes

- The token check is the only auth gate — there is no logged-in user concept for newsletter recipients.
- The handler must go through the service-role client (anon is denied by RLS).
- If `unsubscribe_token` becomes its own column, the existing `confirmation_token` flow stays untouched. If we merge them, the confirmation page needs to leave the token in place after status flips to confirmed, which complicates the replay-prevention story for the confirmation step.

---

## 2. Replace email stub with real provider

### Problem

[`lib/email/send.ts`](../../lib/email/send.ts) currently logs the message instead of sending. The subscribe flow (`app/subscribe/actions.ts:62-66`) calls `sendEmail()` with the confirmation URL, but the recipient never sees it. No newsletter can actually go out until this is wired to a real transactional/marketing email provider.

### Files likely affected

- `lib/email/send.ts` — replace the stub implementation
- `package.json` — likely a new dependency (provider SDK)
- `.env` / Vercel environment variables — provider API key, sender address, etc.
- Possibly a new `lib/email/templates/` directory if HTML templates are used

### Changes

- Pick a provider (see open question #3).
- Add the provider's SDK and API key as an env var (server-only — never exposed to the client).
- Update `sendEmail()` to call the provider's send API, preserving the same `EmailMessage` shape so the call site in `subscribe()` doesn't change.
- Handle send failures gracefully — log the error and surface a user-facing message if the confirmation email can't be sent (today's stub never fails).
- Add minimal HTML template scaffolding if HTML emails are needed (see open question #5).

### Acceptance criteria

- A new browser session submits the subscribe form → an email actually arrives at the submitted address with a working confirmation link.
- Send failures (invalid recipient, provider rate limit, etc.) are logged and don't leave the subscriber in a half-state (status=pending but no token, etc.).
- The sending domain is authenticated (SPF + DKIM at minimum) so emails aren't immediately spam-filtered.
- No emails fire from non-server code paths.

### Notes

- Domain authentication is a one-time setup on the DNS side and usually takes 24–48h to fully propagate. Plan accordingly before any real send.
- Most providers offer a free tier sufficient for a small newsletter — Resend (3k/month free), Postmark (100/month free with paid plans starting low), Loops (1k/month free), SendGrid (100/day free). Choice depends on developer ergonomics + deliverability reputation more than price at this scale.

---

## Recommended sequencing

1. **Open questions resolved first.** None of the items can start cleanly without picking the token strategy (item 1) and the email provider (item 2).
2. **Item 1 (unsubscribe handler).** Smaller, no external dependencies, can be tested via DB inspection without item 2 in place.
3. **Item 2 (email provider).** Larger, requires DNS work for the sending domain. Once it lands, both the existing confirmation flow and the new unsubscribe flow become end-to-end testable.
4. **First real send is gated on both.** Don't email anyone — even a small test list — until 1 and 2 are both live and verified.

---

## Out of scope

The following came up but are explicitly **not** part of this brief:

- The actual newsletter-sending mechanics (composing, scheduling, segmenting, batch sends). The current scope is *being able to send transactional emails reliably*. Bulk newsletter dispatch is a separate workstream.
- Bounce and complaint handling. Most providers offer webhook callbacks for hard bounces and spam complaints. Wiring those into auto-status changes (e.g. set `status='unsubscribed'` on hard bounce) is a follow-up, not a launch blocker.
- Welcome / drip sequences. Possible later; for now the only outbound is the confirmation email.
- A preferences page (let subscribers manage frequency or topic filters). The current schema is binary subscribe/unsubscribe.

---

## Open questions

1. **Token strategy for unsubscribe.** Three options:
   - (a) **Add a new `unsubscribe_token` column** to `subscribers`. Cleanest separation, lets confirmation and unsubscribe tokens have independent lifecycles. Minor schema growth.
   - (b) **Reuse `confirmation_token`** — repopulate it on each outgoing send, voided after unsubscribe click. Requires the confirmation page to *not* null the token when confirming (or repopulating it after).
   - (c) **Deterministic hash** — `hmac(server_secret, subscriber_id)`. No DB column needed, but harder to revoke individual links.
   - **Recommend (a).** Confirm before build.

2. **Unsubscribe UX.** Should the link be:
   - (a) **One-click instant** — clicking the link immediately unsubscribes; the page just confirms it happened. Most compliance-friendly.
   - (b) **Two-step** — clicking the link lands on a "Are you sure?" page with a button to confirm.
   - **Recommend (a).** Two-step adds friction the user already decided they don't want and doesn't meaningfully reduce accidental unsubscribes.

3. **Email provider.** Resend, Postmark, Loops, SendGrid, AWS SES, something else? Each has a different SDK, pricing model, and deliverability profile. Open question; no recommendation yet.

4. **Sending domain.** Do you already own a domain you'd send from (e.g. `hello@thenextbrick.ai` or `news@amwarr.com`)? Decision affects how soon item 2 can actually go live since DNS records need to propagate.

5. **HTML email templates or plain text only?** The current stub is plain text and the confirmation message is one short line + a URL. Plain text is fine for confirmation/unsubscribe; HTML matters more once actual issues ship. Recommend plain text for items 1+2; revisit when the newsletter cadence starts.

6. **Webhook for delivery events.** Out of scope for this brief, but worth deciding early: do we want the provider to call back on bounces/complaints so the system can auto-mark subscribers as unsubscribed? If yes, the brief expands to include a small webhook handler.
