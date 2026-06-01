"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { subscribe, type SubscribeState } from "@/app/subscribe/actions";
import { CONSENT_TEXT } from "@/app/subscribe/consent";

interface NewsletterFormProps {
  layout?: "vertical" | "horizontal";
  source?: string;
}

// Easing + duration shared by every transition so the motion reads as one
// coordinated gesture. ROW_H keeps the horizontal row from reflowing as the
// button grows; BUTTON_W is the resting width of the Subscribe button.
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const DURATION_MS = 520;
const ROW_H = "2.875rem";
const BUTTON_W = "8.25rem";

// Cloudflare Turnstile (bot/spam protection). Only renders + enforces when the
// site key is configured; otherwise the form works exactly as before.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function NewsletterForm({
  layout = "vertical",
  source = "site",
}: NewsletterFormProps) {
  const [state, formAction, pending] = useActionState<
    SubscribeState | null,
    FormData
  >(subscribe, null);

  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wasPending = useRef(false);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const errorId = useId();

  const isHorizontal = layout === "horizontal";
  const succeeded = state?.ok === true;
  const errored = state?.ok === false;

  // The success geometry (button consuming the input) animates only once the
  // action has actually succeeded. Driving it off `pending` would make a failed
  // submit expand and then bounce back; instead the in-flight cue is the
  // non-geometry "Subscribing…" label below.
  const expanded = succeeded;

  // Label inside the peach block. Idle → "Subscribe"; in-flight → "Subscribing…";
  // settled → the outcome copy (crossfaded once expanded).
  const restingLabel = pending ? "Subscribing…" : "Subscribe";
  const successLabel =
    state?.ok === true
      ? state.outcome === "already"
        ? "Already subscribed"
        : "You're Subscribed"
      : "Subscribe";

  // Announced to assistive tech only once the action settles.
  const liveMessage = succeeded ? successLabel : errored ? state.error : "";

  // After a failed submit, return focus to the email field and reset Turnstile
  // (its token is single-use) so the user can correct and retry cleanly.
  useEffect(() => {
    if (wasPending.current && errored) {
      inputRef.current?.focus();
      turnstileRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, errored]);

  // The peach button's two stacked labels crossfade in place: resting copy →
  // the settled outcome copy. Overlap is tuned so the success copy is legible
  // as the width-grow finishes (no faint "empty button" beat). Shared by both
  // layouts.
  const buttonLabel = (
    <span className="relative block whitespace-nowrap">
      <span
        className="block transition-opacity ease-out motion-reduce:transition-none"
        style={{
          opacity: expanded ? 0 : 1,
          transitionDuration: `${Math.round(DURATION_MS * 0.3)}ms`,
        }}
      >
        {restingLabel}
      </span>
      <span
        aria-hidden={!expanded}
        className="absolute inset-0 flex items-center justify-center transition-opacity ease-out motion-reduce:transition-none"
        style={{
          opacity: expanded ? 1 : 0,
          transitionDelay: expanded ? `${Math.round(DURATION_MS * 0.35)}ms` : "0ms",
          transitionDuration: `${Math.round(DURATION_MS * 0.35)}ms`,
        }}
      >
        {successLabel}
      </span>
    </span>
  );

  const inputAria = {
    "aria-invalid": errored || undefined,
    "aria-describedby": errored ? errorId : undefined,
  } as const;

  // Hidden trap field: bots fill every input; humans never see this one. The
  // server treats a non-empty value as a bot and silently drops it.
  const honeypot = (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
    >
      <input type="text" name="tnb_hp" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );

  // Invisible unless Cloudflare decides a challenge is needed (interaction-only).
  // Auto-injects a hidden `cf-turnstile-response` field the server verifies.
  const turnstile = TURNSTILE_SITE_KEY ? (
    <Turnstile
      ref={turnstileRef}
      siteKey={TURNSTILE_SITE_KEY}
      options={{ appearance: "interaction-only", size: "flexible" }}
    />
  ) : null;

  return (
    <div className="w-full">
      {isHorizontal ? (
        // ── Horizontal: the button grows leftward over the input ──────────
        <form action={formAction} aria-busy={pending}>
          {honeypot}
          <input type="hidden" name="source" value={source} />
          <div className="relative" style={{ height: ROW_H }}>
            <input
              ref={inputRef}
              type="email"
              name="email"
              required
              autoComplete="email"
              aria-label="Email address"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending || succeeded}
              aria-hidden={expanded}
              {...inputAria}
              className="absolute inset-0 h-full w-full rounded-lg border pl-3 text-sm outline-none transition-opacity duration-200 ease-out motion-reduce:transition-none disabled:cursor-default"
              style={{
                paddingRight: BUTTON_W,
                backgroundColor: "var(--color-surface-raised)",
                color: "var(--color-text-primary)",
                borderColor: "var(--color-border)",
                opacity: expanded ? 0 : 1,
              }}
            />
            <button
              type="submit"
              disabled={pending || succeeded}
              aria-disabled={expanded}
              tabIndex={expanded ? -1 : 0}
              className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-semibold transition-[width] hover:opacity-95 disabled:cursor-default motion-reduce:transition-none"
              style={{
                width: expanded ? "100%" : BUTTON_W,
                transitionTimingFunction: EASE,
                transitionDuration: `${DURATION_MS}ms`,
                backgroundColor: "var(--color-primary)",
                color: "var(--color-dark)",
              }}
            >
              {buttonLabel}
            </button>
          </div>
          {turnstile}
        </form>
      ) : (
        // ── Vertical: the input collapses, the full-width button settles ──
        <form action={formAction} className="flex w-full flex-col" aria-busy={pending}>
          {honeypot}
          <input type="hidden" name="source" value={source} />
          <div
            aria-hidden={expanded}
            className="overflow-hidden transition-all motion-reduce:transition-none"
            style={{
              maxHeight: expanded ? "0" : "3.5rem",
              opacity: expanded ? 0 : 1,
              marginBottom: expanded ? "0" : "0.5rem",
              transitionTimingFunction: EASE,
              transitionDuration: `${DURATION_MS}ms`,
            }}
          >
            <input
              ref={inputRef}
              type="email"
              name="email"
              required
              autoComplete="email"
              aria-label="Email address"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending || succeeded}
              {...inputAria}
              className="w-full rounded-lg border px-3 text-sm outline-none disabled:cursor-default"
              style={{
                height: ROW_H,
                backgroundColor: "var(--color-surface-raised)",
                color: "var(--color-text-primary)",
                borderColor: "var(--color-border)",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={pending || succeeded}
            aria-disabled={expanded}
            className="flex w-full items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-semibold hover:opacity-95 disabled:cursor-default"
            style={{
              height: ROW_H,
              backgroundColor: "var(--color-primary)",
              color: "var(--color-dark)",
            }}
          >
            {buttonLabel}
          </button>
          {turnstile ? <div className="mt-2">{turnstile}</div> : null}
        </form>
      )}

      {/*
        Message slot: a single reserved-height region that holds either the
        consent disclosure (idle/success) or the error — they swap in place so
        nothing below the form shifts when an error appears or clears.
      */}
      <div className="mt-2" style={{ minHeight: "2.25rem" }}>
        {errored ? (
          <p
            id={errorId}
            className="text-xs leading-snug"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {state.error}
          </p>
        ) : (
          <p
            aria-hidden={succeeded}
            className="text-xs leading-snug transition-opacity duration-300 ease-out motion-reduce:transition-none"
            style={{
              color: "var(--color-text-muted)",
              opacity: succeeded ? 0 : 1,
            }}
          >
            {CONSENT_TEXT}
          </p>
        )}
      </div>

      {/* Polite live region for assistive tech (success + error). */}
      <p className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </p>
    </div>
  );
}
