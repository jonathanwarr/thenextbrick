/**
 * Fire-and-forget activity metrics from the browser into `site_events`
 * (via /api/events). Tracking must never affect the page: failures are
 * swallowed, and sendBeacon is preferred so events survive the navigation
 * that usually follows the interaction being measured.
 *
 * Adding a new event type: extend this union AND the allowlist in
 * app/api/events/route.ts.
 */
export type MetricEvent =
  | "search_query"
  | "search_result_click"
  | "search_submit"
  | "tag_filter"
  | "cta_click"
  | "connect_click";

export function trackEvent(
  event: MetricEvent,
  payload: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      event_type: event,
      payload,
      path: window.location.pathname + window.location.search,
    });
    const sent = navigator.sendBeacon?.(
      "/api/events",
      new Blob([body], { type: "application/json" }),
    );
    if (!sent) {
      void fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Never let metrics break the page.
  }
}
