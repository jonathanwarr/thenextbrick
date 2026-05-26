-- Cleanup: remove unused ungrouped tags that predate the curated taxonomy.
--
-- After the group-aware tag picker UI + syncTags hardening landed (admin
-- workflow follow-ups items 1-3), new tags can only be added via migration.
-- The slugs below were inserted before the taxonomy existed, have group_id
-- NULL, and zero post_tags links as of this migration — safe to remove.

delete from public.tags
where group_id is null
  and slug in (
    'agents',
    'caching',
    'evals',
    'post-mortem',
    'structured-output',
    'tool-use'
  );
