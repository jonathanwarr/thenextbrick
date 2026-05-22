import { createServiceClient } from "@/lib/supabase/server";
import { formatFullDate } from "@/lib/posts/format";
import { deleteSubscriber } from "./actions";
import SubscriberStatusSelect from "@/components/admin/SubscriberStatusSelect";

export default async function AdminSubscribersPage() {
  const supabase = createServiceClient();
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("id, email, status, source, created_at, updated_at")
    .order("created_at", { ascending: false });

  const counts = {
    pending: subscribers?.filter((s) => s.status === "pending").length ?? 0,
    confirmed: subscribers?.filter((s) => s.status === "confirmed").length ?? 0,
    unsubscribed: subscribers?.filter((s) => s.status === "unsubscribed").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-medium" style={{ fontFamily: "var(--font-family-serif)" }}>
          Subscribers
        </h1>
        <div className="flex gap-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          <span>{counts.confirmed} confirmed</span>
          <span>{counts.pending} pending</span>
          <span>{counts.unsubscribed} unsubscribed</span>
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        {(!subscribers || subscribers.length === 0) ? (
          <div className="p-12 text-center" style={{ color: "var(--color-text-secondary)" }}>
            <p className="font-medium">No subscribers yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--color-surface)" }}>
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Email</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Status</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Source</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Joined</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                  <td className="px-4 py-3 font-medium">{sub.email}</td>
                  <td className="px-4 py-3">
                    <SubscriberStatusSelect id={sub.id} current={sub.status} />
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                    {sub.source ?? "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                    {formatFullDate(new Date(sub.created_at))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteSubscriber} className="inline-block">
                      <input type="hidden" name="id" value={sub.id} />
                      <button
                        type="submit"
                        className="text-xs hover:opacity-70 cursor-pointer"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Delete
                      </button>
                    </form>
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
