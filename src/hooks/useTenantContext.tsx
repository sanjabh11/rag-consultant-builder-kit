
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings: {
    allowedFileTypes: string[];
    maxStorageGB: number;
    maxUsers: number;
    features: string[];
  };
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'suspended' | 'expired';
  };
  white_label_config?: {
    brand_name?: string;
    custom_domain?: string;
    primary_color?: string;
    logo_url?: string;
  };
}

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => void;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserTenants();
    } else {
      // For local mode, create a default tenant
      const defaultTenant: Tenant = {
        id: 'local-tenant',
        name: 'Local Workspace',
        slug: 'local',
        settings: {
          allowedFileTypes: ['pdf', 'txt', 'docx', 'csv'],
          maxStorageGB: 5,
          maxUsers: 1,
          features: ['document-upload', 'local-rag', 'basic-analytics']
        },
        subscription: {
          plan: 'free',
          status: 'active'
        },
        white_label_config: {}
      };
      setCurrentTenant(defaultTenant);
      setTenants([defaultTenant]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tenants from the database
      const { data: tenantUsers, error: fetchError } = await supabase
        .from('tenant_users')
        .select(`
          *,
          tenants:tenant_id (
            id,
            name,
            slug,
            settings,
            subscription_plan,
            subscription_status,
            white_label_config
          )
        `)
        .eq('user_id', user?.id);

      if (fetchError) {
        console.error('Error fetching tenants:', fetchError);
        throw fetchError;
      }

      if (tenantUsers && tenantUsers.length > 0) {
        const mappedTenants = tenantUsers.map(tu => ({
          id: tu.tenants.id,
          name: tu.tenants.name,
          slug: tu.tenants.slug,
          settings: tu.tenants.settings || {
            allowedFileTypes: ['pdf', 'txt', 'docx', 'csv', 'xlsx'],
            maxStorageGB: 10,
            maxUsers: 5,
            features: ['document-upload', 'cloud-rag', 'advanced-analytics', 'cost-tracking']
          },
          subscription: {
            plan: tu.tenants.subscription_plan || 'pro',
            status: tu.tenants.subscription_status || 'active'
          },
          white_label_config: tu.tenants.white_label_config || {}
        }));
        
        setTenants(mappedTenants);
        setCurrentTenant(mappedTenants[0]);
      } else {
        // Create default tenant if none exists
        await createDefaultTenant();
      }
    } catch (err) {
      setError('Failed to fetch tenants');
      console.error('Error fetching tenants:', err);
      
      // Fallback to default tenant
      const fallbackTenant: Tenant = {
        id: user?.id || 'default',
        name: 'My Workspace',
        slug: 'my-workspace',
        settings: {
          allowedFileTypes: ['pdf', 'txt', 'docx', 'csv', 'xlsx'],
          maxStorageGB: 10,
          maxUsers: 5,
          features: ['document-upload', 'cloud-rag', 'advanced-analytics', 'cost-tracking']
        },
        subscription: {
          plan: 'pro',
          status: 'active'
        },
        white_label_config: {}
      };
      
      setCurrentTenant(fallbackTenant);
      setTenants([fallbackTenant]);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTenant = async () => {
    try {
      // Create default tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: `${user?.email?.split('@')[0]}'s Workspace`,
          slug: `${user?.id?.substring(0, 8)}-workspace`,
          subscription_plan: 'pro',
          subscription_status: 'active'
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: tenant.id,
          user_id: user?.id,
          role: 'owner',
          permissions: ['*']
        });

      if (memberError) throw memberError;

      const newTenant: Tenant = {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        settings: tenant.settings || {
          allowedFileTypes: ['pdf', 'txt', 'docx', 'csv', 'xlsx'],
          maxStorageGB: 50,
          maxUsers: 10,
          features: ['document-upload', 'cloud-rag', 'advanced-analytics', 'cost-tracking', 'workflow-automation']
        },
        subscription: {
          plan: tenant.subscription_plan || 'pro',
          status: tenant.subscription_status || 'active'
        },
        white_label_config: tenant.white_label_config || {}
      };

      setCurrentTenant(newTenant);
      setTenants([newTenant]);
    } catch (error) {
      console.error('Error creating default tenant:', error);
      setError('Failed to create default workspace');
    }
  };

  const switchTenant = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      localStorage.setItem('currentTenantId', tenantId);
    }
  };

  return (
    <TenantContext.Provider value={{
      currentTenant,
      tenants,
      switchTenant,
      loading,
      error
    }}>
      {children}
    </TenantContext.Provider>
  );
};
