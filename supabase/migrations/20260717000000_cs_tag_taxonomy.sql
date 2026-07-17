-- Customer-success repositioning: replace the 6 original tag groups with the
-- 5-group CS taxonomy (Content, Foundations, Claude Features, CS Functions,
-- CS Leadership).
--
-- Same pattern as 20260522220100_tag_taxonomy.sql: re-runnable via ON CONFLICT.
-- Existing slugs that survive (prompting, context, memory, cowork, code,
-- design, projects, skills, connectors, artifacts) keep their ids — and any
-- post_tags links — and are re-homed/re-ordered in place.
--
-- Retired tags are deleted at the end; post_tags links to them cascade away
-- (post_tags_tag_id_fkey is ON DELETE CASCADE). That loss is intentional:
-- posts get re-tagged under the new taxonomy. Retired groups are deleted
-- last — any unexpected leftover tag would fall to group_id NULL (FK is
-- ON DELETE SET NULL) and surface under "Other" in the filter UI rather
-- than disappear silently.

-- ─────────────────────────────────────────────
-- Groups
-- ─────────────────────────────────────────────
insert into public.tag_groups (slug, name, sort_order) values
  ('content',         'Content',          10),
  ('foundations',     'Foundations',      20),
  ('claude-features', 'Claude Features',  30),
  ('cs-functions',    'CS Functions',     40),
  ('cs-leadership',   'CS Leadership',    50)
on conflict (slug) do update
  set name       = excluded.name,
      sort_order = excluded.sort_order;

-- ─────────────────────────────────────────────
-- Tags
-- ─────────────────────────────────────────────
insert into public.tags (slug, name, group_id, sort_order) values
  -- Content
  ('articles',                  'Articles',                  (select id from public.tag_groups where slug='content'),          10),
  ('playbooks',                 'Playbooks',                 (select id from public.tag_groups where slug='content'),          20),
  ('essays',                    'Essays',                    (select id from public.tag_groups where slug='content'),          30),

  -- Foundations
  ('prompting',                 'Prompting',                 (select id from public.tag_groups where slug='foundations'),      10),
  ('context',                   'Context',                   (select id from public.tag_groups where slug='foundations'),      20),
  ('memory',                    'Memory',                    (select id from public.tag_groups where slug='foundations'),      30),
  ('agents',                    'Agents',                    (select id from public.tag_groups where slug='foundations'),      40),
  ('automation',                'Automation',                (select id from public.tag_groups where slug='foundations'),      50),
  ('evaluation',                'Evaluation',                (select id from public.tag_groups where slug='foundations'),      60),
  ('data-privacy',              'Data & Privacy',            (select id from public.tag_groups where slug='foundations'),      70),

  -- Claude Features
  ('cowork',                    'Cowork',                    (select id from public.tag_groups where slug='claude-features'),  10),
  ('code',                      'Code',                      (select id from public.tag_groups where slug='claude-features'),  20),
  ('design',                    'Design',                    (select id from public.tag_groups where slug='claude-features'),  30),
  ('projects',                  'Projects',                  (select id from public.tag_groups where slug='claude-features'),  40),
  ('skills',                    'Skills',                    (select id from public.tag_groups where slug='claude-features'),  50),
  ('connectors',                'Connectors',                (select id from public.tag_groups where slug='claude-features'),  60),
  ('dispatch',                  'Dispatch',                  (select id from public.tag_groups where slug='claude-features'),  70),
  ('artifacts',                 'Artifacts',                 (select id from public.tag_groups where slug='claude-features'),  80),
  ('models',                    'Models',                    (select id from public.tag_groups where slug='claude-features'),  90),

  -- CS Functions
  ('onboarding-implementation', 'Onboarding & Implementation', (select id from public.tag_groups where slug='cs-functions'),    10),
  ('adoption-engagement',       'Adoption & Engagement',       (select id from public.tag_groups where slug='cs-functions'),    20),
  ('contracts-renewals',        'Contracts & Renewals',        (select id from public.tag_groups where slug='cs-functions'),    30),
  ('expansion-growth',          'Expansion & Growth',          (select id from public.tag_groups where slug='cs-functions'),    40),
  ('relationship-management',   'Relationship Management',     (select id from public.tag_groups where slug='cs-functions'),    50),
  ('customer-advocacy',         'Customer Advocacy',           (select id from public.tag_groups where slug='cs-functions'),    60),
  ('customer-support',          'Customer Support',            (select id from public.tag_groups where slug='cs-functions'),    70),
  ('customer-education',        'Customer Education',          (select id from public.tag_groups where slug='cs-functions'),    80),
  ('customer-voice',            'Customer Voice',              (select id from public.tag_groups where slug='cs-functions'),    90),
  ('cs-operations',             'CS Operations',               (select id from public.tag_groups where slug='cs-functions'),   100),

  -- CS Leadership
  ('training-enablement',       'Training & Enablement',     (select id from public.tag_groups where slug='cs-leadership'),    10),
  ('change-management',         'Change Management',         (select id from public.tag_groups where slug='cs-leadership'),    20),
  ('ai-governance',             'AI Governance',             (select id from public.tag_groups where slug='cs-leadership'),    30),
  ('roi-measurement',           'ROI Measurement',           (select id from public.tag_groups where slug='cs-leadership'),    40),
  ('tool-evaluation',           'Tool Evaluation',           (select id from public.tag_groups where slug='cs-leadership'),    50)
on conflict (slug) do update
  set name       = excluded.name,
      group_id   = excluded.group_id,
      sort_order = excluded.sort_order;

-- ─────────────────────────────────────────────
-- Retire tags that have no home in the new taxonomy
-- ─────────────────────────────────────────────
delete from public.tags
where slug in (
  -- Entry Points
  'start-here', 'quick-wins', 'common-mistakes',
  -- Core Skills leftovers
  'iteration', 'delegation',
  -- Mindset & Frameworks
  'mindset', 'frameworks', 'workflows',
  -- Claude Features leftovers
  'chat', 'web-search', 'research-mode', 'choosing-a-model',
  -- Claude in Your Apps
  'claude-in-chrome', 'claude-in-word', 'claude-in-excel', 'claude-in-powerpoint',
  -- Claude in Your Work
  'email', 'meetings', 'client-work', 'sales', 'strategy', 'planning',
  'research', 'reporting', 'spreadsheets', 'presentations', 'writing-editing'
);

-- ─────────────────────────────────────────────
-- Retire the old groups
-- ─────────────────────────────────────────────
delete from public.tag_groups
where slug in (
  'entry-points',
  'core-skills',
  'mindset-frameworks',
  'claude-in-your-apps',
  'claude-in-your-work'
);
