-- AURA STREAM MASTER SCHEMA [2026-02-18]
-- Hierarchical Multi-Tenant Architecture (Starbucks Model)

--------------------------------------------------------------------------------
-- 0. TYPES & ENUMS
--------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'enterprise_admin', 'creator', 'venue', 'staff');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'business', 'enterprise');
EXCEPTION WHEN duplicate_object THEN null; END $$;

--------------------------------------------------------------------------------
-- 1. TENANTS (Enterprise Root)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID,
    legal_name TEXT,
    display_name TEXT,
    industry TEXT,
    website TEXT,
    tax_office TEXT,
    vkn TEXT,
    billing_address TEXT,
    invoice_email TEXT,
    phone TEXT,
    authorized_person_name TEXT,
    authorized_person_phone TEXT,
    logo_url TEXT,
    current_plan public.plan_type DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

--------------------------------------------------------------------------------
-- 2. LOCATIONS (Branches)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    timezone TEXT DEFAULT 'Europe/Istanbul',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

--------------------------------------------------------------------------------
-- 3. PROFILES (Users)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role public.user_role DEFAULT 'venue',
    tenant_id UUID REFERENCES public.tenants(id),
    location_id UUID REFERENCES public.locations(id), -- For locking staff to a branch
    venue_id UUID REFERENCES public.locations(id), -- Legacy support / branch lock
    billing_details JSONB,
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

--------------------------------------------------------------------------------
-- 4. VENUES (Legacy Support / Aliased to Locations)
--------------------------------------------------------------------------------
-- In the new model, 'venues' table acts as the primary 'location' or is replaced by locations.
-- For compatibility with existing components:
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    owner_id UUID REFERENCES public.profiles(id),
    business_name TEXT NOT NULL,
    city TEXT,
    address_line1 TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

--------------------------------------------------------------------------------
-- 5. DEVICES (Players)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    hardware_id TEXT UNIQUE,
    auth_token TEXT,
    last_heartbeat TIMESTAMPTZ,
    app_version TEXT,
    sync_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

--------------------------------------------------------------------------------
-- 6. SECURITY DEFINER HELPERS
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------------------------------------
-- 7. GLOBAL RLS POLICIES (Starbucks Model)
--------------------------------------------------------------------------------

-- VENUES ACCESS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Venue access unified" ON public.venues FOR SELECT TO authenticated
USING (
    public.is_admin() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'enterprise_admin' AND tenant_id = venues.tenant_id) OR
    (id = (SELECT venue_id FROM public.profiles WHERE id = auth.uid()))
);

-- TENANTS ACCESS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated insert" ON public.tenants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow owner access" ON public.tenants FOR ALL TO authenticated 
USING (owner_id = auth.uid() OR public.is_admin());
