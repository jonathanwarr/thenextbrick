import { headers } from "next/headers";

/**
 * Absolute base origin for building links that live OUTSIDE the request — e.g.
 * the confirm/unsubscribe links in emails, which are opened from a mail client
 * (not relative to the current page). Prefer the canonical NEXT_PUBLIC_SITE_URL;
 * fall back to the request `Host` header (works for in-request flows like the
 * subscribe action); finally localhost for dev.
 *
 * Always returns an origin with no trailing slash.
 */
export async function getSiteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    // Tolerate a bare host with no scheme (a common misconfig) — otherwise the
    // env value would produce scheme-relative, unclickable links in emails.
    const withScheme = /^https?:\/\//i.test(fromEnv) ? fromEnv : `https://${fromEnv}`;
    return withScheme.replace(/\/+$/, "");
  }

  const host = (await headers()).get("host");
  if (host) {
    const isLocal =
      host.startsWith("localhost") || host.startsWith("127.0.0.1");
    return `${isLocal ? "http" : "https"}://${host}`;
  }

  return "http://localhost:3000";
}
