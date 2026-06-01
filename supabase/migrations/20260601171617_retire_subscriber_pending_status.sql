-- Retire the 'pending' subscriber status.
--
-- Signups are now single opt-in (the /subscribe flow writes status='confirmed'
-- directly), so the old double opt-in 'pending' state is no longer produced.
-- Sweep any remaining pending rows, then drop 'pending' from the column default
-- and the CHECK constraint so the schema matches the app.

-- 1. Promote any leftover pending subscribers to confirmed (stamp confirmed_at
--    if it was never set). Must run BEFORE tightening the CHECK below.
update public.subscribers
set status = 'confirmed',
    confirmed_at = coalesce(confirmed_at, now())
where status = 'pending';

-- 2. New rows default to 'confirmed' (was 'pending'). The app always sets
--    status explicitly, so this only keeps the default consistent with the
--    tightened CHECK below (a 'pending' default would violate it).
alter table public.subscribers
  alter column status set default 'confirmed';

-- 3. Restrict allowed status values to confirmed | unsubscribed.
alter table public.subscribers
  drop constraint if exists subscribers_status_check;
alter table public.subscribers
  add constraint subscribers_status_check
  check (status = any (array['confirmed'::text, 'unsubscribed'::text]));
