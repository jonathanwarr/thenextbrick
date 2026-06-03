-- Default new posts to "foundations" rather than "essays".
--
-- The admin editor always submits an explicit category, so this default only
-- applies to rows inserted without one — but Foundations is the more sensible
-- starting point for a new piece than Essays. Existing rows are left as-is
-- (they're set per-post in the editor).

alter table public.posts
  alter column category set default 'foundations';
