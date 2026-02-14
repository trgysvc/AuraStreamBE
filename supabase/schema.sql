-- Sonaraura v3.6 Database Schema
-- Native Supabase / PostgreSQL
-- Single Source of Truth: Implementation Plan PDF

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- Basic Schema Permissions
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to postgres, service_role;
alter default privileges in schema public grant all on sequences to postgres, service_role;
alter default privileges in schema public grant all on functions to postgres, service_role;

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
drop type if exists plan_type cascade;
drop type if exists plan_status cascade;

-- Drop tables if they exist to allow clean re-runs
drop table if exists public.track_reviews cascade;
drop table if exists public.search_logs cascade;
drop table if exists public.saved_searches cascade;
drop table if exists public.custom_requests cascade;
drop table if exists public.playback_sessions cascade;
drop table if exists public.venue_schedules cascade;
drop table if exists public.disputes cascade;
drop table if exists public.licenses cascade;
drop table if exists public.track_files cascade;
drop table if exists public.tracks cascade;
drop table if exists public.venues cascade;
drop table if exists public.billing_history cascade;
drop table if exists public.tenants cascade;
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
create type plan_type as enum ('free', 'pro', 'business', 'enterprise');
create type plan_status as enum ('active', 'past_due', 'canceled', 'trialing');

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
  tenant_id uuid, -- Will be set after tenants table creation
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

--------------------------------------------------------------------------------
-- 1.1 TENANTS (COMPANIES)
--------------------------------------------------------------------------------

create table public.tenants (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null unique,
  
  -- Corporate Identity
  legal_name text, -- Ticari Ünvan
  display_name text, -- Marka Adı
  industry text, -- Sektör
  website text,
  
  -- Billing & Tax
  tax_office text,
  vkn text, -- Vergi No / TCKN
  billing_address text,
  invoice_email text,
  phone text,
  authorized_person_name text,
  authorized_person_phone text,
  
  -- Branding & Player Settings
  logo_url text,
  brand_color text default '#EC4899',
  volume_limit integer default 100,
  
  -- Subscription State
  current_plan plan_type default 'free',
  plan_status plan_status default 'trialing',
  trial_ends_at timestamptz,
  subscription_id text, -- Stripe Subscription ID
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Tenants
alter table public.tenants enable row level security;

create policy "Users can view their own tenant"
  on public.tenants for select
  using (auth.uid() = owner_id);

create policy "Users can update their own tenant"
  on public.tenants for update
  using (auth.uid() = owner_id);

-- Link profiles back to tenants now that it exists
alter table public.profiles add constraint fk_profiles_tenant foreign key (tenant_id) references public.tenants(id);

--------------------------------------------------------------------------------
-- 2. VENUES (B2B)
--------------------------------------------------------------------------------

create table public.venues (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) not null,
  tenant_id uuid references public.tenants(id),
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
  artist text default 'Sonaraura AI',
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
  
  waveform_data jsonb, -- Extracted amplitude points
  lyrics text,
  lyrics_synced jsonb, -- New: Word-level timestamps
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
-- 6.1 VENUE SCHEDULES
--------------------------------------------------------------------------------

create table public.venue_schedules (
  id uuid default uuid_generate_v4() primary key,
  venue_id uuid references public.venues(id) on delete cascade not null,
  name text not null,
  start_time time not null, 
  end_time time not null,   
  day_of_week integer[],    
  moods text[],             
  genres text[],            
  target_energy float,      
  target_tuning tuning_f default '440hz',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Venue Schedules
alter table public.venue_schedules enable row level security;

create policy "Venue owners can manage their schedules"
  on public.venue_schedules for all
  using ( 
    exists (
        select 1 from public.venues 
        where id = venue_schedules.venue_id 
        and owner_id = auth.uid()
    ) 
  );

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
-- 7.1 YOUTUBE DISPUTES
--------------------------------------------------------------------------------

create table public.disputes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  license_id uuid references public.licenses(id) on delete cascade not null,
  video_url text,
  status text default 'pending', -- pending, resolved, rejected
  dispute_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Disputes
alter table public.disputes enable row level security;

create policy "Users can manage their disputes"
  on public.disputes for all
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
-- 10. BILLING HISTORY
--------------------------------------------------------------------------------

create table public.billing_history (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade,
  
  plan_id text,
  amount decimal(10,2),
  currency text default 'USD',
  status text, -- succeeded, failed
  
  period_start timestamptz,
  period_end timestamptz,
  invoice_pdf_url text,
  
  created_at timestamptz default now()
);

-- RLS: Billing History
alter table public.billing_history enable row level security;

create policy "Users can view their own billing history"
  on public.billing_history for select
  using (exists (
    select 1 from public.tenants 
    where public.tenants.id = public.billing_history.tenant_id 
    and public.tenants.owner_id = auth.uid()
  ));

--------------------------------------------------------------------------------
-- 11. REFERRALS
--------------------------------------------------------------------------------

create table public.referrals (
  id uuid default uuid_generate_v4() primary key,
  referrer_id uuid references public.profiles(id) on delete set null,
  friend_name text not null,
  friend_email text not null,
  status text default 'pending', -- pending, accepted, rewarded
  created_at timestamptz default now()
);

-- RLS: Referrals
alter table public.referrals enable row level security;

create policy "Users can view their own referrals"
  on public.referrals for select
  using ( auth.uid() = referrer_id );

create policy "Users can insert referrals"
  on public.referrals for insert
  with check ( auth.uid() = referrer_id );

--------------------------------------------------------------------------------
-- 12. FEEDBACK SYSTEM
--------------------------------------------------------------------------------

create type public.feedback_category as enum ('bug', 'feature', 'content', 'billing');
create type public.feedback_severity as enum ('low', 'medium', 'high', 'critical');
create type public.feedback_status as enum ('new', 'in_progress', 'resolved', 'ignored');

create table public.feedbacks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  category feedback_category not null,
  severity feedback_severity default 'low',
  status feedback_status default 'new',
  title text,
  description text,
  metadata jsonb default '{}'::jsonb,
  admin_notes text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- RLS: Feedbacks
alter table public.feedbacks enable row level security;

create policy "Users can insert their own feedbacks"
  on public.feedbacks for insert
  with check ( auth.uid() = user_id );

create policy "Users can view their own feedbacks"
  on public.feedbacks for select
  using ( auth.uid() = user_id );

create policy "Admins can view all feedbacks"
  on public.feedbacks for select
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update feedbacks"
  on public.feedbacks for update
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
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

-- Create a function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_tenant_id uuid;
begin
  -- 1. Create a Default Tenant for the User
  insert into public.tenants (owner_id, display_name, current_plan, plan_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'My Workspace'),
    'free',
    'active'
  )
  returning id into new_tenant_id;

  -- 2. Create the Profile linked to the new tenant
  insert into public.profiles (id, email, full_name, avatar_url, tenant_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new_tenant_id;
  );
  
  return new;
end;
$$;

create trigger update_profiles_modtime before update on profiles for each row execute procedure update_updated_at();
create trigger update_tenants_modtime before update on tenants for each row execute procedure update_updated_at();
create trigger update_venues_modtime before update on venues for each row execute procedure update_updated_at();
create trigger update_tracks_modtime before update on tracks for each row execute procedure update_updated_at();
create trigger update_venue_schedules_modtime before update on venue_schedules for each row execute procedure update_updated_at();

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Performance Grants
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage on all sequences in schema public to authenticated;

-- All RLS policies are defined contextually above.
