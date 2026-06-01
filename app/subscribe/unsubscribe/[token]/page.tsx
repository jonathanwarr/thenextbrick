import { createServiceClient } from "@/lib/supabase/server";
import SubscribeMessage from "@/components/ui/SubscribeMessage";
import { confirmUnsubscribe } from "../actions";

// Token-keyed lookup is per-request; never serve a cached page.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Unsubscribe — The Next Brick",
  robots: { index: false },
};

type UnsubscribeParams = Promise<{ token: string }>;

/**
 * READ-ONLY unsubscribe landing page. Email security scanners (Outlook
 * SafeLinks, etc.) pre-fetch GET links, so this page only looks up the token
 * and decides what to render — it never mutates. The status change happens
 * solely on the explicit button POST handled by `confirmUnsubscribe`.
 */
export default async function UnsubscribePage({
  params,
}: {
  params: UnsubscribeParams;
}) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: subscriber, error } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  // No match (including a rotated/replayed token) or a lookup error: there is
  // nothing actionable, so show the graceful "no longer valid" message. Anyone
  // who already unsubscribed lands here too — reassure them they're all set.
  if (error || !subscriber) {
    return (
      <SubscribeMessage eyebrow="Unsubscribe" title="Link no longer valid">
        <p>
          This unsubscribe link is no longer valid. If you&rsquo;ve already
          unsubscribed, you&rsquo;re all set — you won&rsquo;t receive any
          further emails.
        </p>
      </SubscribeMessage>
    );
  }

  if (subscriber.status === "unsubscribed") {
    return (
      <SubscribeMessage eyebrow="Unsubscribe" title="Already unsubscribed">
        <p>
          You&rsquo;re already unsubscribed — you won&rsquo;t receive any more
          emails.
        </p>
      </SubscribeMessage>
    );
  }

  // Active subscriber (pending or confirmed): offer the explicit POST button.
  return (
    <SubscribeMessage
      eyebrow="Unsubscribe"
      title="Unsubscribe from The Next Brick?"
    >
      <p>
        Click below to stop receiving emails from The Next Brick. You can always
        subscribe again later.
      </p>
      <form action={confirmUnsubscribe}>
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
          Unsubscribe
        </button>
      </form>
    </SubscribeMessage>
  );
}
