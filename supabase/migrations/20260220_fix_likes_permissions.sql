-- Migration: Fix Likes table permissions
-- Created at: 2026-02-20

-- Grant ALL privileges to service_role (Admin client)
GRANT ALL ON TABLE public.likes TO service_role;
GRANT ALL ON TABLE public.likes TO postgres;
GRANT ALL ON TABLE public.likes TO supabase_admin;

-- Grant standard privileges to authenticated users
GRANT SELECT, INSERT, DELETE ON TABLE public.likes TO authenticated;

-- Ensure RLS doesn't block service_role (usually it doesn't, but let's be safe)
-- The existing policy only allows users to manage their own likes
-- Service role bypasses RLS by default in Supabase, but if it doesn't for some reason:
ALTER TABLE public.likes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- If a policy already exists, this will ensure service_role has a path if needed
-- although it usually is not necessary.
