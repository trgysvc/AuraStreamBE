
-- Sonaraura Security Hardening Migration [2026-02-15]
-- Objective: Enable RLS on core tables and define restrictive policies.

--------------------------------------------------------------------------------
-- 1. ENABLE RLS ON ALL CORE TABLES
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.track_files ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- 2. PROFILES POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

--------------------------------------------------------------------------------
-- 3. VENUES POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Users can view venues in their tenant"
    ON public.venues FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all venues"
    ON public.venues FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

--------------------------------------------------------------------------------
-- 4. TRACKS POLICIES (THE CORE ASSETS)
--------------------------------------------------------------------------------
CREATE POLICY "Public can view active tracks"
    ON public.tracks FOR SELECT
    USING (status = 'active');

CREATE POLICY "Admins can manage all tracks"
    ON public.tracks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

--------------------------------------------------------------------------------
-- 5. TRACK FILES POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Authenticated users can view track file metadata"
    ON public.track_files FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage track files"
    ON public.track_files FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

--------------------------------------------------------------------------------
-- 6. SEARCH LOGS (OPTIONAL BUT RECOMMENDED)
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.search_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view search logs"
    ON public.search_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
