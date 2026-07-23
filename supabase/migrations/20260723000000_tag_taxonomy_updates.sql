-- Tag taxonomy updates (July 2026):
--   • Foundations gains "Setup & Environment" (sorted first — setup precedes
--     prompting).
--   • Claude Features gains "Plugins" and "Scheduled & Routines".
--   • CS Functions retires "Customer Voice" and "Customer Education".
--   • The Content group ("Articles", "Playbooks", "Essays") is retired
--     entirely: content type already lives on posts.category (the editor's
--     Type dropdown) and search matches that field directly, so type-as-tag
--     was redundant.
--
-- Same re-runnable ON CONFLICT pattern as 20260717000000_cs_tag_taxonomy.sql.
-- Deleted tags cascade their post_tags links away (post_tags_tag_id_fkey is
-- ON DELETE CASCADE) — that loss is intentional. The Content tags are deleted
-- before their group so nothing falls to group_id NULL ("Other" in the UI).

insert into public.tags (slug, name, group_id, sort_order) values
  ('setup-environment',  'Setup & Environment',  (select id from public.tag_groups where slug='foundations'),       5),
  ('plugins',            'Plugins',              (select id from public.tag_groups where slug='claude-features'), 100),
  ('scheduled-routines', 'Scheduled & Routines', (select id from public.tag_groups where slug='claude-features'), 110)
on conflict (slug) do update
  set name       = excluded.name,
      group_id   = excluded.group_id,
      sort_order = excluded.sort_order;

delete from public.tags
where slug in (
  -- CS Functions retirements
  'customer-voice', 'customer-education',
  -- Content group (type lives on posts.category now)
  'articles', 'playbooks', 'essays'
);

delete from public.tag_groups where slug = 'content';
