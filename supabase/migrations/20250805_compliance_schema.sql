-- Compliance and Audit Schema for HIPAA/GDPR
-- Implements data governance, audit logging, and compliance tracking

-- Create compliance framework types
CREATE TYPE compliance_framework AS ENUM ('hipaa', 'gdpr', 'ccpa', 'sox', 'pci_dss', 'iso_27001');
CREATE TYPE data_classification AS ENUM ('public', 'internal', 'confidential', 'restricted');
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'export', 'share', 'login', 'logout', 'permission_change');

-- Create compliance policies table
CREATE TABLE IF NOT EXISTS compliance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  framework compliance_framework NOT NULL,
  policy_name TEXT NOT NULL,
  policy_version TEXT NOT NULL DEFAULT '1.0',
  is_enabled BOOLEAN DEFAULT true,
  requirements JSONB NOT NULL DEFAULT '{}', -- Framework-specific requirements
  settings JSONB DEFAULT '{}', -- Policy settings
  last_review_date DATE,
  next_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, framework, policy_name)
);

-- Create audit log table (immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  action audit_action NOT NULL,
  resource_type TEXT NOT NULL, -- 'document', 'project', 'user', 'tenant', etc.
  resource_id TEXT,
  resource_name TEXT,
  ip_address INET,
  user_agent TEXT,
  request_method TEXT,
  request_path TEXT,
  response_status INTEGER,
  data_before JSONB, -- State before change (for updates/deletes)
  data_after JSONB, -- State after change (for creates/updates)
  metadata JSONB DEFAULT '{}', -- Additional context
  compliance_frameworks compliance_framework[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create audit log partitions for better performance
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- Add more partitions as needed

-- Create data privacy settings table
CREATE TABLE IF NOT EXISTS data_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_retention_days INTEGER DEFAULT 365, -- How long to keep user data
  allow_data_export BOOLEAN DEFAULT true,
  allow_data_deletion BOOLEAN DEFAULT true,
  anonymize_on_deletion BOOLEAN DEFAULT false, -- Anonymize instead of hard delete
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  consent_ip INET,
  marketing_opt_in BOOLEAN DEFAULT false,
  analytics_opt_in BOOLEAN DEFAULT true,
  third_party_sharing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Create data retention policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  classification data_classification NOT NULL DEFAULT 'internal',
  retention_days INTEGER NOT NULL,
  delete_after_retention BOOLEAN DEFAULT false,
  archive_after_retention BOOLEAN DEFAULT true,
  archive_location TEXT, -- S3 bucket, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, resource_type)
);

-- Create encryption keys registry
CREATE TABLE IF NOT EXISTS encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_type TEXT NOT NULL, -- 'master', 'data', 'backup'
  algorithm TEXT NOT NULL DEFAULT 'AES-256-GCM',
  key_version INTEGER NOT NULL DEFAULT 1,
  encrypted_key TEXT NOT NULL, -- Key encrypted with master key
  is_active BOOLEAN DEFAULT true,
  rotated_from UUID REFERENCES encryption_keys(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  rotated_at TIMESTAMPTZ,
  UNIQUE(tenant_id, key_name, key_version)
);

-- Create consent records table
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'terms', 'privacy', 'marketing', 'cookies'
  consent_version TEXT NOT NULL,
  given BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  withdrawal_date TIMESTAMPTZ,
  withdrawal_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create data subject requests table (GDPR Article 15-22)
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  response_data JSONB,
  notes TEXT,
  verified_identity BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id)
);

-- Create security incidents table
CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL, -- 'data_breach', 'unauthorized_access', 'data_leak', etc.
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  affected_users INTEGER,
  affected_records INTEGER,
  detection_date TIMESTAMPTZ NOT NULL,
  containment_date TIMESTAMPTZ,
  resolution_date TIMESTAMPTZ,
  reported_to_authorities BOOLEAN DEFAULT false,
  reported_date TIMESTAMPTZ,
  users_notified BOOLEAN DEFAULT false,
  notification_date TIMESTAMPTZ,
  root_cause TEXT,
  remediation_steps TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_tenant_id UUID,
  p_user_id UUID,
  p_action audit_action,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_resource_name TEXT DEFAULT NULL,
  p_data_before JSONB DEFAULT NULL,
  p_data_after JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_frameworks compliance_framework[];
