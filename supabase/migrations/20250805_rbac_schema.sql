-- RBAC Schema for Multi-tenant Platform
-- Implements role-based access control with per-project permissions

-- Create roles enum
CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'project_owner', 'project_editor', 'project_viewer', 'guest');

-- Create permissions enum
CREATE TYPE permission_type AS ENUM (
  'manage_tenant',
  'manage_users',
  'manage_projects',
  'create_project',
  'edit_project',
  'delete_project',
  'view_project',
  'manage_documents',
  'upload_documents',
  'delete_documents',
  'view_documents',
  'manage_workflows',
  'run_workflows',
  'view_workflows',
  'manage_api_keys',
  'view_analytics',
  'manage_billing'
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  role_type user_role NOT NULL,
  is_system BOOLEAN DEFAULT false, -- System roles cannot be deleted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission permission_type NOT NULL,
  resource_type TEXT, -- 'tenant', 'project', 'document', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission)
);

-- Create user_roles table (maps users to roles within tenants/projects)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For temporary access
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, tenant_id, project_id, role_id),
  CHECK (tenant_id IS NOT NULL OR project_id IS NOT NULL) -- Must be scoped to tenant or project
);

-- Create SSO providers configuration table
CREATE TABLE IF NOT EXISTS sso_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('okta', 'azure_ad', 'google', 'github')),
  provider_name TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT, -- Encrypted in production
  issuer_url TEXT,
  authorization_url TEXT,
  token_url TEXT,
  user_info_url TEXT,
  scopes TEXT[] DEFAULT ARRAY['openid', 'email', 'profile'],
  attribute_mapping JSONB DEFAULT '{}', -- Maps SSO attributes to user fields
  default_role_id UUID REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  auto_provision_users BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, provider_type)
);

-- Create SSO sessions table for tracking SSO logins
CREATE TABLE IF NOT EXISTS sso_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
  external_user_id TEXT NOT NULL,
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  id_token TEXT, -- Encrypted
  expires_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default system roles
INSERT INTO roles (name, description, role_type, is_system) VALUES
  ('Super Admin', 'Full system access', 'super_admin', true),
  ('Tenant Admin', 'Full tenant access', 'tenant_admin', true),
  ('Project Owner', 'Full project access', 'project_owner', true),
  ('Project Editor', 'Edit project resources', 'project_editor', true),
  ('Project Viewer', 'View project resources', 'project_viewer', true),
  ('Guest', 'Limited guest access', 'guest', true);

-- Assign permissions to roles
-- Super Admin gets everything
INSERT INTO role_permissions (role_id, permission, resource_type)
SELECT r.id, p.permission, 'all'
FROM roles r
CROSS JOIN unnest(enum_range(NULL::permission_type)) AS p(permission)
WHERE r.role_type = 'super_admin';

-- Tenant Admin permissions
INSERT INTO role_permissions (role_id, permission, resource_type)
SELECT r.id, p.permission, 'tenant'
FROM roles r
CROSS JOIN unnest(ARRAY[
  'manage_tenant'::permission_type,
  'manage_users'::permission_type,
  'manage_projects'::permission_type,
  'create_project'::permission_type,
  'edit_project'::permission_type,
  'delete_project'::permission_type,
  'view_project'::permission_type,
  'manage_documents'::permission_type,
  'manage_workflows'::permission_type,
  'manage_api_keys'::permission_type,
  'view_analytics'::permission_type,
  'manage_billing'::permission_type
]) AS p(permission)
WHERE r.role_type = 'tenant_admin';

-- Project Owner permissions
INSERT INTO role_permissions (role_id, permission, resource_type)
SELECT r.id, p.permission, 'project'
FROM roles r
CROSS JOIN unnest(ARRAY[
  'edit_project'::permission_type,
  'delete_project'::permission_type,
  'view_project'::permission_type,
  'manage_documents'::permission_type,
  'upload_documents'::permission_type,
  'delete_documents'::permission_type,
  'view_documents'::permission_type,
  'manage_workflows'::permission_type,
  'run_workflows'::permission_type,
  'view_workflows'::permission_type,
  'manage_api_keys'::permission_type,
  'view_analytics'::permission_type
]) AS p(permission)
WHERE r.role_type = 'project_owner';

-- Project Editor permissions
INSERT INTO role_permissions (role_id, permission, resource_type)
SELECT r.id, p.permission, 'project'
FROM roles r
CROSS JOIN unnest(ARRAY[
  'edit_project'::permission_type,
  'view_project'::permission_type,
  'upload_documents'::permission_type,
  'view_documents'::permission_type,
  'run_workflows'::permission_type,
  'view_workflows'::permission_type
]) AS p(permission)
WHERE r.role_type = 'project_editor';

-- Project Viewer permissions
INSERT INTO role_permissions (role_id, permission, resource_type)
SELECT r.id, p.permission, 'project'
FROM roles r
CROSS JOIN unnest(ARRAY[
  'view_project'::permission_type,
  'view_documents'::permission_type,
  'view_workflows'::permission_type
]) AS p(permission)
WHERE r.role_type = 'project_viewer';

-- Guest permissions
INSERT INTO role_permissions (role_id, permission, resource_type)
SELECT r.id, p.permission, 'project'
FROM roles r
CROSS JOIN unnest(ARRAY[
  'view_project'::permission_type,
  'view_documents'::permission_type
]) AS p(permission)
WHERE r.role_type = 'guest';

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_permission permission_type,
  p_tenant_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    WHERE ur.user_id = p_user_id
      AND rp.permission = p_permission
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND (
        -- Check tenant-level permission
        (p_tenant_id IS NOT NULL AND ur.tenant_id = p_tenant_id)
        OR
        -- Check project-level permission
        (p_project_id IS NOT NULL AND ur.project_id = p_project_id)
        OR
        -- Check if user is super admin
        EXISTS (
          SELECT 1 FROM roles r
          WHERE r.id = ur.role_id AND r.role_type = 'super_admin'
        )
      )
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for role-based access
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Projects RLS policy
CREATE POLICY project_access ON projects
  FOR ALL
  USING (
    check_user_permission(auth.uid(), 'view_project'::permission_type, tenant_id, id)
  );

-- Documents RLS policy
CREATE POLICY document_access ON documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = documents.project_id
        AND check_user_permission(auth.uid(), 'view_documents'::permission_type, p.tenant_id, p.id)
    )
  );

-- Workflows RLS policy (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
    EXECUTE 'CREATE POLICY workflow_access ON workflows
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM projects p
          WHERE p.id = workflows.project_id
            AND check_user_permission(auth.uid(), ''view_workflows''::permission_type, p.tenant_id, p.id)
        )
      )';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX idx_user_roles_project_id ON user_roles(project_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_sso_sessions_user_id ON sso_sessions(user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sso_providers_updated_at BEFORE UPDATE ON sso_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
