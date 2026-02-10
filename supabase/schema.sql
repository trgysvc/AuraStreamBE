-- AuraStream v3.6 Database Schema
-- Native Supabase / PostgreSQL
-- Single Source of Truth: Implementation Plan PDF

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

--------------------------------------------------------------------------------
-- CLEANUP (For Idempotency)
--------------------------------------------------------------------------------
-- Drop types if they exist to allow clean re-runs
drop type if exists user_role cascade;
drop type if exists subscription_tier cascade;
drop type if exists track_status cascade;
drop type if exists file_type cascade;
drop type if exists tuning_f cascade;
drop type if exists license_usage_type cascade;
drop type if exists verification_status cascade;
drop type if exists request_status cascade;

-- Drop tables if they exist to allow clean re-runs
drop table if exists public.track_reviews cascade;
drop table if exists public.search_logs cascade;
drop table if exists public.saved_searches cascade;
drop table if exists public.custom_requests cascade;
drop table if exists public.playback_sessions cascade;
drop table if exists public.licenses cascade;
drop table if exists public.track_files cascade;
drop table if exists public.tracks cascade;
drop table if exists public.venues cascade;
drop table if exists public.profiles cascade;

--------------------------------------------------------------------------------
-- ENUMS
--------------------------------------------------------------------------------

create type user_role as enum ('venue', 'creator', 'admin');
create type subscription_tier as enum ('free', 'pro', 'business', 'enterprise');
create type track_status as enum ('pending_qc', 'processing', 'active', 'rejected');
create type file_type as enum ('raw', 'stream_aac', 'stream_flac', 'download_mp3', 'download_wav', 'stem');
create type tuning_f as enum ('440hz', '432hz', '528hz');
create type license_usage_type as enum ('youtube', 'podcast', 'advertisement', 'film', 'social_media');
create type verification_status as enum ('pending', 'verified', 'rejected');
create type request_status as enum ('pending', 'processing', 'review', 'completed', 'rejected');

--------------------------------------------------------------------------------
-- 1. PROFILES & USERS
--------------------------------------------------------------------------------

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role user_role not null default 'creator',
  subscription_tier subscription_tier not null default 'free',
  stripe_customer_id text,
  youtube_channel_id text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

--------------------------------------------------------------------------------
-- 2. VENUES (B2B)
--------------------------------------------------------------------------------

create table public.venues (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) not null,
  business_name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  country text,
  verification_status verification_status default 'pending',
  settings jsonb default '{}'::jsonb, -- zone configs, open hours
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Venues
alter table public.venues enable row level security;

create policy "Venue owners can view their venues"
  on venues for select
  using ( auth.uid() = owner_id );

create policy "Venue owners can update their venues"
  on venues for update
  using ( auth.uid() = owner_id );

--------------------------------------------------------------------------------
-- 3. TRACKS (Core Asset)
--------------------------------------------------------------------------------

create table public.tracks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  artist text default 'AuraStream AI',
  bpm integer,
  duration_sec integer,
  key text,
  is_instrumental boolean default false,
  status track_status default 'pending_qc',
  genre text,
  mood_tags text[],
  instruments text[],
  primary_tuning tuning_f default '440hz',
  popularity_score float default 0.0,
  
  -- AI Metadata for Legal/Provenance
  ai_metadata jsonb not null default '{}'::jsonb, 
  -- Expected keys: prompt, model, seed, generated_at
  
  cover_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Tracks
alter table public.tracks enable row level security;

create policy "Active tracks are viewable by everyone"
  on tracks for select
  using ( status = 'active' );

