-- Companion to the baseline schema: infrastructure that lives outside the
-- public schema (storage bucket configuration and pg_cron jobs) and so
-- isn't captured by `supabase db pull`.
--
-- Re-runnable: safe to apply multiple times.

-- ─────────────────────────────────────────────
-- Storage bucket: post-images
--   Public read, 5 MB per-file limit, common image MIME types only.
--   (RLS policies on storage.objects for this bucket are in the baseline.)
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ─────────────────────────────────────────────
-- pg_cron: flip scheduled posts to published once their time arrives.
--   Runs every minute. Schedule is in UTC. Lag between the post's
--   scheduled time and public visibility: 0–60 seconds.
-- ─────────────────────────────────────────────
do $$
begin
  if exists (select 1 from cron.job where jobname = 'publish-scheduled-posts') then
    perform cron.unschedule('publish-scheduled-posts');
  end if;

  perform cron.schedule(
    'publish-scheduled-posts',
    '* * * * *',
    $cron$
      update public.posts
         set status = 'published'
       where status = 'scheduled'
         and published_at is not null
         and published_at <= now();
    $cron$
  );
end $$;
