-- Reference data: the 6 tag groups and the tags assigned to them.
-- Authored as a migration (not seed.sql) so a fresh environment built from
-- migration history gets the same taxonomy, since the admin tagging UI
-- depends on these rows existing.
--
-- Re-runnable via ON CONFLICT — display names and ordering can be tweaked
-- by editing this file and re-applying.

-- ─────────────────────────────────────────────
-- Groups
-- ─────────────────────────────────────────────
insert into public.tag_groups (slug, name, sort_order) values
  ('entry-points',         'Entry Points',          10),
  ('core-skills',          'Core Skills',           20),
  ('mindset-frameworks',   'Mindset & Frameworks',  30),
  ('claude-features',      'Claude Features',       40),
  ('claude-in-your-apps',  'Claude in Your Apps',   50),
  ('claude-in-your-work',  'Claude in Your Work',   60)
on conflict (slug) do update
  set name       = excluded.name,
      sort_order = excluded.sort_order;

-- ─────────────────────────────────────────────
-- Tags
-- ─────────────────────────────────────────────
insert into public.tags (slug, name, group_id, sort_order) values
  -- Entry Points
  ('start-here',           'Start Here',           (select id from public.tag_groups where slug='entry-points'),        10),
  ('quick-wins',           'Quick Wins',           (select id from public.tag_groups where slug='entry-points'),        20),
  ('common-mistakes',      'Common Mistakes',      (select id from public.tag_groups where slug='entry-points'),        30),

  -- Core Skills
  ('prompting',            'Prompting',            (select id from public.tag_groups where slug='core-skills'),         10),
  ('context',              'Context',              (select id from public.tag_groups where slug='core-skills'),         20),
  ('iteration',            'Iteration',            (select id from public.tag_groups where slug='core-skills'),         30),
  ('delegation',           'Delegation',           (select id from public.tag_groups where slug='core-skills'),         40),

  -- Mindset & Frameworks
  ('mindset',              'Mindset',              (select id from public.tag_groups where slug='mindset-frameworks'),  10),
  ('frameworks',           'Frameworks',           (select id from public.tag_groups where slug='mindset-frameworks'),  20),
  ('workflows',            'Workflows',            (select id from public.tag_groups where slug='mindset-frameworks'),  30),

  -- Claude Features
  ('chat',                 'Chat',                 (select id from public.tag_groups where slug='claude-features'),     10),
  ('cowork',               'Cowork',               (select id from public.tag_groups where slug='claude-features'),     20),
  ('code',                 'Code',                 (select id from public.tag_groups where slug='claude-features'),     30),
  ('design',               'Design',               (select id from public.tag_groups where slug='claude-features'),     40),
  ('projects',             'Projects',             (select id from public.tag_groups where slug='claude-features'),     50),
  ('artifacts',            'Artifacts',            (select id from public.tag_groups where slug='claude-features'),     60),
  ('skills',               'Skills',               (select id from public.tag_groups where slug='claude-features'),     70),
  ('connectors',           'Connectors',           (select id from public.tag_groups where slug='claude-features'),     80),
  ('memory',               'Memory',               (select id from public.tag_groups where slug='claude-features'),     90),
  ('web-search',           'Web Search',           (select id from public.tag_groups where slug='claude-features'),    100),
  ('research-mode',        'Research Mode',        (select id from public.tag_groups where slug='claude-features'),    110),
  ('choosing-a-model',     'Choosing a Model',     (select id from public.tag_groups where slug='claude-features'),    120),

  -- Claude in Your Apps
  ('claude-in-chrome',     'Claude in Chrome',     (select id from public.tag_groups where slug='claude-in-your-apps'),  10),
  ('claude-in-word',       'Claude in Word',       (select id from public.tag_groups where slug='claude-in-your-apps'),  20),
  ('claude-in-excel',      'Claude in Excel',      (select id from public.tag_groups where slug='claude-in-your-apps'),  30),
  ('claude-in-powerpoint', 'Claude in PowerPoint', (select id from public.tag_groups where slug='claude-in-your-apps'),  40),

  -- Claude in Your Work
  ('email',                'Email',                (select id from public.tag_groups where slug='claude-in-your-work'),  10),
  ('meetings',             'Meetings',             (select id from public.tag_groups where slug='claude-in-your-work'),  20),
  ('client-work',          'Client Work',          (select id from public.tag_groups where slug='claude-in-your-work'),  30),
  ('sales',                'Sales',                (select id from public.tag_groups where slug='claude-in-your-work'),  40),
  ('strategy',             'Strategy',             (select id from public.tag_groups where slug='claude-in-your-work'),  50),
  ('planning',             'Planning',             (select id from public.tag_groups where slug='claude-in-your-work'),  60),
  ('research',             'Research',             (select id from public.tag_groups where slug='claude-in-your-work'),  70),
  ('reporting',            'Reporting',            (select id from public.tag_groups where slug='claude-in-your-work'),  80),
  ('spreadsheets',         'Spreadsheets',         (select id from public.tag_groups where slug='claude-in-your-work'),  90),
  ('presentations',        'Presentations',        (select id from public.tag_groups where slug='claude-in-your-work'), 100),
  ('writing-editing',      'Writing & Editing',    (select id from public.tag_groups where slug='claude-in-your-work'), 110)
on conflict (slug) do update
  set name       = excluded.name,
      group_id   = excluded.group_id,
      sort_order = excluded.sort_order;
