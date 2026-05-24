"use client";

import { useEffect, useState } from "react";

function formatForLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PublishedAtInput({
  defaultValueIso,
  name = "published_at",
}: {
  defaultValueIso: string | null;
  name?: string;
}) {
  // Start empty to avoid hydration mismatch; populate from local-time
  // conversion on mount so the displayed value matches the user's wall clock.
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(formatForLocalInput(defaultValueIso));
  }, [defaultValueIso]);

  return (
    <input
      type="datetime-local"
      name={name}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full px-4 py-2.5 rounded-lg outline-none"
      style={{
        backgroundColor: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-primary)",
      }}
    />
  );
}
