import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/login?error=not-admin");
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b"
        style={{
          backgroundColor: "var(--color-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 min-h-16 py-2 sm:py-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col gap-[2px] w-7 h-5 shrink-0">
              <div className="flex gap-[2px] flex-1">
                <div className="flex-[2] rounded-[1px]" style={{ backgroundColor: "var(--color-primary)" }} />
                <div className="flex-[1] rounded-[1px]" style={{ backgroundColor: "var(--color-secondary)" }} />
              </div>
              <div className="flex gap-[2px] flex-1">
                <div className="flex-[1] rounded-[1px]" style={{ backgroundColor: "var(--color-secondary)" }} />
                <div className="flex-[2] rounded-[1px]" style={{ backgroundColor: "var(--color-primary)" }} />
              </div>
            </div>
            <span className="font-medium truncate">
              Admin · {profile.display_name ?? user.email}
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
            <Link href="/admin" className="hover:opacity-75">Dashboard</Link>
            <Link href="/admin/posts" className="hover:opacity-75">Posts</Link>
            <Link href="/admin/subscribers" className="hover:opacity-75">Subscribers</Link>
            <Link href="/" className="hover:opacity-75" style={{ color: "var(--color-text-secondary)" }}>
              View site
            </Link>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="px-3 py-1 rounded-full text-sm transition-opacity hover:opacity-75 cursor-pointer"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 lg:px-8 py-8 lg:py-10">
        {children}
      </main>
    </>
  );
}
