<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:supabase-types -->
# Supabase types are generated — never hand-edit

`lib/supabase/database.types.ts` is generated from the live database. Do not edit it
by hand — drift between hand-typed columns and the real schema already caused a
production outage (a mistyped `subscribers.confirmation_token` plus omitted columns
that TypeScript could not catch).

- After any schema migration, regenerate: `npm run db:types`.
- The `2>/dev/null` in that script is load-bearing — without it the Supabase CLI's
  "new version available" notice is piped into the file and breaks TypeScript parsing.
- Never strip the per-table `Relationships` arrays; without them every typed query
  resolves to `never` and the build fails.
- `status` columns are `string` in these types (the DB uses `text` + CHECK, not a
  native enum). Keep narrow value sets as domain union types at the app boundary
  (e.g. `SubscriberStatus` in `components/admin/SubscriberStatusSelect.tsx`), not in
  the generated file.
<!-- END:supabase-types -->
