-- Add "The Brick": a short, structured value-prop blurb shown to the reader
-- immediately (featured card on the home page + a callout near the top of the
-- article). Previously authors hand-wrote this as a section inside body_md,
-- which the cards could not pull from; promoting it to a column gives a single
-- source of truth.
--
-- Nullable text (no default): legacy posts that still carry it in the body keep
-- working, and the card/article callout simply renders nothing until an author
-- fills it in.

alter table public.posts
  add column if not exists the_brick text;
