-- Enum Types
CREATE TYPE subscription_provider AS ENUM ('stripe', 'iyzico');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing', 'grace_period');

-- 1. Subscriptions Table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    provider subscription_provider NOT NULL,
    provider_sub_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status subscription_status NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    grace_period_end TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    billing_country VARCHAR(2),
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying by tenant or provider ID quickly
CREATE INDEX idx_subscriptions_tenant_id ON public.subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_provider_sub_id ON public.subscriptions(provider_sub_id);

-- 2. Billing Customers Table
CREATE TABLE public.billing_customers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    iyzico_reference_code TEXT,
    billing_country VARCHAR(2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_customers_stripe_id ON public.billing_customers(stripe_customer_id);
CREATE INDEX idx_billing_customers_iyzico_code ON public.billing_customers(iyzico_reference_code);

-- 3. Processed Webhook IDs Table (Idempotency)
CREATE TABLE public.processed_webhook_ids (
    id TEXT PRIMARY KEY,
    provider subscription_provider NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_processed_webhooks_processed_at ON public.processed_webhook_ids(processed_at);

-- Trigger to auto-update 'updated_at' where applicable
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_billing_customers_updated_at
BEFORE UPDATE ON public.billing_customers
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS (Row Level Security) - Optional based on project pattern, but safe
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_webhook_ids ENABLE ROW LEVEL SECURITY;

-- Create policies (placeholder secure policies)
CREATE POLICY "Users can view their tenant's subscriptions"
ON public.subscriptions
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE profiles.id = auth.uid()
  )
);

CREATE POLICY "Users can view their own billing customer info"
ON public.billing_customers
FOR SELECT USING (
  user_id = auth.uid()
);
