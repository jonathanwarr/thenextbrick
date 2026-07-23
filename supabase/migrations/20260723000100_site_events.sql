-- Site activity metrics: a lightweight, anonymous event log for questions
-- like "what do people type into search?", "which suggestions get clicked?",
-- and "does the coffee-connect CTA get used?".
--
-- Writes go through /api/events using the service-role key. RLS is enabled
-- with no policies, so the anon key can neither write nor read; reading is a
-- dashboard/SQL concern for now. event_type stays open text (validated by
-- the API route's allowlist) so a new event kind doesn't need a migration.
-- Event context (query, slug, position, …) lives in the payload jsonb.

create table if not exists public.site_events (
  id         uuid        primary key default gen_random_uuid(),
  event_type text        not null,
  payload    jsonb       not null default '{}'::jsonb,
  path       text,
  created_at timestamptz not null default now()
);

alter table public.site_events enable row level security;

create index if not exists site_events_type_created_idx
  on public.site_events (event_type, created_at desc);
