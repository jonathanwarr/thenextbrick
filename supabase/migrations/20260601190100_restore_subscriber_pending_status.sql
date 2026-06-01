-- Restore the 'pending' subscriber status for double opt-in (brief 04, item C).
--
-- Reverses 20260601171617 (which retired 'pending' for the single-opt-in
-- build). Signups now write 'pending'; only redeeming a confirmation token
-- flips the row to 'confirmed'. Loosen the CHECK to allow 'pending' again and
-- restore the column default to 'pending' (matches the original schema).
--
-- Safe to apply ahead of the new app code: the live subscribe action always
-- sets status explicitly, so the default change is inert until the double
-- opt-in flow ships, and nothing writes 'pending' until then either.

alter table public.subscribers
  alter column status set default 'pending';

alter table public.subscribers
  drop constraint if exists subscribers_status_check;

alter table public.subscribers
  add constraint subscribers_status_check
  check (status = any (array['pending'::text, 'confirmed'::text, 'unsubscribed'::text]));
