import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'super_admin' | 'tenant_admin' | 'project_owner' | 'project_editor' | 'project_viewer' | 'guest';

export type Permission = 
  | 'manage_tenant'
  | 'manage_users'
  | 'manage_projects'
  | 'create_project'
  | 'edit_project'
  | 'delete_project'
  | 'view_project'
  | 'manage_documents'
  | 'upload_documents'
  | 'delete_documents'
  | 'view_documents'
  | 'manage_workflows'
  | 'run_workflows'
  | 'view_workflows'
  | 'manage_api_keys'
  | 'view_analytics'
  | 'manage_billing';

interface RolePermission {
  id: string;
  role_id: string;
  permission: Permission;
  resource_type: string;
}

interface UserRoleAssignment {
  id: string;
  user_id: string;
  tenant_id?: string;
  project_id?: string;
  role_id: string;
  role: {
    id: string;
    name: string;
    role_type: UserRole;
    permissions: RolePermission[];
  };
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

interface RBACContextType {
  userRoles: UserRoleAssignment[];
  permissions: Set<Permission>;
  loading: boolean;
  hasPermission: (permission: Permission, options?: { tenantId?: string; projectId?: string }) => boolean;
  hasRole: (role: UserRole, options?: { tenantId?: string; projectId?: string }) => boolean;
  canAccessProject: (projectId: string) => boolean;
  canAccessTenant: (tenantId: string) => boolean;
  assignRole: (userId: string, roleType: UserRole, scope: { tenantId?: string; projectId?: string }) => Promise<void>;
  revokeRole: (userRoleId: string) => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRoles, setUserRoles] = useState<UserRoleAssignment[]>([]);
  const [permissions, setPermissions] = useState<Set<Permission>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch user roles and permissions
  const fetchUserRoles = async () => {
    if (!user) {
      setUserRoles([]);
      setPermissions(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch user roles with permissions
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          role:roles (
            id,
            name,
            role_type,
            permissions:role_permissions (*)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      if (roles) {
        setUserRoles(roles as UserRoleAssignment[]);
        
        // Extract all permissions
        const allPermissions = new Set<Permission>();
        roles.forEach(role => {
          if (role.role?.permissions) {
            role.role.permissions.forEach(perm => {
              allPermissions.add(perm.permission);
            });
          }
        });
        setPermissions(allPermissions);
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast({
        title: "Error loading permissions",
        description: "Could not load your access permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  // Check if user has a specific permission
  const hasPermission = (
    permission: Permission,
    options?: { tenantId?: string; projectId?: string }
  ): boolean => {
    // Super admins have all permissions
    if (userRoles.some(r => r.role?.role_type === 'super_admin')) {
      return true;
    }

    // Check scoped permissions
    return userRoles.some(roleAssignment => {
      // Check scope
      if (options?.tenantId && roleAssignment.tenant_id !== options.tenantId) {
        return false;
      }
      if (options?.projectId && roleAssignment.project_id !== options.projectId) {
        return false;
      }

      // Check permission
      return roleAssignment.role?.permissions?.some(p => p.permission === permission) || false;
    });
  };

  // Check if user has a specific role
  const hasRole = (
    role: UserRole,
    options?: { tenantId?: string; projectId?: string }
  ): boolean => {
    return userRoles.some(roleAssignment => {
      // Check role type
      if (roleAssignment.role?.role_type !== role) {
        return false;
      }

      // Check scope
      if (options?.tenantId && roleAssignment.tenant_id !== options.tenantId) {
        return false;
      }
      if (options?.projectId && roleAssignment.project_id !== options.projectId) {
        return false;
      }

      return true;
    });
  };

  // Check if user can access a specific project
  const canAccessProject = (projectId: string): boolean => {
    return hasPermission('view_project', { projectId });
  };

  // Check if user can access a specific tenant
  const canAccessTenant = (tenantId: string): boolean => {
    return userRoles.some(r => 
      r.tenant_id === tenantId || 
      r.role?.role_type === 'super_admin'
    );
  };

  // Assign a role to a user
  const assignRole = async (
    userId: string,
    roleType: UserRole,
    scope: { tenantId?: string; projectId?: string }
  ) => {
    try {
      // First, get the role ID
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_type', roleType)
        .single();

      if (roleError) throw roleError;

      // Assign the role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: role.id,
          tenant_id: scope.tenantId,
          project_id: scope.projectId,
          granted_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Role assigned",
        description: `Successfully assigned ${roleType} role`,
      });

      await fetchUserRoles();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error assigning role",
        description: "Could not assign the requested role",
        variant: "destructive",
      });
    }
  };

  // Revoke a role from a user
  const revokeRole = async (userRoleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', userRoleId);

      if (error) throw error;

      toast({
        title: "Role revoked",
        description: "Successfully revoked user role",
      });

      await fetchUserRoles();
    } catch (error) {
      console.error('Error revoking role:', error);
      toast({
        title: "Error revoking role",
        description: "Could not revoke the role",
        variant: "destructive",
      });
    }
  };

  const value = {
    userRoles,
    permissions,
    loading,
    hasPermission,
    hasRole,
    canAccessProject,
    canAccessTenant,
    assignRole,
    revokeRole,
    refreshRoles: fetchUserRoles,
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

// Permission guard component
interface PermissionGuardProps {
  permission: Permission;
  tenantId?: string;
  projectId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  tenantId,
  projectId,
  fallback = null,
  children,
}) => {
  const { hasPermission } = useRBAC();

  if (!hasPermission(permission, { tenantId, projectId })) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Role guard component
interface RoleGuardProps {
  role: UserRole;
  tenantId?: string;
  projectId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  role,
  tenantId,
  projectId,
  fallback = null,
  children,
}) => {
  const { hasRole } = useRBAC();

  if (!hasRole(role, { tenantId, projectId })) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
