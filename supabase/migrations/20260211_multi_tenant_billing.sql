
-- AuraStream Multi-Tenant & Subscription Schema Update
-- Based on User Requirements [2026-02-11]

--------------------------------------------------------------------------------
-- 1. NEW TYPES
--------------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
        CREATE TYPE plan_type AS ENUM ('free', 'pro', 'business', 'enterprise');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_status') THEN
        CREATE TYPE plan_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');
    END IF;
END $$;

--------------------------------------------------------------------------------
-- 2. TENANTS (COMPANIES) TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  
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
  brand_color text DEFAULT '#EC4899',
  volume_limit integer DEFAULT 100,
  
  -- Subscription State
  current_plan plan_type DEFAULT 'free',
  plan_status plan_status DEFAULT 'trialing',
  trial_ends_at timestamptz,
  subscription_id text, -- Stripe Subscription ID
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for Tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tenant"
  ON public.tenants FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own tenant"
  ON public.tenants FOR UPDATE
  USING (auth.uid() = owner_id);

--------------------------------------------------------------------------------
-- 3. BILLING HISTORY TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  plan_id text,
  amount decimal(10,2),
  currency text DEFAULT 'USD',
  status text, -- succeeded, failed
  
  period_start timestamptz,
  period_end timestamptz,
  invoice_pdf_url text,
  
  created_at timestamptz DEFAULT now()
);

-- RLS for Billing History
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own billing history"
  ON public.billing_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE public.tenants.id = public.billing_history.tenant_id 
    AND public.tenants.owner_id = auth.uid()
  ));

--------------------------------------------------------------------------------
-- 4. UPDATE EXISTING TABLES
--------------------------------------------------------------------------------

-- Add tenant_id to profiles to link a user to a company
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- Update venues to link to tenants
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- Migration logic: Link existing venues to a new tenant if necessary (Manual step in production)

--------------------------------------------------------------------------------
-- 5. TRIGGERS
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  return new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tenants_modtime ON public.tenants;
CREATE TRIGGER update_tenants_modtime BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
