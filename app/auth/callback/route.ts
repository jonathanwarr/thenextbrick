import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(friendlyAuthError(error.message))}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("That sign-in link is invalid. Request a fresh one below.")}`,
  );
}

// Supabase returns verbose technical errors (e.g. the full PKCE paragraph).
// Translate the ones a user can actually hit into short, actionable copy.
function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("code verifier") || lower.includes("pkce")) {
    return "This sign-in link was opened in a different browser than where you requested it. Request a fresh link below and open it in the same browser.";
  }
  if (lower.includes("expired") || lower.includes("invalid")) {
    return "That sign-in link has expired or already been used. Request a fresh one below.";
  }
  return "Sign-in didn't complete. Request a fresh link below.";
}
