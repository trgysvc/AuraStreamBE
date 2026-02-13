-- Sonaraura Smart Scheduling Schema
-- Supports time-based and day-based music flow rules for venues.

create table if not exists public.venue_schedules (
  id uuid default uuid_generate_v4() primary key,
  venue_id uuid references public.venues(id) on delete cascade not null,
  name text not null,
  start_time time not null, -- e.g. '09:00:00'
  end_time time not null,   -- e.g. '12:00:00'
  day_of_week integer[],    -- [0,1,2,3,4,5,6] (0=Sunday)
  moods text[],             -- Target moods for this slot
  genres text[],            -- Target genres for this slot
  target_energy float,      -- 0 to 100
  target_tuning tuning_f default '440hz',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Venue Schedules
alter table public.venue_schedules enable row level security;

-- Policy for venue owners to manage their schedules
do $$
begin
    if not exists (
        select 1 from pg_policies 
        where tablename = 'venue_schedules' and policyname = 'Venue owners can manage their schedules'
    ) then
        create policy "Venue owners can manage their schedules"
          on public.venue_schedules for all
          using ( 
            exists (
                select 1 from public.venues 
                where id = venue_schedules.venue_id 
                and owner_id = auth.uid()
            ) 
          );
    end if;
end
$$;

-- Trigger to update updated_at
do $$
begin
    if not exists (select 1 from pg_trigger where tgname = 'update_venue_schedules_modtime') then
        create trigger update_venue_schedules_modtime 
        before update on venue_schedules 
        for each row execute procedure update_updated_at();
    end if;
end
$$;

--------------------------------------------------------------------------------
-- YouTube Dispute Center
--------------------------------------------------------------------------------

create table if not exists public.disputes (
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

do $$
begin
    if not exists (
        select 1 from pg_policies 
        where tablename = 'disputes' and policyname = 'Users can manage their disputes'
    ) then
        create policy "Users can manage their disputes"
          on public.disputes for all
          using ( auth.uid() = user_id );
    end if;
end
$$;
