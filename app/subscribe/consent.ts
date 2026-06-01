/**
 * Single source-of-truth for CASL express-consent capture at signup.
 *
 * `CONSENT_TEXT` is rendered as a disclosure line beneath the subscribe form
 * AND stored verbatim on the subscriber row (`consent_text`). Rendering and
 * storing from the same constant guarantees the retained consent record exactly
 * matches what the subscriber saw — do not inline this string anywhere else.
 *
 * The Next Brick is sent from Vancouver, BC (a Canadian sender), so CASL
 * applies: commercial email requires express consent. CASL does not mandate a
 * checkbox — a clear stated disclosure plus the subscriber's positive opt-in
 * action (submitting the form) is valid express consent, provided a record of
 * what they agreed to and when is retained (`consent_text` + `consented_at`).
 */
export const CONSENT_TEXT =
  "By subscribing you agree to receive The Next Brick newsletter by email. Unsubscribe at any time.";
