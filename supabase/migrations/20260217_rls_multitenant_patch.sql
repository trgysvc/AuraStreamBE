-- Sonaraura RLS Multitenancy Patch [2026-02-17]
-- Objective: Ensure strict tenant isolation and admin oversight across all core tables.

--------------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPERS (Recursion-proof)
--------------------------------------------------------------------------------

-- Check if current user is a global admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Get current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_my_tenant()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM profiles
    WHERE id = auth.uid()
  );
END;
$$;

--------------------------------------------------------------------------------
-- 2. TENANTS TABLE POLICIES
--------------------------------------------------------------------------------
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
CREATE POLICY "Users can view their own tenant"
    ON public.tenants FOR SELECT
    USING (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own tenant" ON public.tenants;
CREATE POLICY "Users can update their own tenant"
    ON public.tenants FOR UPDATE
    USING (auth.uid() = owner_id OR public.is_admin());

--------------------------------------------------------------------------------
-- 3. VENUES TABLE POLICIES (Multi-tenant)
--------------------------------------------------------------------------------
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Venue owners can view their venues" ON public.venues;
CREATE POLICY "Tenant users can view their venues"
    ON public.venues FOR SELECT
    USING (tenant_id = public.get_my_tenant() OR public.is_admin());

DROP POLICY IF EXISTS "Venue owners can update their venues" ON public.venues;
CREATE POLICY "Tenant users can manage their venues"
    ON public.venues FOR ALL
    USING (tenant_id = public.get_my_tenant() OR public.is_admin());

--------------------------------------------------------------------------------
-- 4. TRACKS & TRACK_FILES (Public/Admin/Tenant)
--------------------------------------------------------------------------------
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active tracks are viewable by everyone" ON public.tracks;
CREATE POLICY "Anyone can view active tracks"
    ON public.tracks FOR SELECT
    USING (status = 'active');

DROP POLICY IF EXISTS "Admins can view all tracks" ON public.tracks;
CREATE POLICY "Admins can manage all tracks"
    ON public.tracks FOR ALL
    USING (public.is_admin());

ALTER TABLE public.track_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view streamable files for active tracks" ON public.track_files;
CREATE POLICY "Public can view streamable files for active tracks"
    ON public.track_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tracks
            WHERE id = track_files.track_id AND status = 'active'
        ) OR public.is_admin()
    );

--------------------------------------------------------------------------------
-- 5. PLAYBACK SESSIONS (Tenant Analytics)
--------------------------------------------------------------------------------
ALTER TABLE public.playback_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert playback stats" ON public.playback_sessions;
CREATE POLICY "Users can insert playback stats"
    ON public.playback_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Tenant users can view their venue playback stats"
    ON public.playback_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM venues 
            WHERE venues.id = playback_sessions.venue_id 
            AND venues.tenant_id = public.get_my_tenant()
        ) OR public.is_admin()
    );

--------------------------------------------------------------------------------
-- 6. VENUE SCHEDULES (Tenant Isolation)
--------------------------------------------------------------------------------
ALTER TABLE public.venue_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Venue owners can manage their schedules" ON public.venue_schedules;
CREATE POLICY "Tenant users can manage their schedules"
    ON public.venue_schedules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM venues 
            WHERE venues.id = venue_schedules.venue_id 
            AND venues.tenant_id = public.get_my_tenant()
        ) OR public.is_admin()
    );
