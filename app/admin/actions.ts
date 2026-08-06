"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TOPIC_STATUSES } from "@/lib/topics/types";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/login?error=not-admin");
}

/** The columns a topic edit reads back, so the UI can render stored truth. */
export type TopicWriteRow = {
  id: string;
  status: string;
  notes: string | null;
  updated_at: string;
};

/**
 * Topic writes are pessimistic: the caller renders `topic` (what the database
 * actually holds) on success, and shows `error` on failure. Nothing about a
 * topic edit is ever assumed to have landed.
 */
export type TopicWriteResult =
  | { ok: true; topic: TopicWriteRow }
  | { ok: false; error: string };

/** A stalled write must fail loudly instead of leaving the row mid-save. */
const TOPIC_WRITE_TIMEOUT_MS = 8000;

/**
 * The admin manages exactly two `topic_bank` columns: `status` (to roll a
 * piece back a stage) and `notes` (revision direction for the pipeline).
 * Every other column is owned by the external editorial system and must stay
 * read-only here.
 *
 * The write returns the updated row rather than trusting the value we sent:
 * the table is shared with that external system, so what it stored — not what
 * we asked for — is what the dashboard is allowed to display.
 */
async function writeTopic(
  id: string,
  patch: { status: string } | { notes: string | null },
): Promise<TopicWriteResult> {
  const service = createServiceClient();

  try {
    const { data, error } = await service
      .from("topic_bank")
      // `updated_at` is stamped here rather than left to a database trigger.
      // The dashboard sorts and displays that column, and this table's
      // triggers belong to the external pipeline, not to us.
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, status, notes, updated_at")
      .abortSignal(AbortSignal.timeout(TOPIC_WRITE_TIMEOUT_MS))
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message || "the database rejected it" };
    }
    if (!data) {
      return { ok: false, error: "that topic no longer exists — reload the page" };
    }

    // Uncached page, so there is no tag to invalidate: refresh the client
    // router instead, in the same round-trip, so the counts, ordering and
    // timestamps around this row match the write that just landed.
    refresh();
    return { ok: true, topic: data };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return {
      ok: false,
      error: /timeout|abort/i.test(message)
        ? `the database did not answer within ${TOPIC_WRITE_TIMEOUT_MS / 1000}s`
        : message,
    };
  }
}

export async function updateTopicStatus(
  id: string,
  status: string,
): Promise<TopicWriteResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: "missing topic id" };
  if (!(TOPIC_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: `"${status}" is not a pipeline status` };
  }
  return writeTopic(id, { status });
}

export async function updateTopicNotes(
  id: string,
  notes: string,
): Promise<TopicWriteResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: "missing topic id" };
  return writeTopic(id, { notes: notes.trim() || null });
}
