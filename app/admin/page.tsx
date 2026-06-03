import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createServiceClient();

  const [postsCount, tagsCount, subscribersCount] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("tags").select("*", { count: "exact", head: true }),
    supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed"),
  ]);

  const stats = [
    { label: "Posts", value: postsCount.count ?? 0, href: "/admin/posts" },
    { label: "Tags", value: tagsCount.count ?? 0, href: "/admin/posts" },
    { label: "Subscribers", value: subscribersCount.count ?? 0, href: "/admin/subscribers" },
  ];

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
        <h1 className="text-3xl sm:text-4xl font-medium" style={{ fontFamily: "var(--font-family-serif)" }}>
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}
