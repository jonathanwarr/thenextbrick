import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import TopicBankTable from "@/components/admin/TopicBankTable";
import { isInFlight } from "@/lib/topics/types";

export default async function AdminDashboardPage() {
  const supabase = createServiceClient();

  const [postsCount, tagsCount, subscribersCount, topicsCount, { data: topics }] =
    await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("tags").select("*", { count: "exact", head: true }),
      supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed"),
      supabase.from("topic_bank").select("*", { count: "exact", head: true }),
      supabase
        .from("topic_bank")
        .select("id, topic, angle, working_slug, approval, type, status, notes, post_id, updated_at")
        .order("updated_at", { ascending: false }),
    ]);

  const stats = [
    { label: "Posts", value: postsCount.count ?? 0, href: "/admin/posts" },
    { label: "Tags", value: tagsCount.count ?? 0, href: "/admin/posts" },
    { label: "Subscribers", value: subscribersCount.count ?? 0, href: "/admin/subscribers" },
    { label: "Topics", value: topicsCount.count ?? 0, href: "#topic-bank" },
  ];

  const inFlightCount = (topics ?? []).filter((t) => isInFlight(t.status)).length;

  return (
    <div className="space-y-8">
      <div>
        <p
          className="text-xs uppercase mb-2"
          style={{
            letterSpacing: "var(--tracking-label)",
            color: "var(--color-text-muted)",
          }}
        >
          Overview
        </p>
        <h1 className="text-title font-medium" style={{ fontFamily: "var(--font-family-serif)" }}>
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="block rounded-2xl p-8 transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              className="text-xs uppercase mb-3"
              style={{
                letterSpacing: "var(--tracking-label)",
                color: "var(--color-text-muted)",
              }}
            >
              {stat.label}
            </p>
            <p
              className="text-5xl font-medium"
              style={{ fontFamily: "var(--font-family-serif)" }}
            >
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <div id="topic-bank" className="space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-medium" style={{ fontFamily: "var(--font-family-serif)" }}>
            Topic Bank
          </h2>
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {inFlightCount} in pipeline
          </span>
        </div>

        {(!topics || topics.length === 0) ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
              color: "var(--color-text-secondary)",
            }}
          >
            <p className="font-medium">No topics yet.</p>
          </div>
        ) : (
          <TopicBankTable rows={topics} />
        )}
      </div>
    </div>
  );
}
