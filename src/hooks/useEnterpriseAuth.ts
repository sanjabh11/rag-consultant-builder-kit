
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'user' | 'viewer';
  permissions: string[];
  tenant: {
    id: string;
    name: string;
    slug: string;
    subscription_plan: string;
    white_label_config: Record<string, any>;
  };
}

interface Permission {
  resource: string;
  action: string;
}

export const useEnterpriseAuth = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tenantMemberships, setTenantMemberships] = useState<TenantUser[]>([]);
  const [currentTenant, setCurrentTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTenantMemberships();
    } else {
      setTenantMemberships([]);
      setCurrentTenant(null);
      setLoading(false);
    }
  }, [user]);

  const loadTenantMemberships = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tenant_users')
        .select(`
          *,
          tenants:tenant_id (
            id,
            name,
            slug,
            subscription_plan,
            white_label_config
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const memberships = data?.map(item => ({
        ...item,
        tenant: item.tenants
      })) || [];

      setTenantMemberships(memberships);
      
      // Set current tenant to first membership or create default
      if (memberships.length > 0) {
        setCurrentTenant(memberships[0].tenant_id);
      } else {
        await createDefaultTenant();
      }
    } catch (error) {
      console.error('Error loading tenant memberships:', error);
      toast({
        title: "Error",
        description: "Failed to load workspace information",
        variant: "destructive",
      });
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
          subscription_plan: 'free'
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

      setCurrentTenant(tenant.id);
      await loadTenantMemberships();
    } catch (error) {
      console.error('Error creating default tenant:', error);
      toast({
        title: "Error", 
        description: "Failed to create default workspace",
        variant: "destructive",
      });
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!currentTenant || !tenantMemberships.length) return false;

    const membership = tenantMemberships.find(m => m.tenant_id === currentTenant);
    if (!membership) return false;

    // Owners and admins have all permissions
    if (['owner', 'admin'].includes(membership.role)) return true;

    // Check specific permissions
    return membership.permissions.includes('*') || 
           membership.permissions.includes(`${resource}:${action}`) ||
           membership.permissions.includes(`${resource}:*`);
  };

  const switchTenant = (tenantId: string) => {
    const membership = tenantMemberships.find(m => m.tenant_id === tenantId);
    if (membership) {
      setCurrentTenant(tenantId);
      localStorage.setItem('currentTenantId', tenantId);
    }
  };

  const getCurrentTenant = () => {
    return tenantMemberships.find(m => m.tenant_id === currentTenant)?.tenant;
  };

  const inviteUser = async (email: string, role: 'admin' | 'user' | 'viewer', permissions: string[] = []) => {
    if (!hasPermission('users', 'invite')) {
      throw new Error('Insufficient permissions to invite users');
    }

    try {
      const { data, error } = await supabase.functions.invoke('invite-tenant-user', {
        body: {
          tenant_id: currentTenant,
          email,
          role,
          permissions
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  };

  return {
    tenantMemberships,
    currentTenant: getCurrentTenant(),
    loading,
    hasPermission,
    switchTenant,
    inviteUser,
    refreshMemberships: loadTenantMemberships
  };
};
