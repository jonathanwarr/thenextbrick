import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatFullDate } from "@/lib/posts/format";

export default async function AdminPostsListPage() {
  const supabase = createServiceClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, slug, title, status, featured, published_at, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium" style={{ fontFamily: "var(--font-family-serif)" }}>
          Posts
        </h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-text-primary)",
          }}
        >
          New post
        </Link>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        {(!posts || posts.length === 0) ? (
          <div className="p-12 text-center" style={{ color: "var(--color-text-secondary)" }}>
            <p className="mb-1 font-medium">No posts yet.</p>
            <p className="text-sm">Start with <Link href="/admin/posts/new" style={{ color: "var(--color-primary)" }}>your first brick</Link>.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--color-surface)" }}>
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Title</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Status</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Published</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/posts/${post.id}`} className="font-medium hover:opacity-70">
                      {post.title}
                      {post.featured && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-text-primary)" }}>
                          Featured
                        </span>
                      )}
                    </Link>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>/bricks/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor:
                          post.status === "published"
                            ? "var(--color-primary)"
                            : post.status === "scheduled"
                              ? "var(--color-secondary)"
                              : "var(--color-surface)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                    {post.published_at ? formatFullDate(new Date(post.published_at)) : "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                    {formatFullDate(new Date(post.updated_at))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
