
-- Create enterprise tables for RBAC, multi-tenancy, and workflow automation
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  subdomain TEXT,
  settings JSONB DEFAULT '{"allowedFileTypes": ["pdf", "txt", "docx", "csv"], "maxStorageGB": 10, "maxUsers": 5, "features": ["document-upload", "cloud-rag", "advanced-analytics"]}',
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'expired')),
  white_label_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenant_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('owner', 'admin', 'user', 'viewer')),
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  definition JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  triggers JSONB DEFAULT '[]',
  actions JSONB DEFAULT '[]',
  schedule JSONB,
  execution_stats JSONB DEFAULT '{"total_runs": 0, "successful_runs": 0, "failed_runs": 0}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  input_data JSONB,
  output_data JSONB,
  error_details JSONB,
  execution_time_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.cost_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  cost_amount DECIMAL(10,4) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  billing_period DATE NOT NULL,
  usage_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.llm_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'llama', 'gemini', 'local')),
  model TEXT NOT NULL,
  endpoint_url TEXT,
  api_key_encrypted TEXT,
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants
CREATE POLICY "Users can view tenants they belong to" ON public.tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenant_users 
      WHERE tenant_users.tenant_id = tenants.id 
      AND tenant_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant owners can manage their tenants" ON public.tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tenant_users 
      WHERE tenant_users.tenant_id = tenants.id 
      AND tenant_users.user_id = auth.uid()
      AND tenant_users.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for tenant_users
CREATE POLICY "Users can view tenant memberships" ON public.tenant_users
  FOR SELECT USING (user_id = auth.uid() OR tenant_id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Tenant admins can manage users" ON public.tenant_users
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for workflows
CREATE POLICY "Users can access workflows in their tenants" ON public.workflows
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for workflow_executions
CREATE POLICY "Users can access executions in their tenants" ON public.workflow_executions
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for cost_tracking
CREATE POLICY "Users can view costs for their tenants" ON public.cost_tracking
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for llm_configurations
CREATE POLICY "Users can manage LLM configs in their tenants" ON public.llm_configurations
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON public.tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON public.tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_tenant_id ON public.workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_tenant_id ON public.cost_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_billing_period ON public.cost_tracking(billing_period);

-- Insert default tenant for existing users
INSERT INTO public.tenants (name, slug, settings, subscription_plan)
VALUES (
  'Default Workspace',
  'default',
  '{"allowedFileTypes": ["pdf", "txt", "docx", "csv", "xlsx"], "maxStorageGB": 50, "maxUsers": 10, "features": ["document-upload", "cloud-rag", "advanced-analytics", "cost-tracking", "workflow-automation"]}',
  'enterprise'
) ON CONFLICT DO NOTHING;
