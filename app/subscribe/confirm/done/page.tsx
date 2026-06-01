import SubscribeMessage from "@/components/ui/SubscribeMessage";

export const metadata = {
  title: "Confirmed — The Next Brick",
  robots: { index: false },
};

/**
 * Static confirmation shown after a successful (or idempotent) confirm.
 *
 * `/subscribe/confirm/done` resolves here, not to the `[token]` route: static
 * segments win over dynamic ones, and real confirmation tokens are UUIDs —
 * never the literal "done". This is intentional.
 */
export default function ConfirmDonePage() {
  return (
    <SubscribeMessage eyebrow="Subscribe" title="You’re confirmed!">
      <p>
        Thanks for confirming — you&rsquo;re on the list. Look out for The Next
        Brick every Monday.
      </p>
    </SubscribeMessage>
  );
}
