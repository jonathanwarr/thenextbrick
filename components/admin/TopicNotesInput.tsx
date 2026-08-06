"use client";

import { useRef } from "react";
import { updateTopicNotes } from "@/app/admin/actions";

/**
 * Single-line notes editor for a topic_bank row: saves on Enter or on blur,
 * and only when the value actually changed. Notes are the admin's revision
 * direction for the external pipeline.
 */
export default function TopicNotesInput({
  id,
  current,
}: {
  id: string;
  current: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const lastSaved = useRef((current ?? "").trim());

  function submitIfChanged(value: string) {
    if (value.trim() === lastSaved.current) return;
    lastSaved.current = value.trim();
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={updateTopicNotes}>
      <input type="hidden" name="id" value={id} />
      <input
        type="text"
        name="notes"
        defaultValue={current ?? ""}
        placeholder="—"
        onBlur={(e) => submitIfChanged(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitIfChanged(e.currentTarget.value);
          }
        }}
        className="w-full min-w-32 text-base md:text-xs px-2 py-1 rounded-lg outline-none"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      />
    </form>
  );
}