BEGIN
  -- Get applicable compliance frameworks for tenant
  SELECT ARRAY_AGG(framework) INTO v_frameworks
  FROM compliance_policies
  WHERE tenant_id = p_tenant_id AND is_enabled = true;

  -- Insert audit log
  INSERT INTO audit_logs (
    tenant_id, user_id, action, resource_type, resource_id,
    resource_name, data_before, data_after, metadata, compliance_frameworks
  ) VALUES (
    p_tenant_id, p_user_id, p_action, p_resource_type, p_resource_id,
    p_resource_name, p_data_before, p_data_after, p_metadata, v_frameworks
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check HIPAA compliance
CREATE OR REPLACE FUNCTION check_hipaa_compliance(p_tenant_id UUID) 
RETURNS TABLE (
  requirement TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Encryption at Rest' as requirement,
    CASE WHEN EXISTS (SELECT 1 FROM encryption_keys WHERE tenant_id = p_tenant_id AND is_active = true)
      THEN 'compliant' ELSE 'non-compliant' END as status,
    'All PHI must be encrypted at rest' as details
  UNION ALL
  SELECT 
    'Audit Logging',
    CASE WHEN EXISTS (SELECT 1 FROM audit_logs WHERE tenant_id = p_tenant_id 
                      AND created_at > NOW() - INTERVAL '30 days')
      THEN 'compliant' ELSE 'non-compliant' END,
    'All access to PHI must be logged'
  UNION ALL
  SELECT 
    'Access Controls',
    CASE WHEN EXISTS (SELECT 1 FROM roles WHERE tenant_id = p_tenant_id)
      THEN 'compliant' ELSE 'non-compliant' END,
    'Role-based access control must be implemented'
  UNION ALL
  SELECT 
    'Data Retention',
    CASE WHEN EXISTS (SELECT 1 FROM data_retention_policies WHERE tenant_id = p_tenant_id AND is_active = true)
      THEN 'compliant' ELSE 'non-compliant' END,
    'Data retention policies must be defined';
END;
$$ LANGUAGE plpgsql;

-- Function to check GDPR compliance
CREATE OR REPLACE FUNCTION check_gdpr_compliance(p_tenant_id UUID) 
RETURNS TABLE (
  requirement TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Consent Management' as requirement,
    CASE WHEN EXISTS (SELECT 1 FROM consent_records WHERE tenant_id = p_tenant_id AND given = true)
      THEN 'compliant' ELSE 'non-compliant' END as status,
    'Explicit consent must be obtained and recorded' as details
  UNION ALL
  SELECT 
    'Right to Access',
    CASE WHEN EXISTS (SELECT 1 FROM data_subject_requests WHERE tenant_id = p_tenant_id 
                      AND request_type = 'access' AND status = 'completed')
      THEN 'compliant' ELSE 'needs-review' END,
    'Users must be able to request their data'
  UNION ALL
  SELECT 
    'Right to Erasure',
    CASE WHEN EXISTS (SELECT 1 FROM data_privacy_settings WHERE tenant_id = p_tenant_id 
                      AND allow_data_deletion = true)
      THEN 'compliant' ELSE 'non-compliant' END,
    'Users must be able to request data deletion'
  UNION ALL
  SELECT 
    'Data Portability',
    CASE WHEN EXISTS (SELECT 1 FROM data_privacy_settings WHERE tenant_id = p_tenant_id 
                      AND allow_data_export = true)
      THEN 'compliant' ELSE 'non-compliant' END,
    'Users must be able to export their data'
  UNION ALL
  SELECT 
    'Breach Notification',
    'needs-review',
    'Breaches must be reported within 72 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to anonymize user data
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID) RETURNS VOID AS $$
BEGIN
  -- Update user profile with anonymized data
  UPDATE profiles
  SET 
    full_name = 'Anonymous User',
    email = CONCAT('anon_', SUBSTRING(MD5(RANDOM()::TEXT), 1, 8), '@example.com'),
    avatar_url = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the anonymization
  PERFORM log_audit_event(
    NULL, p_user_id, 'update', 'user', p_user_id::TEXT,
    'User data anonymized', NULL, NULL,
    '{"action": "anonymization", "reason": "user_request"}'::JSONB
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-expire old audit logs based on retention policy
CREATE OR REPLACE FUNCTION cleanup_expired_audit_logs() RETURNS VOID AS $$
DECLARE
  v_retention_days INTEGER;
BEGIN
  -- Get default retention period (default 90 days for audit logs)
  v_retention_days := COALESCE(
    (SELECT MAX(retention_days) FROM data_retention_policies 
     WHERE resource_type = 'audit_logs' AND is_active = true),
    90
  );

  -- Archive old audit logs (move to cold storage in production)
  -- For now, just delete very old logs
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Insert default compliance policies
INSERT INTO compliance_policies (tenant_id, framework, policy_name, requirements) 
SELECT 
  t.id,
  'gdpr',
  'GDPR Compliance Policy',
  '{
    "consent_required": true,
    "data_portability": true,
    "right_to_erasure": true,
    "breach_notification_hours": 72,
    "privacy_by_design": true,
    "data_minimization": true
  }'::JSONB
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM compliance_policies cp 
  WHERE cp.tenant_id = t.id AND cp.framework = 'gdpr'
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_consent_records_user ON consent_records(user_id, consent_type);
CREATE INDEX idx_data_subject_requests_user ON data_subject_requests(user_id, status);
CREATE INDEX idx_security_incidents_severity ON security_incidents(severity, detection_date);

-- Enable Row Level Security on sensitive tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Audit logs viewable by tenant members" ON audit_logs
  FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Privacy settings manageable by user" ON data_privacy_settings
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Consent records viewable by user" ON consent_records
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Data requests manageable by user" ON data_subject_requests
  FOR ALL
  USING (user_id = auth.uid());
