
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnterpriseAuth } from '@/hooks/useEnterpriseAuth';
import { useTemporalWorkflows } from '@/hooks/useTemporalWorkflows';
import { useCostTracking } from '@/hooks/useCostTracking';
import CostTrackingDashboard from '@/components/CostTrackingDashboard';
import TenantConfiguration from '@/components/TenantConfiguration';
import LLMConfiguration from '@/components/LLMConfiguration';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Workflow,
  Shield,
  Globe,
  DollarSign,
  Activity,
  Crown,
  Building
} from 'lucide-react';

const EnterpriseConsole = () => {
  const { currentTenant, tenantMemberships, hasPermission, switchTenant } = useEnterpriseAuth();
  const { workflows, executions, loadWorkflows, loadExecutions } = useTemporalWorkflows();
  const { currentCosts, usageMetrics, costAlerts, budgetLimit } = useCostTracking();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, [currentTenant]);

  if (!currentTenant) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No Workspace Access</h2>
          <p className="text-gray-600">You need to be part of a workspace to access the Enterprise Console.</p>
        </div>
      </div>
    );
  }

  const getSubscriptionBadge = (plan: string) => {
    const variants = {
      free: 'secondary',
      pro: 'default', 
      enterprise: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[plan as keyof typeof variants] || 'secondary'}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Enterprise Console
          </h1>
          <p className="text-gray-600 mt-1">
            {currentTenant.name} {getSubscriptionBadge(currentTenant.subscription_plan)}
          </p>
        </div>
        
        {tenantMemberships.length > 1 && (
          <Select
            value={currentTenant.id}
            onValueChange={switchTenant}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Switch workspace" />
            </SelectTrigger>
            <SelectContent>
              {tenantMemberships.map((membership) => (
                <SelectItem key={membership.tenant.id} value={membership.tenant.id}>
                  {membership.tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.filter(w => w.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {workflows.length} total workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentCosts.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((currentCosts.total / budgetLimit) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageMetrics.documentsProcessed}</div>
            <p className="text-xs text-muted-foreground">
              {usageMetrics.queriesExecuted} queries this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenantMemberships.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all workspaces
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users & RBAC</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="white-label">White Label</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Workflow Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {executions.slice(0, 5).map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">Execution {execution.id.substring(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(execution.started_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={
                        execution.status === 'completed' ? 'default' :
                        execution.status === 'failed' ? 'destructive' :
                        execution.status === 'running' ? 'secondary' : 'outline'
                      }>
                        {execution.status}
                      </Badge>
                    </div>
                  ))}
                  {executions.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No recent executions</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="p-3 border rounded bg-yellow-50">
                      <p className="font-medium text-yellow-800">{alert.message}</p>
                      <p className="text-sm text-yellow-600">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {costAlerts.length === 0 && (
                    <div className="text-center text-green-600 py-4">
                      <Shield className="h-8 w-8 mx-auto mb-2" />
                      All systems normal
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Workflow Management</h2>
            <Button onClick={() => window.location.href = '/workflows'}>
              <Workflow className="h-4 w-4 mr-2" />
              Open Workflow Builder
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Triggers:</strong> {workflow.definition.triggers?.length || 0}
                    </p>
                    <p className="text-sm">
                      <strong>Actions:</strong> {workflow.definition.actions?.length || 0}
                    </p>
                    {workflow.schedule && (
                      <p className="text-sm">
                        <strong>Schedule:</strong> {workflow.schedule.expression}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <CostTrackingDashboard />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members & Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenantMemberships.map((membership) => (
                  <div key={membership.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">User {membership.user_id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-600">Role: {membership.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge>{membership.role}</Badge>
                      {membership.permissions.includes('*') && (
                        <Badge variant="destructive">All Permissions</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
          <div className="space-y-6">
            <TenantConfiguration />
            <LLMConfiguration />
          </div>
        </TabsContent>

        <TabsContent value="white-label" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                White Label Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Brand Name</label>
                  <Input 
                    placeholder="Your Company Name"
                    defaultValue={currentTenant.white_label_config?.brand_name || ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Custom Domain</label>
                  <Input 
                    placeholder="yourdomain.com"
                    defaultValue={currentTenant.white_label_config?.custom_domain || ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <Input 
                    type="color"
                    defaultValue={currentTenant.white_label_config?.primary_color || '#3b82f6'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Logo URL</label>
                  <Input 
                    placeholder="https://your-logo-url.com/logo.png"
                    defaultValue={currentTenant.white_label_config?.logo_url || ''}
                  />
                </div>
              </div>
              <Button>Save White Label Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseConsole;
