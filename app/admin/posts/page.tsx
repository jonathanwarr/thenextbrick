import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import PostsTable from "@/components/admin/PostsTable";

export default async function AdminPostsListPage() {
  const supabase = createServiceClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, slug, title, status, featured, category, published_at, updated_at")
    .order("published_at", { ascending: false, nullsFirst: false });

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
          <PostsTable posts={posts} />
        )}
      </div>
    </div>
  );
}
