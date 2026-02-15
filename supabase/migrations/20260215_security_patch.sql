
-- Sonaraura Security Patch [2026-02-15]
-- Objective: Resolve RLS infinite recursion and fix profile visibility.

--------------------------------------------------------------------------------
-- 1. CLEANUP PREVIOUS POLICIES (Safety First)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all tracks" ON public.tracks;
DROP POLICY IF EXISTS "Admins can manage all venues" ON public.venues;
DROP POLICY IF EXISTS "Admins can manage track files" ON public.track_files;

--------------------------------------------------------------------------------
-- 2. CREATE SECURITY DEFINER HELPER
-- This bypasses RLS to check admin status, preventing recursion.
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER -- This is the key: runs with superuser privileges
AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$;

--------------------------------------------------------------------------------
-- 3. RE-IMPLEMENT PROFILES POLICIES
--------------------------------------------------------------------------------
-- Simple rule: Everyone can see their own data
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Admin rule: Uses the security definer function to avoid recursion
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

--------------------------------------------------------------------------------
-- 4. RE-IMPLEMENT OTHER ADMIN POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Admins can manage all tracks"
    ON public.tracks FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins can manage all venues"
    ON public.venues FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins can manage track files"
    ON public.track_files FOR ALL
    USING (public.is_admin());

--------------------------------------------------------------------------------
-- 5. SAFARI AUDIO / CORS CHECK (Informational)
-- Ensure your S3 bucket CORS allows 'Range' header and 'Authorization' if needed.
--------------------------------------------------------------------------------
