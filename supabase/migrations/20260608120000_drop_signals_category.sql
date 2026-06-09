-- Drop "Signals" as a writing format — the site went from four banks to three
-- (Foundations · Playbooks · Essays). No rows ever used 'signals' (all posts are
-- 'foundations' at the time of this change), so this only tightens the CHECK
-- constraint; no data backfill is needed. The app-boundary `Category` union and
-- KNOWN_CATEGORIES are updated to match.

alter table public.posts
  drop constraint if exists posts_category_check;

alter table public.posts
  add constraint posts_category_check
    check (category in ('foundations', 'playbooks', 'essays'));
