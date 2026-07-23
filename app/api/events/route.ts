import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";

// Must mirror the MetricEvent union in lib/metrics.ts.
const ALLOWED_EVENTS = new Set([
  "search_query",
  "search_result_click",
  "search_submit",
  "tag_filter",
  "cta_click",
  "connect_click",
]);

// Events are tiny; anything bigger is junk or abuse.
const MAX_BODY_BYTES = 4096;

export async function POST(request: NextRequest) {
  let parsed: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 413 });
    }
    parsed = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const body = (parsed ?? {}) as Record<string, unknown>;
  const eventType = typeof body.event_type === "string" ? body.event_type : "";
  if (!ALLOWED_EVENTS.has(eventType)) {
    return new NextResponse(null, { status: 400 });
  }

  const payload =
    body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
      ? (body.payload as Record<string, unknown>)
      : {};
  const path = typeof body.path === "string" ? body.path.slice(0, 512) : null;

  // site_events is not in the generated Database types until the migration
  // lands and `npm run db:types` is re-run; insert through an untyped client
  // scoped to this route rather than hand-editing the generated file.
  const supabase = createServiceClient() as unknown as SupabaseClient;
  const { error } = await supabase
    .from("site_events")
    .insert({ event_type: eventType, payload, path });

  if (error) {
    console.error("site_events insert error", error);
    return new NextResponse(null, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
