"use client";

import { useRef } from "react";
import { updateSubscriberStatus } from "@/app/admin/subscribers/actions";

export type SubscriberStatus = "confirmed" | "unsubscribed";

export default function SubscriberStatusSelect({
  id,
  current,
}: {
  id: string;
  current: SubscriberStatus;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={updateSubscriberStatus} className="inline-flex">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={current}
        onChange={() => formRef.current?.requestSubmit()}
        className="text-xs px-2 py-1 rounded-full border cursor-pointer"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      >
        <option value="confirmed">Confirmed</option>
        <option value="unsubscribed">Unsubscribed</option>
      </select>
    </form>
  );
}
