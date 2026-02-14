
-- Fix RLS for custom_requests
-- Allows users to submit their own requests and admins to manage them.

-- 1. Ensure RLS is enabled
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing policies
DROP POLICY IF EXISTS "Users can view own requests" ON public.custom_requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON public.custom_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.custom_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.custom_requests;

-- 3. Create Comprehensive Policies

-- POLICY: Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON public.custom_requests FOR SELECT
  USING ( auth.uid() = user_id );

-- POLICY: Users can insert their own requests (THIS WAS MISSING)
CREATE POLICY "Users can insert own requests"
  ON public.custom_requests FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- POLICY: Admins can view everything
CREATE POLICY "Admins can view all requests"
  ON public.custom_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICY: Admins can update (status, notes, delivery)
CREATE POLICY "Admins can update requests"
  ON public.custom_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Re-apply Grants
GRANT ALL ON TABLE public.custom_requests TO authenticated;
GRANT SELECT ON TABLE public.custom_requests TO anon;

-- Verification Comment
COMMENT ON TABLE public.custom_requests IS 'Sonic Tailor requests - RLS Updated';
