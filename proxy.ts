import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Supabase auth links that aren't in the project's redirect allow-list fall
  // back to the Site URL root as `/?code=...`. Forward them to the callback
  // that can actually exchange the code. The shape check keeps unrelated
  // `?code=` params (e.g. a promo link) out of the auth flow.
  const { pathname, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  if (pathname === "/" && code && /^[0-9a-f-]{30,40}$/i.test(code)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
