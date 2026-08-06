/**
 * Editorial pipeline statuses for `topic_bank`, in pipeline order. The DB
 * column is `text` + CHECK (not a native enum) — this union is the
 * app-boundary type, mirroring how `posts.status` and `category` are handled.
 */
export const TOPIC_STATUSES = [
  "idea",
  "approval",
  "topic",
  "research",
  "type",
  "narrative",
  "draft",
  "edit",
  "write",
  "meta",
  "publish",
] as const;

export type TopicStatus = (typeof TOPIC_STATUSES)[number];

/** Position in the pipeline, for status sorting. Unknown values sort last. */
export function statusIndex(status: string): number {
  const i = (TOPIC_STATUSES as readonly string[]).indexOf(status);
  return i === -1 ? TOPIC_STATUSES.length : i;
}

/**
 * A topic between `topic` and `meta` inclusive is actively in production —
 * the external pipeline works on at most one such row at a time.
 */
export function isInFlight(status: string): boolean {
  const i = statusIndex(status);
  return i >= statusIndex("topic") && i <= statusIndex("meta");
}
