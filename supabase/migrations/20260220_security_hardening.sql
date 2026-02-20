-- Migration: Security Hardening & Multi-Tenant RLS
-- Created at: 2026-02-20
-- Goal: Enforce strict data isolation for Publishable Key usage.

--------------------------------------------------------------------------------
-- 1. Enable RLS on core tables
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playback_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_schedules ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- 2. Profiles Policies
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

--------------------------------------------------------------------------------
-- 3. Tenants Policies
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
CREATE POLICY "Users can view their own tenant"
  ON public.tenants FOR SELECT
  USING ( 
    auth.uid() IN (SELECT id FROM public.profiles WHERE tenant_id = tenants.id)
  );

--------------------------------------------------------------------------------
-- 4. Tracks Policies (Universal authenticated read)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view tracks" ON public.tracks;
CREATE POLICY "Authenticated users can view tracks"
  ON public.tracks FOR SELECT
  TO authenticated
  USING ( true );

DROP POLICY IF EXISTS "Admins can manage tracks" ON public.tracks;
CREATE POLICY "Admins can manage tracks"
  ON public.tracks FOR ALL
  TO authenticated
  USING ( 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin'))
  );

--------------------------------------------------------------------------------
-- 5. Likes Policies
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own likes" ON public.likes;
CREATE POLICY "Users can manage their own likes"
  ON public.likes FOR ALL
  TO authenticated
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

--------------------------------------------------------------------------------
-- 6. Playlists Policies (Tenant Isolation)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their tenant's playlists" ON public.playlists;
CREATE POLICY "Users can view their tenant's playlists"
  ON public.playlists FOR SELECT
  TO authenticated
  USING ( 
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage their own created playlists" ON public.playlists;
CREATE POLICY "Users can manage their own created playlists"
  ON public.playlists FOR ALL
  TO authenticated
  USING ( 
    created_by = auth.uid() 
    OR 
    (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin')))
  )
  WITH CHECK (
    created_by = auth.uid()
    OR
    (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin')))
  );

--------------------------------------------------------------------------------
-- 7. Playlist Items Policies
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their tenant's playlist items" ON public.playlist_items;
CREATE POLICY "Users can view their tenant's playlist items"
  ON public.playlist_items FOR SELECT
  TO authenticated
  USING ( 
    playlist_id IN (SELECT id FROM public.playlists WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  );

DROP POLICY IF EXISTS "Users can manage their tenant's playlist items" ON public.playlist_items;
CREATE POLICY "Users can manage their tenant's playlist items"
  ON public.playlist_items FOR ALL
  TO authenticated
  USING ( 
    playlist_id IN (SELECT id FROM public.playlists WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  )
  WITH CHECK (
    playlist_id IN (SELECT id FROM public.playlists WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  );

--------------------------------------------------------------------------------
-- 8. Venues Policies
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their tenant's venues" ON public.venues;
CREATE POLICY "Users can view their tenant's venues"
  ON public.venues FOR SELECT
  TO authenticated
  USING ( 
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage their tenant's venues" ON public.venues;
CREATE POLICY "Admins can manage their tenant's venues"
  ON public.venues FOR ALL
  TO authenticated
  USING ( 
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin'))
  )
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin'))
  );

--------------------------------------------------------------------------------
-- 9. Telemetry Policies (Playback Sessions & Search Logs)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their tenant's playback sessions" ON public.playback_sessions;
CREATE POLICY "Users can view their tenant's playback sessions"
  ON public.playback_sessions FOR SELECT
  TO authenticated
  USING ( 
    venue_id IN (SELECT id FROM public.venues WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  );

DROP POLICY IF EXISTS "Authenticated users can insert playback sessions" ON public.playback_sessions;
CREATE POLICY "Authenticated users can insert playback sessions"
  ON public.playback_sessions FOR INSERT
  TO authenticated
  WITH CHECK ( true );

DROP POLICY IF EXISTS "Users can view their own search logs" ON public.search_logs;
CREATE POLICY "Users can view their own search logs"
  ON public.search_logs FOR SELECT
  TO authenticated
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Authenticated users can insert search logs" ON public.search_logs;
CREATE POLICY "Authenticated users can insert search logs"
  ON public.search_logs FOR INSERT
  TO authenticated
  WITH CHECK ( true );

--------------------------------------------------------------------------------
-- 10. Venue Schedules Policies
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their tenant's schedules" ON public.venue_schedules;
CREATE POLICY "Users can view their tenant's schedules"
  ON public.venue_schedules FOR SELECT
  TO authenticated
  USING ( 
    venue_id IN (SELECT id FROM public.venues WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  );

DROP POLICY IF EXISTS "Admins can manage their tenant's schedules" ON public.venue_schedules;
CREATE POLICY "Admins can manage their tenant's schedules"
  ON public.venue_schedules FOR ALL
  TO authenticated
  USING ( 
    venue_id IN (SELECT id FROM public.venues WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin')))
  )
  WITH CHECK (
    venue_id IN (SELECT id FROM public.venues WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin')))
  );

--------------------------------------------------------------------------------
-- 11. Explicit Grants (Essential for Publishable Key)
--------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlist_items TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.tenants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venues TO authenticated;
GRANT SELECT, INSERT ON public.playback_sessions TO authenticated;
GRANT SELECT, INSERT ON public.search_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venue_schedules TO authenticated;
