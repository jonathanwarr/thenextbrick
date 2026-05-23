# Admin Workflow Follow-ups

**Date authored:** 2026-05-22
**Status:** Ready to build — pending start signal
**Scope:** Code-side changes that close the gaps left by today's Supabase infrastructure work.

---

## Context

Today's Supabase session added infrastructure that the admin UI doesn't yet take advantage of:

- A `pg_cron` job (`publish-scheduled-posts`) is running every minute, ready to flip posts from `scheduled` to `published` once their `published_at` arrives — but the admin has no UI for setting that time.
- A `tag_groups` table and a curated taxonomy (6 groups, ~40 tags) now exist — but the post form's tag input is still a free-text CSV that auto-creates any new slug it sees, which is what produced typo-tags in the first place.
- The `subscribers` table is now locked under default-deny RLS — but the subscribe/unsubscribe code paths haven't been verified to use the service-role client, which is the only way they can write.

This brief captures the code-side work needed to close those gaps.

---

## Scope summary

| # | Item | Type | Priority |
|---|------|------|----------|
| 1 | Scheduled post publishing UI | Feature | High |
| 2 | Group-aware tag autocomplete | Feature | High |
| 3 | `syncTags` server hardening | Hardening | High (couples with #2) |
| 4 | Ungrouped tag audit | Housekeeping | Low |
| 5 | Subscriber flow service-role verification | Verification | Medium |

---

## 1. Scheduled post publishing UI

### Problem
`status='scheduled'` exists in the schema and the `pg_cron` job is wired up to act on it, but the admin can't actually set a future publish date. Selecting "Scheduled" in the status dropdown today does nothing — there's no `published_at` input.

### Files affected
- `components/admin/PostForm.tsx`
- `app/admin/posts/actions.ts`

### Changes
- **Form**: Add a `<input type="datetime-local" name="published_at">` field. Always render it; label it as "Publish date — used when status is Scheduled or Published." (Conditional rendering would require turning the form into a client component for a toggle that only the author sees — not worth the complexity.)
- **Server action `savePost`**: Read `published_at` from the form, convert from the browser's local time to a UTC ISO string, and include it in the insert/update payload.
- **Validation in `savePost`**:
  - If `status === 'scheduled'` and `published_at` is missing or in the past → reject with an error redirect.
  - If `status === 'published'` and `published_at` is missing → default to `now()` (the DB-side `posts_stamp_published_at` trigger already handles this on the DB side, but doing it explicitly in the action makes the intent clear in code).
  - If `status === 'draft'` → ignore the submitted value; write `null`.

### Acceptance criteria
- Choosing **Draft** with no date → post saves, `published_at` is `null`, not publicly visible.
- Choosing **Scheduled** with a future date → post saves, status is `scheduled`, hidden from public, and visible to public within ~60s of the scheduled time (cron flips it).
- Choosing **Scheduled** with a past date → form rejects with a clear error message.
- Choosing **Published** with no date → post saves with `published_at = now()`, immediately visible.
- Choosing **Published** with a past date → post saves with that date as the displayed publish date; immediately visible.

### Notes
- `published_at` is stored as `timestamptz`; the input is a wall-clock local time. Use `new Date(formInput).toISOString()` in the action to convert.
- The `pg_cron` job runs in UTC and uses `published_at <= now()`. No timezone gymnastics needed — Postgres handles the comparison correctly because the column is `timestamptz`.

---

## 2. Group-aware tag autocomplete

### Problem
The current tag input ([components/admin/PostForm.tsx](../../components/admin/PostForm.tsx)) is a free-text CSV. Authors can type whatever they want; `syncTags` auto-creates any unrecognized slug. This was the original source of typo tags. Now that `tag_groups` provides a curated taxonomy, the UI should restrict authors to selecting from existing tags only.

### Files affected
- `components/admin/PostForm.tsx` (replace the tags input)
- Likely a new client component, e.g. `components/admin/TagPicker.tsx` (for the autocomplete UX)
- Possibly a Server Action or route handler for the autocomplete query, e.g. `app/api/admin/tags/search/route.ts` — or a Server Action invoked from the client component
- `app/admin/posts/actions.ts` (`savePost` form parsing — tags come in as a structured list, not a CSV)

### Changes
- **Data fetching**: Query `tags` joined with `tag_groups`, ordered by `tag_groups.sort_order`, then `tags.sort_order`. Return `{ slug, name, group: { slug, name } }` shape.
- **UX (design decision to confirm before building)**: Two viable patterns:
  - **Drawer-per-group**: 6 group chips at the top; clicking one expands the tag chips inside it. Most discoverable for first-time use.
  - **Flat searchable list with group labels**: a single text input that filters across all tags; matched options show with their group as a subtitle. Faster for repeat use, less visually heavy.

  **Recommend confirming choice before build.** Drawer feels right for the audience-centric, browseable nature of these tags.
- **Selection model**: Selected tags appear as removable chips above/below the picker. Submit value is the array of selected slugs (hidden field with JSON-encoded array, or multiple `<input name="tags[]">` fields).
- **No free-text input.** No "Create new tag" affordance. New tags only ever come from a migration file.

### Acceptance criteria
- Author can only select tags that already exist in the DB.
- Tags are visually grouped by their `tag_group` in the UI.
- Tag chips on a post are removable.
- Submitting the form persists the exact set of selected tag IDs to `post_tags` (existing tags only — see hardening item #3).
- Display ordering follows `tag_groups.sort_order` and `tags.sort_order`.

### Notes
- The autocomplete fetch can hit the DB directly via the existing server client — `tags` and `tag_groups` both have public SELECT RLS, so no service-role needed.
- Keep the picker component lightweight; this is admin-only, no need for fancy headless-ui libraries unless the design demands it.

---

## 3. `syncTags` server hardening

### Problem
`syncTags` in [app/admin/posts/actions.ts](../../app/admin/posts/actions.ts) currently auto-creates any unknown tag slug it receives. Even after the UI is selection-only, a stale autocomplete cache, a malformed request, or a future bug could push an unknown slug into the action — and `syncTags` would happily insert it. Defense in depth requires fixing this on the server too, not just in the UI.

### Files affected
- `app/admin/posts/actions.ts`

### Changes
- In `syncTags`, remove the branch that inserts new rows into `tags`.
- Replace it with a lookup-only flow: take submitted slugs, resolve them against existing `tags`, and silently drop any that don't match (or log a warning, or reject the save — design choice).
- Recommend: **silently drop unknowns**. The UI prevents this case, so reaching this branch is either a bug or a tampering attempt; failing the whole save would be hostile, but the unknowns shouldn't be created.

### Acceptance criteria
- Submitting a known slug → tag is associated with the post (existing behavior).
- Submitting an unknown slug → the slug is ignored; no row is created in `tags`; the save succeeds with the known slugs.
- The `tags` table can no longer grow via post saves — only via migration files.

---

## 4. Ungrouped tag audit

### Problem
After today's bulk insert, any tag in the `tags` table that wasn't in the migration list has `group_id = NULL`. That likely includes:
- The four site categories (`foundations`, `builds`, `observations`, `essays`) used by `categoryFromTags()` in `lib/posts/types.ts`. These are functional, not user-facing tags.
- Any leftover typo tags from earlier saves (e.g., from before this brief's work was completed).

### Files affected
- DB only — likely a one-off cleanup SQL run + possibly a new migration to seed the four site categories properly.

### Changes
1. Run `select id, slug, name, group_id from public.tags where group_id is null;` to inventory what's there.
2. Categorize each ungrouped tag:
   - Site categories → leave ungrouped (they serve a different system), or assign to a dedicated `site-categories` hidden group, or move the concept out of `tags` entirely and into its own enum. **Recommend leaving ungrouped for now**; they're an internal implementation detail.
   - Typo tags → delete (the new UI + server hardening prevents new ones from being created).
3. If any cleanup is performed, capture it in a new migration file under `supabase/migrations/`.

### Acceptance criteria
- `select count(*) from tags where group_id is null` returns only the intended rows (likely the four site categories).
- No typo tags remain.
- Any deletions are recorded in a migration file for reproducibility.

### Notes
- This item can be done at any time and is low-stakes. Recommend doing it *after* items 1–3 are built so the new patterns are in place before cleanup.

---

## 5. Subscriber flow service-role verification

### Problem
The `subscribers` table now has RLS enabled with **no policies** — meaning anon and authenticated clients are denied every operation by default. The subscribe and unsubscribe flows must therefore go through server actions using the **service-role** Supabase client (which bypasses RLS). If any code path still uses the anon client to touch `subscribers`, those flows will silently fail in production.

### Files affected
- Anything under `app/subscribe/` and `app/admin/subscribers/`
- Wherever the subscriber email confirmation/unsubscribe links land (likely `app/api/...` route handlers or server actions)
- `lib/supabase/` client factory files

### Changes
- Audit each code path that reads or writes `subscribers`. Confirm it uses the service-role client (created from `SUPABASE_SERVICE_ROLE_KEY`), not the anon client.
- Pay particular attention to:
  - The signup form action (insert into subscribers)
  - The double-opt-in confirmation handler (update status pending → confirmed)
  - The unsubscribe handler (update status to unsubscribed, ideally guarded by `confirmation_token` match)
  - The admin subscribers list ([app/admin/subscribers](../../app/admin/subscribers))

### Acceptance criteria
- A new browser session (logged out) submits the subscribe form → row appears in `subscribers` with `status='pending'`. No anon-key request to Supabase failed.
- The confirmation email link is clicked → status flips to `confirmed`.
- The unsubscribe link is clicked → status flips to `unsubscribed`.
- The admin subscribers page loads and lists subscribers (uses service-role via admin session).

### Notes
- This is the only item that requires manual end-to-end testing of a user-facing flow.
- The `SUPABASE_SERVICE_ROLE_KEY` env var must never be exposed to the client — verify it's only read in server-only modules (server actions, route handlers, `'use server'` files, server components).

---

## Recommended sequencing

1. **Items 1 + 2 + 3 together** — they touch overlapping files (`PostForm.tsx`, `actions.ts`) and form one coherent unit of admin form work. Hardening (#3) should land in the same PR as the autocomplete UI (#2) so the server-side defense exists by the time the new client-side flow is live.
2. **Item 5 (subscriber verification)** — independent and can be done any time. Recommend before any public newsletter promotion or first batch send.
3. **Item 4 (ungrouped tag audit)** — last; lowest stakes; do once items 1–3 are in.

---

## Out of scope

The following came up during today's Supabase session but are explicitly **not** part of this brief:

- About page implementation — will be hardcoded (HTML/MDX), no DB queries against `profiles`.
- A public `tag_groups`/`tags` filter UI on `/bricks` — separate brief if/when the site needs it.
- Newsletter sending logic — separate brief; the `subscribers` table is ready, but the send mechanics are a later workstream.
- Storage upload UI for post images — separate brief; the bucket and RLS are ready, but the admin UI to upload + embed images in posts is not part of this work.
- A `public_authors` view for surfacing author info publicly — only needed if the About page later becomes DB-backed.

---

## Open questions

1. **Tag picker UX**: drawer-per-group or flat searchable list? (Recommend drawer; confirm before build.)
2. **Unknown-slug handling in `syncTags`**: silently drop, or reject the save with an error? (Recommend silently drop.)
3. **Site categories as `tags`**: leave the `foundations`/`builds`/`observations`/`essays` slugs in `tags` ungrouped, or extract them into their own concept? (Recommend leave as-is for now.)
