"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { savePostForPreview } from "@/app/admin/posts/actions";

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
 * Preview (edit page only) saves first and previews second, in one click — the
 * author never has to remember to Save. It runs the same server-side save path
 * as Save (`persistPost`), awaits the outcome, and only then points the tab it
 * opened at the preview.
 *
 * Two rules keep that from stranding a tab on "Saving…", which is what the
 * earlier ?preview=1 round-trip did whenever the save was slow or failed:
 *
 * - The tab is opened inside the click, because only a user gesture may open
 *   one, and we hold the reference and navigate it ourselves. Re-finding it
 *   later with a second `window.open` is a pop-up with no gesture behind it,
 *   and a blocked one leaves the placeholder up forever.
 * - Every path out of the save writes an outcome somewhere the author is
 *   looking: success navigates the tab, failure closes it and shows the normal
 *   error notice, and a save that never answers says so rather than spinning.
 */
const PREVIEW_WINDOW = "tnb-preview";

/** A save with no answer by now is reported, not waited on indefinitely. */
const SAVE_TIMEOUT_MS = 20000;

function showInTab(tab: Window | null, message: string) {
  if (!tab) return;
  try {
    tab.document.title = "Preview";
    const p = tab.document.createElement("p");
    p.textContent = message;
    p.style.cssText = "font-family: sans-serif; padding: 2rem; line-height: 1.5;";
    tab.document.body.replaceChildren(p);
  } catch {
    // Reused window mid-navigation; nothing to place the message on.
  }
}

export default function SaveBar({
  saved,
  error,
  postId,
}: {
  saved?: boolean;
  error?: string;
  postId?: string;
}) {
  const [dirty, setDirty] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSaved, setPreviewSaved] = useState(false);
  // Plain state rather than useTransition: a transition stays pending for as
  // long as the server action is in flight, so a request that never answers
  // would leave the button disabled with no way back.
  const [pending, setPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // Re-takes the clean snapshot after a save that did not reload the page.
  const rebaseline = useRef<() => void>(() => {});
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
    const check = () => {
      if (initial !== null) setDirty(serialize() !== initial);
    };

    // Snapshot on a timeout, not immediately: sibling client components
    // (PublishedAtInput) populate their values in mount effects, and those
    // re-renders must land before the baseline is taken.
    const timer = setTimeout(() => {
      initial = serialize();
    }, 0);

    rebaseline.current = () => {
      initial = serialize();
      setDirty(false);
    };

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

  function handlePreview(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.form;
    if (!form || !postId) return;

    // Same gate a Save click would hit, with the browser's own messages. It
    // runs before anything opens, so an invalid form never leaves a tab behind.
    if (!form.reportValidity()) return;

    const data = new FormData(form);

    const tab = window.open("", PREVIEW_WINDOW);
    showInTab(tab, "Saving…");
    setPreviewError(null);
    setPreviewSaved(false);

    setPending(true);

    void (async () => {
      let outcome: Awaited<ReturnType<typeof savePostForPreview>> | "timeout";
      try {
        outcome = await Promise.race([
          savePostForPreview(data),
          new Promise<"timeout">((resolve) =>
            setTimeout(() => resolve("timeout"), SAVE_TIMEOUT_MS),
          ),
        ]);
      } catch (cause) {
        outcome = {
          ok: false,
          error: cause instanceof Error ? cause.message : "The save request failed.",
        };
      }
      setPending(false);

      if (outcome === "timeout") {
        // The request may still land, so don't claim it failed outright.
        showInTab(tab, "The save hasn’t answered yet. Close this tab and check the editor.");
        setPreviewError(
          `No answer from the save after ${SAVE_TIMEOUT_MS / 1000}s. It may still be in flight — reload the editor to see what was stored before trying again.`,
        );
        return;
      }

      if (!outcome.ok) {
        tab?.close();
        setPreviewError(outcome.error);
        return;
      }

      setPreviewSaved(true);
      rebaseline.current();
      if (tab) {
        tab.location.href = `/bricks/preview/${outcome.postId}`;
        tab.focus();
      } else {
        setPreviewError(
          "Saved, but the preview tab was blocked. Allow pop-ups for this site, then click Preview again.",
        );
      }
      // Pick up what was actually stored (slug, computed fields, timestamps).
      router.refresh();
    })();
  }

  const notice = previewError ?? error;
  const showSaved = (previewSaved || saved) && !dirty && !notice;

  return (
    <div
      ref={rootRef}
      className="space-y-3 pt-4 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      {showSaved && (
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
      {notice && (
        <div
          role="alert"
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-primary)",
            color: "var(--color-primary)",
          }}
        >
          {notice}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 hover:opacity-90 cursor-pointer disabled:cursor-default disabled:opacity-60"
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
            // Not a submit: the save is dispatched here so its outcome can be
            // awaited and acted on, rather than posted and hoped for.
            type="button"
            onClick={handlePreview}
            disabled={pending}
            aria-busy={pending}
            className="px-5 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 hover:opacity-90 cursor-pointer disabled:cursor-default disabled:opacity-60"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            {pending ? "Saving…" : "Preview"}
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