create policy "Admins can view all tracks"
  on tracks for select
  using ( 
    exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

--------------------------------------------------------------------------------
-- 4. TRACK FILES (Assets)
--------------------------------------------------------------------------------

create table public.track_files (
  id uuid default uuid_generate_v4() primary key,
  track_id uuid references public.tracks(id) on delete cascade not null,
  file_type file_type not null,
  tuning tuning_f default '440hz',
  s3_key text not null,
  lufs_value float,
  bitrate integer,
  created_at timestamptz default now()
);

-- RLS: Track Files
alter table public.track_files enable row level security;

create policy "Public can view streamable files for active tracks"
  on track_files for select
  using (
    file_type in ('stream_aac', 'stream_flac')
    and exists (
      select 1 from tracks
      where id = track_files.track_id and status = 'active'
    )
  );

--------------------------------------------------------------------------------
-- 5. LICENSES (B2C)
--------------------------------------------------------------------------------

create table public.licenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  track_id uuid references public.tracks(id) not null,
  license_key text not null unique, -- QR Hash
  project_name text not null,
  usage_type license_usage_type not null,
  platform_id text, -- YouTube Channel ID etc.
  
  -- Security
  watermark_hash text,
  download_token text,
  
  price_paid decimal(10,2),
  currency text default 'USD',
  
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- RLS: Licenses
alter table public.licenses enable row level security;

create policy "Users can view their own licenses"
  on licenses for select
  using ( auth.uid() = user_id );

--------------------------------------------------------------------------------
-- 6. PLAYBACK SESSIONS (Analytics)
--------------------------------------------------------------------------------

create table public.playback_sessions (
  id uuid default uuid_generate_v4() primary key,
  venue_id uuid references public.venues(id), -- Nullable if B2C preview
  user_id uuid references public.profiles(id),
  track_id uuid references public.tracks(id) not null,
  played_at timestamptz default now(),
  duration_listened integer not null, -- Seconds
  skipped boolean default false,
  offline_mode boolean default false,
  tuning_used tuning_f default '440hz'
);

-- RLS: Playback Sessions
alter table public.playback_sessions enable row level security;

create policy "Users can insert playback stats"
  on playback_sessions for insert
  with check ( auth.uid() = user_id or exists (select 1 from venues where id = venue_id and owner_id = auth.uid()) );

--------------------------------------------------------------------------------
-- 7. CUSTOM REQUESTS (Sonic Tailor)
--------------------------------------------------------------------------------

create table public.custom_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  status request_status default 'pending',
  prompt text,
  reference_links text[],
  specs jsonb default '{}'::jsonb, -- genre, bpm, mood specifics
  
  delivery_track_id uuid references public.tracks(id),
  price_paid decimal(10,2),
  
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Custom Requests
alter table public.custom_requests enable row level security;

create policy "Users can view own requests"
  on custom_requests for select
  using ( auth.uid() = user_id );

--------------------------------------------------------------------------------
-- 8. SAVED SEARCHES & LOGS
--------------------------------------------------------------------------------

create table public.saved_searches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  query_params jsonb not null,
  notify_on_match boolean default false,
  created_at timestamptz default now()
);

create table public.search_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  query_text text,
  filters_used jsonb,
  result_count integer,
  latency_ms integer,
  created_at timestamptz default now()
);

-- RLS: Saved Searches
alter table public.saved_searches enable row level security;

create policy "Users manage own saved searches"
  on saved_searches for all
  using ( auth.uid() = user_id );

--------------------------------------------------------------------------------
-- 9. QC & REVIEWS
--------------------------------------------------------------------------------

create table public.track_reviews (
  id uuid default uuid_generate_v4() primary key,
  track_id uuid references public.tracks(id) not null,
  reviewer_id uuid references public.profiles(id) not null,
  decision text check (decision in ('approved', 'rejected', 'changes_requested')),
  notes text,
  reviewed_at timestamptz default now()
);

-- RLS: Track Reviews
alter table public.track_reviews enable row level security;

create policy "Admins can manage reviews"
  on track_reviews for all
  using ( 
    exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

--------------------------------------------------------------------------------
-- INDEXES
--------------------------------------------------------------------------------

create index idx_tracks_status_created on tracks(status, created_at desc);
create index idx_tracks_bpm_active on tracks(bpm) where status = 'active';
create index idx_tracks_genre_active on tracks(genre) where status = 'active';
create index idx_playback_venue on playback_sessions(venue_id, played_at);
create index idx_licenses_user on licenses(user_id);
create index idx_track_files_track on track_files(track_id);

--------------------------------------------------------------------------------
-- TRIGGERS
--------------------------------------------------------------------------------

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_modtime before update on profiles for each row execute procedure update_updated_at();
create trigger update_venues_modtime before update on venues for each row execute procedure update_updated_at();
create trigger update_tracks_modtime before update on tracks for each row execute procedure update_updated_at();
