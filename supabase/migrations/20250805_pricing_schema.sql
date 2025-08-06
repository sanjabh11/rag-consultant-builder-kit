-- Pricing Schema for Multi-tenant Platform
-- Implements dynamic pricing with historical snapshots and usage tracking

-- Create pricing plan types
CREATE TYPE pricing_plan_type AS ENUM ('free', 'starter', 'professional', 'enterprise', 'custom');
CREATE TYPE billing_period AS ENUM ('monthly', 'yearly', 'lifetime');
CREATE TYPE pricing_model AS ENUM ('flat_rate', 'per_user', 'usage_based', 'tiered', 'hybrid');

-- Create pricing plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  plan_type pricing_plan_type NOT NULL,
  pricing_model pricing_model NOT NULL DEFAULT 'flat_rate',
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_period billing_period NOT NULL DEFAULT 'monthly',
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true, -- Whether plan is publicly available
  features JSONB DEFAULT '{}', -- Feature flags and limits
  metadata JSONB DEFAULT '{}', -- Additional plan metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ, -- Soft delete
  UNIQUE(name, billing_period) -- Unique plan names per billing period
);

-- Create pricing tiers for tiered/usage-based pricing
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
  min_units INTEGER NOT NULL DEFAULT 0,
  max_units INTEGER, -- NULL means unlimited
  price_per_unit DECIMAL(10, 4) NOT NULL,
  flat_fee DECIMAL(10, 2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create resource pricing table (for usage-based billing)
CREATE TABLE IF NOT EXISTS resource_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'api_calls', 'storage_gb', 'compute_hours', 'documents', 'workflows'
  unit_name TEXT NOT NULL, -- 'request', 'GB', 'hour', 'document', 'execution'
  price_per_unit DECIMAL(10, 6) NOT NULL,
  included_units INTEGER DEFAULT 0, -- Free tier
  overage_price DECIMAL(10, 6), -- Price for usage beyond included units
  max_units INTEGER, -- Hard limit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, resource_type)
);

-- Create pricing snapshots for historical tracking
CREATE TABLE IF NOT EXISTS pricing_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  plan_data JSONB NOT NULL, -- Complete snapshot of all plans
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(snapshot_date)
);

-- Create tenant subscriptions table
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES pricing_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended', 'trialing')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  trial_end_date DATE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_method_id TEXT, -- Stripe payment method ID
  stripe_subscription_id TEXT, -- Stripe subscription ID
  stripe_customer_id TEXT, -- Stripe customer ID
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(tenant_id, status) -- Only one active subscription per tenant
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES tenant_subscriptions(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  usage_amount DECIMAL(10, 4) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, resource_type, usage_date)
);

-- Create billing history table
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES tenant_subscriptions(id),
  invoice_number TEXT UNIQUE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  payment_method TEXT,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  line_items JSONB NOT NULL DEFAULT '[]', -- Detailed breakdown
  paid_at TIMESTAMPTZ,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create discount/coupon codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  applicable_plans UUID[] DEFAULT '{}', -- Empty array means all plans
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create applied discounts tracking
CREATE TABLE IF NOT EXISTS applied_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES tenant_subscriptions(id) ON DELETE CASCADE,
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(tenant_id, discount_code_id)
);

-- Insert default pricing plans
INSERT INTO pricing_plans (name, description, plan_type, pricing_model, base_price, billing_period, features) VALUES
  ('Free', 'Perfect for trying out the platform', 'free', 'flat_rate', 0, 'monthly', 
   '{"max_projects": 1, "max_documents": 10, "max_api_calls": 1000, "max_storage_gb": 1, "support_level": "community"}'),
  
  ('Starter', 'Great for small teams', 'starter', 'flat_rate', 29, 'monthly',
   '{"max_projects": 3, "max_documents": 100, "max_api_calls": 10000, "max_storage_gb": 10, "support_level": "email"}'),
  
  ('Professional', 'For growing businesses', 'professional', 'hybrid', 99, 'monthly',
   '{"max_projects": 10, "max_documents": 1000, "max_api_calls": 100000, "max_storage_gb": 50, "support_level": "priority"}'),
  
  ('Enterprise', 'Custom solutions for large organizations', 'enterprise', 'custom', 0, 'monthly',
   '{"max_projects": -1, "max_documents": -1, "max_api_calls": -1, "max_storage_gb": -1, "support_level": "dedicated", "sla": true}');

-- Insert resource pricing for Professional plan
INSERT INTO resource_pricing (plan_id, resource_type, unit_name, price_per_unit, included_units, overage_price)
SELECT 
  p.id,
  r.resource_type,
  r.unit_name,
  r.price_per_unit,
  r.included_units,
  r.overage_price
