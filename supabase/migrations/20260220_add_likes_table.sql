-- Migration: Add Likes table
-- Created at: 2026-02-20

create table if not exists public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  track_id uuid references public.tracks(id) on delete cascade not null,
  created_at timestamptz default now(),
  
  -- Ensure a user can only like a track once
  unique(user_id, track_id)
);

-- RLS: Likes
alter table public.likes enable row level security;

create policy "Users can manage their own likes"
  on public.likes for all
  using ( auth.uid() = user_id );

-- Explicit grants for authenticated users
grant select, insert, delete on public.likes to authenticated;

-- Index for performance
create index if not exists idx_likes_user_track on likes(user_id, track_id);
