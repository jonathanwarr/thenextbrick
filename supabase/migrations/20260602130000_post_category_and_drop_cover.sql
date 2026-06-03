-- Promote the writing "format" to a first-class, settable field.
--
-- The four formats (Foundations · Playbooks · Signals · Essays) were previously
-- derived by string-matching a post's tags against magic slugs that never
-- existed in the taxonomy — so every post silently resolved to "essays" and
-- there was no way to set the format in the editor. We give it a dedicated
-- column instead, kept separate from the topical `tags` table (the same
-- text + CHECK pattern used for `status`, per AGENTS.md). The app boundary
-- keeps the narrow value set as a `Category` union.
--
-- "builds" → "playbooks" and "observations" → "signals" are the agreed renames.
--
-- Also drops the dead cover fields: `cover_variant` (an abandoned card-color
-- experiment, constrained to 'a'..'f' and never read) and the unused
-- `cover_image_url`. Dropping the columns auto-drops their CHECK constraint.

alter table public.posts
  add column if not exists category text not null default 'essays'
    constraint posts_category_check
      check (category in ('foundations', 'playbooks', 'signals', 'essays'));

alter table public.posts
  drop column if exists cover_variant,
  drop column if exists cover_image_url;
