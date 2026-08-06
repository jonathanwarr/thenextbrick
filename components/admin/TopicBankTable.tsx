"use client";

import { useState } from "react";
import Link from "next/link";
import { formatFullDate } from "@/lib/posts/format";
import { TOPIC_STATUSES, isInFlight, statusIndex } from "@/lib/topics/types";
import TopicStatusSelect from "./TopicStatusSelect";
import TopicNotesInput from "./TopicNotesInput";

export type TopicBankRow = {
  id: string;
  topic: string;
  angle: string | null;
  working_slug: string;
  approval: string | null;
  type: string | null;
  status: string;
  notes: string | null;
  post_id: string | null;
  updated_at: string;
};

type SortKey = "topic" | "approval" | "type" | "status" | "updated";

const COLUMNS: { key: SortKey | null; label: string; numeric?: boolean }[] = [
  { key: "topic", label: "Topic" },
  { key: "approval", label: "Approval" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: null, label: "Notes" },
  { key: "updated", label: "Updated", numeric: true },
];

function timeOf(value: string | null): number {
  return value ? new Date(value).getTime() : Number.NEGATIVE_INFINITY;
}

function typeLabel(type: string | null): string {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : "";
}

function ApprovalBadge({ approval }: { approval: string | null }) {
  if (approval === "approved") {
    return (
      <span
        className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
        style={{
          border: "1px solid var(--color-border)",
          color: "var(--color-text-secondary)",
        }}
      >
        approved
      </span>
    );
  }
  if (approval === "rejected") {
    return (
      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        rejected
      </span>
    );
  }
  return null;
}

function TopicTitle({ row }: { row: TopicBankRow }) {
  // `angle` surfaces as a hover tooltip so the column stays scannable.
  return row.post_id ? (
    <Link
      href={`/admin/posts/${row.post_id}`}
      className="font-medium hover:opacity-70"
      title={row.angle ?? undefined}
    >
      {row.topic}
    </Link>
  ) : (
    <span className="font-medium" title={row.angle ?? undefined}>
      {row.topic}
    </span>
  );
}

const controlStyle: React.CSSProperties = {
  backgroundColor: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
};

export default function TopicBankTable({ rows }: { rows: TopicBankRow[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "updated",
    dir: "desc",
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = rows.filter(
    (row) =>
      (!statusFilter || row.status === statusFilter) &&
      (!q || row.topic.toLowerCase().includes(q)),
  );

  // In-flight rows are pinned to the top (newest first) and exempt from
  // sorting, mirroring how PostsTable pins the featured post.
  const inFlight = filtered
    .filter((row) => isInFlight(row.status))
    .sort((a, b) => timeOf(b.updated_at) - timeOf(a.updated_at));
  const rest = filtered.filter((row) => !isInFlight(row.status));

  const sorted = [...rest].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    switch (sort.key) {
      case "topic":
        return a.topic.localeCompare(b.topic) * dir;
      case "approval":
        return (a.approval ?? "").localeCompare(b.approval ?? "") * dir;
      case "type":
        return (a.type ?? "").localeCompare(b.type ?? "") * dir;
      case "status":
        return (statusIndex(a.status) - statusIndex(b.status)) * dir;
      case "updated":
        return (timeOf(a.updated_at) - timeOf(b.updated_at)) * dir;
    }
  });

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: COLUMNS.find((c) => c.key === key)?.numeric ? "desc" : "asc" },
    );
  }

  const ordered = [...inFlight, ...sorted];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics…"
          aria-label="Search topics"
          className="w-full sm:max-w-xs px-4 py-2 rounded-lg outline-none text-base md:text-sm"
          style={controlStyle}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="px-4 py-2 rounded-lg outline-none text-base md:text-sm cursor-pointer"
          style={controlStyle}
        >
          <option value="">All statuses</option>
          {TOPIC_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        {ordered.length === 0 ? (
          <div className="p-12 text-center" style={{ color: "var(--color-text-secondary)" }}>
            <p className="font-medium">No topics match.</p>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="md:hidden flex flex-col gap-3 p-3">
              {ordered.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border p-4 flex flex-col gap-2"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: isInFlight(row.status)
                      ? "var(--color-surface)"
                      : "var(--color-surface-raised)",
                    opacity: row.approval === "rejected" ? 0.55 : undefined,
                  }}
                >
                  <div className="min-w-0">
                    <TopicTitle row={row} />
                    <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                      {row.working_slug}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TopicStatusSelect id={row.id} current={row.status} />
                    <ApprovalBadge approval={row.approval} />
                    {row.type && (
                      <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        {typeLabel(row.type)}
                      </span>
                    )}
                  </div>
                  <TopicNotesInput id={row.id} current={row.notes} />
                  <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    Updated: {formatFullDate(new Date(row.updated_at))}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: sortable table */}
            <table className="hidden md:table w-full text-sm">
              <thead style={{ backgroundColor: "var(--color-surface)" }}>
                <tr>
                  {COLUMNS.map((col) => {
                    const active = col.key !== null && sort.key === col.key;
                    return (
                      <th
                        key={col.label}
                        className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                        style={{
                          color: active
                            ? "var(--color-text-secondary)"
                            : "var(--color-text-muted)",
                        }}
                      >
                        {col.key === null ? (
                          col.label
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleSort(col.key!)}
                            className="inline-flex items-center gap-1 uppercase tracking-wider cursor-pointer hover:opacity-70"
                          >
                            {col.label}
                            <span className="text-[9px]" aria-hidden="true">
                              {active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
                            </span>
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {ordered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: isInFlight(row.status)
                        ? "var(--color-surface)"
                        : undefined,
                      opacity: row.approval === "rejected" ? 0.55 : undefined,
                    }}
                  >
                    <td className="px-4 py-3">
                      <TopicTitle row={row} />
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {row.working_slug}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <ApprovalBadge approval={row.approval} />
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                      {typeLabel(row.type)}
                    </td>
                    <td className="px-4 py-3">
                      <TopicStatusSelect id={row.id} current={row.status} />
                    </td>
                    <td className="px-4 py-3 min-w-44">
                      <TopicNotesInput id={row.id} current={row.notes} />
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                      {formatFullDate(new Date(row.updated_at))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
