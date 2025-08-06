
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
        }
      };
      setCurrentTenant(defaultTenant);
      setTenants([defaultTenant]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserTenants = async () => {
    try {
      setLoading(true);
      // Query tenants table for real tenant data
      if (!user) {
        setCurrentTenant(null);
        setTenants([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      if (data && data.length > 0) {
        setCurrentTenant(data[0]);
        setTenants(data);
      } else {
        setCurrentTenant(null);
        setTenants([]);
      }
    } catch (err) {
      setError('Failed to fetch tenants');
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
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
