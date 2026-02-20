-- Migration: RLS Fixes for Audio Playback & Devices
-- Created at: 2026-02-20
-- Goal: Fix missing RLS policies from previous hardening pass.

--------------------------------------------------------------------------------
-- 1. Enable RLS on missed tables
--------------------------------------------------------------------------------
ALTER TABLE public.track_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- 2. Track Files Policies (Required for Audio Playback)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view track files" ON public.track_files;
CREATE POLICY "Authenticated users can view track files"
  ON public.track_files FOR SELECT
  TO authenticated
  USING ( true );

--------------------------------------------------------------------------------
-- 3. Devices Policies (Required for Device Management)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their tenant's devices" ON public.devices;
CREATE POLICY "Users can view their tenant's devices"
  ON public.devices FOR SELECT
  TO authenticated
  USING ( 
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage their tenant's devices" ON public.devices;
CREATE POLICY "Admins can manage their tenant's devices"
  ON public.devices FOR ALL
  TO authenticated
  USING ( 
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin'))
  )
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin'))
  );

--------------------------------------------------------------------------------
-- 4. Custom Requests Policies
--------------------------------------------------------------------------------
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own requests" ON public.custom_requests;
CREATE POLICY "Users can view their own requests"
  ON public.custom_requests FOR SELECT
  TO authenticated
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Admins can manage all requests" ON public.custom_requests;
CREATE POLICY "Admins can manage all requests"
  ON public.custom_requests FOR ALL
  TO authenticated
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin')) );

--------------------------------------------------------------------------------
-- 5. Disputes & Licenses Policies
--------------------------------------------------------------------------------
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own licenses" ON public.licenses;
CREATE POLICY "Users can view their own licenses"
  ON public.licenses FOR SELECT
  TO authenticated
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can view their own disputes" ON public.disputes;
CREATE POLICY "Users can view their own disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Admins can manage all global records" ON public.licenses;
CREATE POLICY "Admins can manage all global records"
  ON public.licenses FOR ALL
  TO authenticated
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin')) );

DROP POLICY IF EXISTS "Admins can manage all disputes" ON public.disputes;
CREATE POLICY "Admins can manage all disputes"
  ON public.disputes FOR ALL
  TO authenticated
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'enterprise_admin')) );

--------------------------------------------------------------------------------
-- 6. Explicit Grants
--------------------------------------------------------------------------------
GRANT SELECT ON public.track_files TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.licenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.disputes TO authenticated;
