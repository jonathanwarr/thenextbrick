-- Enforce "at most one featured post" at the database level.
--
-- Featured was a free boolean set per-post in the editor, so nothing stopped
-- two posts from both being featured (which happened). Featured is now managed
-- from the admin dashboard as a single selection; this migration is the
-- backstop so the invariant can never be violated regardless of app code.
--
-- 1) Collapse any existing duplicates: keep the most recently published
--    featured post, clear the rest.
-- 2) Add a partial unique index so only one row can ever have featured = true.

update public.posts set featured = false
where featured
  and id is distinct from (
    select id from public.posts
    where featured
    order by published_at desc nulls last, created_at desc
    limit 1
  );

create unique index if not exists posts_one_featured_idx
  on public.posts (featured)
  where featured;
