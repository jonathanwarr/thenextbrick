-- Add a dedicated unsubscribe token for the public one-click unsubscribe
-- handler (brief 04, item A).
--
-- Every subscriber needs a stable, per-row token that rides in the footer of
-- every newsletter issue. We mint one for all existing AND future rows via a
-- DB default (mirrors confirmation_token). The unsubscribe handler rotates it
-- to a fresh uuid on use, so a clicked link can't be replayed.
--
-- A dedicated column is used (not the vestigial confirmation_token) because
-- brief 04 item C revives confirmation_token for double opt-in — sharing one
-- token across both flows would collide.

alter table public.subscribers
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

-- gen_random_uuid() is volatile, so the ADD COLUMN above backfills each existing
-- row with its own distinct token (no collision under the unique index below).
create unique index if not exists subscribers_unsubscribe_token_idx
  on public.subscribers (unsubscribe_token);
