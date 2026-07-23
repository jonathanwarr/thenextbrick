"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Save row for the post editor: the Save button plus the saved/error notice,
 * placed together at the bottom of the form where the author actually is when
 * they click Save (the notice used to render at the top of the page, out of
 * view).
 *
 * The button stays muted until the form actually differs from its loaded
 * state, then switches to the brand color. Dirtiness is detected by comparing
 * FormData snapshots: input/change events cover typed fields, and a
 * MutationObserver covers the TagPicker, which adds/removes hidden inputs
 * without firing events.
 */
export default function SaveBar({
  saved,
  error,
}: {
  saved?: boolean;
  error?: string;
}) {
  const [dirty, setDirty] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;

    function serialize() {
      const pairs: string[] = [];
      for (const [key, value] of new FormData(form!)) {
        pairs.push(`${key}=${typeof value === "string" ? value : ""}`);
      }
      // Sorted so field order (e.g. re-adding a removed tag) can't read as a change.
      return pairs.sort().join("&");
    }

    let initial: string | null = null;
    const check = () => {
      if (initial !== null) setDirty(serialize() !== initial);
    };

    // Snapshot on a timeout, not immediately: sibling client components
    // (PublishedAtInput) populate their values in mount effects, and those
    // re-renders must land before the baseline is taken.
    const timer = setTimeout(() => {
      initial = serialize();
    }, 0);

    const observer = new MutationObserver(check);
    observer.observe(form, { childList: true, subtree: true });
    form.addEventListener("input", check);
    form.addEventListener("change", check);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      form.removeEventListener("input", check);
      form.removeEventListener("change", check);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="space-y-3 pt-4 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      {saved && !dirty && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-primary)",
            color: "var(--color-text-primary)",
          }}
        >
          Saved.
        </div>
      )}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-primary)",
            color: "var(--color-primary)",
          }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 hover:opacity-90 cursor-pointer"
          style={
            dirty
              ? {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-primary)",
                }
              : {
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                }
          }
        >
          Save
        </button>
        <Link
          href="/admin/posts"
          className="text-sm hover:opacity-70"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