FROM pricing_plans p
CROSS JOIN (VALUES
  ('api_calls', 'request', 0.0001, 100000, 0.0002),
  ('storage_gb', 'GB', 0.10, 50, 0.15),
  ('documents', 'document', 0.01, 1000, 0.02),
  ('workflows', 'execution', 0.05, 500, 0.10)
) AS r(resource_type, unit_name, price_per_unit, included_units, overage_price)
WHERE p.plan_type = 'professional';

-- Create function to calculate usage costs
CREATE OR REPLACE FUNCTION calculate_usage_cost(
  p_tenant_id UUID,
  p_billing_period_start DATE,
  p_billing_period_end DATE
) RETURNS TABLE (
  resource_type TEXT,
  total_usage INTEGER,
  included_units INTEGER,
  overage_units INTEGER,
  base_cost DECIMAL(10, 2),
  overage_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  WITH subscription_info AS (
    SELECT 
      ts.plan_id,
      ts.id as subscription_id
    FROM tenant_subscriptions ts
    WHERE ts.tenant_id = p_tenant_id
      AND ts.status = 'active'
    LIMIT 1
  ),
  usage_summary AS (
    SELECT 
      ut.resource_type,
      SUM(ut.usage_count)::INTEGER as total_usage
    FROM usage_tracking ut
    WHERE ut.tenant_id = p_tenant_id
      AND ut.usage_date BETWEEN p_billing_period_start AND p_billing_period_end
    GROUP BY ut.resource_type
  )
  SELECT 
    us.resource_type,
    us.total_usage,
    COALESCE(rp.included_units, 0)::INTEGER as included_units,
    GREATEST(0, us.total_usage - COALESCE(rp.included_units, 0))::INTEGER as overage_units,
    (LEAST(us.total_usage, COALESCE(rp.included_units, 0)) * COALESCE(rp.price_per_unit, 0))::DECIMAL(10, 2) as base_cost,
    (GREATEST(0, us.total_usage - COALESCE(rp.included_units, 0)) * COALESCE(rp.overage_price, rp.price_per_unit, 0))::DECIMAL(10, 2) as overage_cost,
    ((LEAST(us.total_usage, COALESCE(rp.included_units, 0)) * COALESCE(rp.price_per_unit, 0)) + 
     (GREATEST(0, us.total_usage - COALESCE(rp.included_units, 0)) * COALESCE(rp.overage_price, rp.price_per_unit, 0)))::DECIMAL(10, 2) as total_cost
  FROM usage_summary us
  LEFT JOIN subscription_info si ON true
  LEFT JOIN resource_pricing rp ON rp.plan_id = si.plan_id AND rp.resource_type = us.resource_type;
END;
$$ LANGUAGE plpgsql;

-- Create function to take pricing snapshot
CREATE OR REPLACE FUNCTION take_pricing_snapshot() RETURNS void AS $$
DECLARE
  v_snapshot_data JSONB;
BEGIN
  -- Compile all pricing data into JSON
  SELECT jsonb_build_object(
    'plans', jsonb_agg(DISTINCT plan_data),
    'tiers', jsonb_agg(DISTINCT tier_data),
    'resources', jsonb_agg(DISTINCT resource_data),
    'snapshot_timestamp', NOW()
  ) INTO v_snapshot_data
  FROM (
    SELECT to_jsonb(p.*) as plan_data, NULL::jsonb as tier_data, NULL::jsonb as resource_data
    FROM pricing_plans p WHERE p.is_active = true
    UNION ALL
    SELECT NULL, to_jsonb(t.*), NULL
    FROM pricing_tiers t
    UNION ALL
    SELECT NULL, NULL, to_jsonb(r.*)
    FROM resource_pricing r
  ) AS all_data;
  
  -- Insert snapshot (ON CONFLICT to handle daily updates)
  INSERT INTO pricing_snapshots (snapshot_date, plan_data)
  VALUES (CURRENT_DATE, v_snapshot_data)
  ON CONFLICT (snapshot_date) 
  DO UPDATE SET 
    plan_data = EXCLUDED.plan_data,
    created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX idx_pricing_tiers_plan_id ON pricing_tiers(plan_id);
CREATE INDEX idx_resource_pricing_plan_id ON resource_pricing(plan_id);
CREATE INDEX idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX idx_usage_tracking_tenant_date ON usage_tracking(tenant_id, usage_date);
CREATE INDEX idx_billing_history_tenant_id ON billing_history(tenant_id);
CREATE INDEX idx_billing_history_status ON billing_history(status);

-- Add triggers for updated_at
CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON pricing_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at BEFORE UPDATE ON tenant_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_history_updated_at BEFORE UPDATE ON billing_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
