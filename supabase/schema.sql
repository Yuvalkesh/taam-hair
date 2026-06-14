-- טעם העיר — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → Run).

create extension if not exists "pgcrypto";

create table if not exists public.places (
  id              text primary key,
  name            text not null,
  city            text not null,
  region          text not null,
  category        text not null,
  address         text,
  description     text,
  google_maps_url text,
  lat             double precision not null,
  lng             double precision not null,
  price_level     text,
  rating          double precision,
  submitted_by    text,
  reviews         jsonb not null default '[]'::jsonb,
  status          text not null default 'approved',
  created_at      timestamptz not null default now()
);

alter table public.places enable row level security;

-- Anyone can read approved places.
drop policy if exists "read approved" on public.places;
create policy "read approved"
  on public.places for select
  using (status = 'approved');

-- Anyone can add a place (community submissions). Forced to 'approved' by default;
-- flip the default to 'pending' below if you want to moderate before places go live.
drop policy if exists "public insert" on public.places;
create policy "public insert"
  on public.places for insert
  with check (true);

-- No public updates or deletes (spam cleanup is done from the dashboard).

-- OPTIONAL — moderation mode: places hidden until you approve them.
--   alter table public.places alter column status set default 'pending';
-- Then view pending ones in the app at /?admin=1 and approve in the dashboard.
