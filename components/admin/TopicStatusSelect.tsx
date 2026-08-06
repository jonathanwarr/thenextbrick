"use client";

import { useRef } from "react";
import { updateTopicStatus } from "@/app/admin/actions";
import { TOPIC_STATUSES, isInFlight } from "@/lib/topics/types";

export default function TopicStatusSelect({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  // Same three tones as the Posts status pill: muted for backlog,
  // secondary for in-flight, primary for published.
  const tone =
    current === "publish"
      ? "var(--color-primary)"
      : isInFlight(current)
        ? "var(--color-secondary)"
        : "var(--color-surface)";

  return (
    <form ref={formRef} action={updateTopicStatus} className="inline-flex">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={current}
        onChange={() => formRef.current?.requestSubmit()}
        className="text-base md:text-xs font-medium px-2 py-1 rounded-full border cursor-pointer"
        style={{
          backgroundColor: tone,
          borderColor: "var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      >
        {TOPIC_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </form>
  );
}
