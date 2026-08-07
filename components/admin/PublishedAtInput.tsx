"use client";

import { useEffect, useState } from "react";

/**
 * Publish date field.
 *
 * `datetime-local` speaks wall-clock time with no zone attached, so
 * "2026-08-06T14:00" means nothing until someone decides which zone it belongs
 * to. It used to be submitted raw and parsed on the server, where an offsetless
 * datetime is read as the *server's* local time — UTC in production. Typing 2pm
 * Pacific therefore stored 14:00Z and read back as 7am, and a post scheduled
 * for a Pacific evening would have published seven hours early.
 *
 * The browser is the only participant that knows the author's zone, so the
 * conversion happens here and the field submits an instant, not a wall clock:
 * the visible control is unnamed and a hidden input carries the ISO value.
 * `toISOString` resolves the offset that applies on the entered date, which a
 * single stored offset would get wrong across a DST boundary.
 *
 * Reading back is the mirror image — `formatForLocalInput` renders the stored
 * instant in the author's zone — so what they typed is what they see.
 */
function formatForLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Wall clock in the author's zone → the instant it names. "" if unparseable. */
function toInstant(local: string): string {
  if (!local) return "";
  const d = new Date(local);
  return isNaN(d.getTime()) ? "" : d.toISOString();
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
    <>
      <input type="hidden" name={name} value={toInstant(value)} />
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg outline-none"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      />
    </>
  );
}
