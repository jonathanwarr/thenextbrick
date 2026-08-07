"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
 *
 * Preview (edit page only) submits the same form with intent=preview, so the
 * save path — validation included — runs identically; on success the server
 * redirects back with ?preview=1 and the effect below navigates the preview
 * tab. The tab itself must be opened synchronously in the click handler,
 * before the round-trip, or popup blockers eat it; the named window lets the
 * effect (and any retry) target that same tab later.
 */
const PREVIEW_WINDOW = "tnb-preview";

export default function SaveBar({
  saved,
  error,
  postId,
  preview,
}: {
  saved?: boolean;
  error?: string;
  postId?: string;
  preview?: boolean;
}) {
  const [dirty, setDirty] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const previewPending = useRef(false);
  const router = useRouter();

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
    // Read the form after React commits, not during the event: what gets
    // submitted can be a derived field (PublishedAtInput's hidden UTC value)
    // that only updates on the re-render the event triggers.
    let queued: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      clearTimeout(queued);
      queued = setTimeout(() => {
        if (initial !== null) setDirty(serialize() !== initial);
      }, 0);
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
      clearTimeout(queued);
      observer.disconnect();
      form.removeEventListener("input", check);
      form.removeEventListener("change", check);
    };
  }, []);

  useEffect(() => {
    if (!postId) return;
    if (preview) {
      previewPending.current = false;
      const w = window.open(`/bricks/preview/${postId}`, PREVIEW_WINDOW);
      w?.focus();
      // Drop ?preview=1 so the next preview click re-triggers this effect.
      router.replace(`/admin/posts/${postId}?saved=1`, { scroll: false });
    } else if (error && previewPending.current) {
      previewPending.current = false;
      // The save failed: close the placeholder tab the click opened. If it is
      // already gone, window.open without a user gesture returns null (popup
      // blocked) and this is a no-op.
      window.open("", PREVIEW_WINDOW)?.close();
    }
  }, [preview, error, postId, router]);

  function handlePreviewClick(e: React.MouseEvent<HTMLButtonElement>) {
    // Don't open a tab the save will never fill: if native validation is
    // about to block the submit, let it surface and bail.
    const form = e.currentTarget.form;
    if (form && !form.checkValidity()) return;
    previewPending.current = true;
    const w = window.open("", PREVIEW_WINDOW);
    if (w) {
      try {
        w.document.title = "Preview";
        const msg = w.document.createElement("p");
        msg.textContent = "Saving…";
        msg.style.cssText = "font-family: sans-serif; padding: 2rem;";
        w.document.body.replaceChildren(msg);
      } catch {
        // Reused window mid-navigation; the effect will still target it.
      }
    }
  }

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
        {postId && (
          <button
            type="submit"
            name="intent"
            value="preview"
            onClick={handlePreviewClick}
            className="px-5 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 hover:opacity-90 cursor-pointer"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            Preview
          </button>
        )}
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
