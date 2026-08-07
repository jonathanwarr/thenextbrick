"use client";

import { updateTopicStatus } from "@/app/admin/actions";
import { TOPIC_STATUSES, isInFlight } from "@/lib/topics/types";
import { useTopicField } from "./useTopicField";

/**
 * Status picker for a `topic_bank` row. `current` is the stored status read
 * straight off the row — a topic's status is never inferred from the post it
 * links to, which can lag the pipeline by several stages.
 *
 * A pick is not applied until the database confirms it. On failure the select
 * snaps back to what is actually stored *and* says why, rather than reverting
 * on its own and leaving the admin to guess.
 */
export default function TopicStatusSelect({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const field = useTopicField({
    server: current,
    save: (next) => updateTopicStatus(id, next),
    read: (topic) => topic.status,
  });

  // Same three tones as the Posts status pill: muted for backlog,
  // secondary for in-flight, primary for published.
  const tone =
    field.value === "publish"
      ? "var(--color-primary)"
      : isInFlight(field.value)
        ? "var(--color-secondary)"
        : "var(--color-surface)";

  return (
    <span className="inline-flex flex-col gap-1">
      <span className="inline-flex items-center gap-2">
        <select
          value={field.value}
          aria-label="Topic status"
          aria-busy={field.pending}
          onChange={(e) => field.commit(e.target.value)}
          className="text-base md:text-xs font-medium px-2 py-1 rounded-full border cursor-pointer"
          style={{
            backgroundColor: tone,
            borderColor: field.error ? "var(--color-primary)" : "var(--color-border)",
            color: "var(--color-text-primary)",
            opacity: field.pending ? 0.6 : undefined,
          }}
        >
          {TOPIC_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {field.pending && (
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Saving…
          </span>
        )}
      </span>
      {field.error && (
        <span
          role="alert"
          className="text-xs"
          style={{ color: "var(--color-primary)" }}
        >
          Not saved — {field.error}. Still “{field.saved}”.
        </span>
      )}
    </span>
  );
}
