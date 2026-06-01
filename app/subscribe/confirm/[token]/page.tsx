import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import SubscribeMessage from "@/components/ui/SubscribeMessage";
import { confirmSubscription } from "../actions";

// Token-keyed lookup is per-request; never serve a cached page.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Confirm — The Next Brick",
  robots: { index: false },
};

type ConfirmParams = Promise<{ token: string }>;

/**
 * READ-ONLY confirmation landing page. Email security scanners (Outlook
 * SafeLinks, etc.) pre-fetch GET links, so this page only looks up the token
 * and decides what to render — it never mutates. Confirming the subscription
 * happens solely on the explicit button POST handled by `confirmSubscription`,
 * which is what makes double opt-in scanner-safe: a prefetch can't confirm an
 * address someone else entered.
 */
export default async function ConfirmPage({
  params,
}: {
  params: ConfirmParams;
}) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: subscriber, error } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("confirmation_token", token)
    .maybeSingle();

  // Pending: offer the explicit POST button to confirm.
  if (!error && subscriber?.status === "pending") {
    return (
      <SubscribeMessage eyebrow="Subscribe" title="Confirm your subscription">
        <p>
          Click below to confirm your subscription to The Next Brick and start
          receiving weekly essays on building with Claude.
        </p>
        <form action={confirmSubscription}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="mt-6 inline-flex items-center justify-center rounded-lg px-5 text-sm font-semibold hover:opacity-95"
            style={{
              height: "2.875rem",
              backgroundColor: "var(--color-primary)",
              color: "var(--color-dark)",
            }}
          >
            Confirm subscription
          </button>
        </form>
      </SubscribeMessage>
    );
  }

  // The address was unsubscribed: don't silently re-add it — point them back to
  // the subscribe page if they want to opt in again.
  if (!error && subscriber?.status === "unsubscribed") {
    return (
      <SubscribeMessage eyebrow="Subscribe" title="You unsubscribed">
        <p>
          This address was unsubscribed. If you&rsquo;d like to receive The Next
          Brick, you can{" "}
          <Link
            href="/subscribe"
            className="underline hover:opacity-80"
            style={{ color: "var(--color-primary)" }}
          >
            subscribe again
          </Link>
          .
        </p>
      </SubscribeMessage>
    );
  }

  // No match (lookup error, a rotated/already-used token, or a 'confirmed' row
  // whose token has since rotated): the link is spent. Reassure anyone who has
  // already confirmed that they're all set.
  return (
    <SubscribeMessage eyebrow="Subscribe" title="Link expired">
      <p>
        This confirmation link has expired or has already been used. If
        you&rsquo;ve already confirmed, you&rsquo;re all set — look out for The
        Next Brick every Monday.
      </p>
    </SubscribeMessage>
  );
}
