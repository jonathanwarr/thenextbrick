"use client";

import { updateTopicNotes } from "@/app/admin/actions";
import { useTopicField } from "./useTopicField";

/**
 * Single-line notes editor for a `topic_bank` row: saves on Enter or on blur,
 * and only when the value actually changed. Notes are the admin's revision
 * direction for the external pipeline.
 *
 * The saved value is whatever the database returns, never what we sent. A
 * failed write keeps the typed text in the field — it is not worth losing to a
 * network blip — and says plainly that it did not save.
 */
export default function TopicNotesInput({
  id,
  current,
}: {
  id: string;
  current: string | null;
}) {
  const field = useTopicField({
    server: current ?? "",
    save: (next) => updateTopicNotes(id, next),
    read: (topic) => topic.notes ?? "",
    keepDraftOnError: true,
  });

  const unsaved = !field.pending && !field.error && field.value !== field.saved;

  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        value={field.value}
        aria-label="Topic notes"
        aria-busy={field.pending}
        placeholder="—"
        onChange={(e) => field.setValue(e.target.value)}
        onBlur={(e) => field.commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            field.commit(e.currentTarget.value);
          }
        }}
        className="w-full min-w-32 text-base md:text-xs px-2 py-1 rounded-lg outline-none"
        style={{
          backgroundColor: "var(--color-bg)",
          border: `1px solid ${
            field.error ? "var(--color-primary)" : "var(--color-border)"
          }`,
          color: "var(--color-text-primary)",
          opacity: field.pending ? 0.6 : undefined,
        }}
      />
      {field.error ? (
        <span
          role="alert"
          className="text-xs"
          style={{ color: "var(--color-primary)" }}
        >
          Not saved — {field.error}. Press Enter to retry.
        </span>
      ) : (
        (field.pending || unsaved) && (
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {field.pending ? "Saving…" : "Unsaved"}
          </span>
        )
      )}
    </div>
  );
}
