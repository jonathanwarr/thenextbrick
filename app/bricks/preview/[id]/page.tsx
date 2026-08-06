import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleView from "@/components/ui/ArticleView";
import { createClient } from "@/lib/supabase/server";
import { getPostForPreview } from "@/lib/posts/queries";

export const metadata: Metadata = { title: "Preview", robots: { index: false } };

type PreviewParams = Promise<{ id: string }>;

/**
 * Admin-only preview of a post in any status, rendered with the exact same
 * ArticleView as the public route. Lives outside the /admin layout so the
 * article appears without admin chrome; admin gating therefore happens here,
 * not in a layout. Non-admins get the standard not-found — never the draft
 * content, never a hint that it exists.
 */
export default async function PostPreviewPage({ params }: { params: PreviewParams }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) notFound();

  const result = await getPostForPreview(id);
  if (!result) notFound();
  const { post, status } = result;

  return (
    <>
      <div
        className="w-full border-b px-6 py-2.5 flex items-center justify-center gap-3 text-sm"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-primary)",
          color: "var(--color-text-primary)",
        }}
      >
        <span className="font-medium">
          Preview · {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <Link
          href={`/admin/posts/${id}`}
          className="underline hover:opacity-70"
          style={{ color: "var(--color-primary)" }}
        >
          Back to editor
        </Link>
      </div>
      <ArticleView post={post} screenshotPlaceholders />
    </>
  );
}
