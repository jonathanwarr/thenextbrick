-- Rename the "foundations" content type to "articles".
--
-- The site presents three content types, each with a distinct purpose:
--   Articles  → foundational knowledge
--   Playbooks → practical application
--   Essays    → strategic thinking
--
-- "Foundations" was the old label for the first type; "Articles" reads as the
-- more polished, plain-language name. All existing posts are 'foundations', so
-- this renames every row and retargets the column default + CHECK constraint.
-- The app-boundary `Category` union and KNOWN_CATEGORIES are updated to match.

-- Drop the CHECK so the existing 'foundations' rows can be rewritten.
alter table public.posts
  drop constraint if exists posts_category_check;

-- Repoint the default (was 'foundations', set in
-- 20260602140000_post_category_default_foundations).
alter table public.posts
  alter column category set default 'articles';

-- Rename every existing row.
update public.posts
  set category = 'articles'
  where category = 'foundations';

-- Re-add the CHECK with the new value set.
alter table public.posts
  add constraint posts_category_check
    check (category in ('articles', 'playbooks', 'essays'));
