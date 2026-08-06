"use client";

import { useRef, useState, useTransition } from "react";
import type { TopicWriteResult, TopicWriteRow } from "@/app/admin/actions";

/**
 * Pessimistic editing for one `topic_bank` column.
 *
 * The rules this enforces, all of them learned the hard way on this table —
 * which an external editorial pipeline writes to at the same time we do:
 *
 * - Nothing counts as saved until the database says so. `saved` only ever
 *   holds a value that came back from a write or from the server render.
 * - A reply that arrives after the admin has moved on is dropped, not
 *   rendered. Late responses used to repaint the row with a value the admin
 *   was no longer looking at.
 * - Writes for a single field go out in the order they were made, so the last
 *   value the admin chose is the last one the database receives.
 * - A failed write is never swallowed. `error` is surfaced by the caller, and
 *   `saved` keeps naming what the database still holds.
 */
export function useTopicField({
  server,
  save,
  read,
  keepDraftOnError = false,
}: {
  /** The value in the database as of the last server render. */
  server: string;
  save: (next: string) => Promise<TopicWriteResult>;
  read: (topic: TopicWriteRow) => string;
  /** Keep a failed attempt in the control instead of reverting to `saved`. */
  keepDraftOnError?: boolean;
}) {
  const [value, setValue] = useState(server);
  const [saved, setSaved] = useState(server);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Every commit takes a ticket; only the newest one is allowed to render.
  const ticket = useRef(0);
  // Writes chain rather than race, so database order matches click order.
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  // Adopt a server value that changed underneath us — our own refresh after a
  // write, or an edit the external pipeline made. Never mid-write, and never
  // over an unsaved attempt (a typed draft, or a write that failed) that the
  // admin still has on screen.
  if (server !== saved && !pending) {
    const unsaved = error !== null || value !== saved;
    setSaved(server);
    if (!unsaved) setValue(server);
  }

  function commit(next: string) {
    if (next === saved && !error) return;
    const mine = ++ticket.current;
    setValue(next);

    startTransition(async () => {
      const write = queue.current.then(() => save(next));
      queue.current = write.catch(() => {});

      let result: TopicWriteResult;
      try {
        result = await write;
      } catch (cause) {
        // The action never got to answer — dropped connection, or a signed-out
        // session being bounced to /login. Say so instead of going quiet.
        if (mine === ticket.current) {
          setError(cause instanceof Error ? cause.message : "the request failed");
          if (!keepDraftOnError) setValue(saved);
        }
        return;
      }

      if (mine !== ticket.current) return;
      // A redirect (session expired) resolves with nothing; the router is
      // already navigating, so leave the row as-is.
      if (!result) return;

      if (!result.ok) {
        setError(result.error);
        if (!keepDraftOnError) setValue(saved);
        return;
      }
      const stored = read(result.topic);
      setError(null);
      setSaved(stored);
      setValue(stored);
    });
  }

  return { value, setValue, saved, error, pending, commit };
}
