
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useEnterpriseAuth } from '@/hooks/useEnterpriseAuth';
import { useCostTracking } from '@/hooks/useCostTracking';
import RAGChatInterface from '@/components/RAGChatInterface';
import DocumentManager from '@/components/DocumentManager';
import CostTrackingDashboard from '@/components/CostTrackingDashboard';
import EnhancedRAGInterface from '@/components/EnhancedRAGInterface';
import ProjectCreationWizard from '@/components/ProjectCreationWizard';
import { 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Crown,
  Workflow,
  Building,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { currentTenant, tenantMemberships, hasPermission } = useEnterpriseAuth();
  const { currentCosts, usageMetrics, costAlerts } = useCostTracking();
  const [activeProject, setActiveProject] = useState('default');
  const [showProjectWizard, setShowProjectWizard] = useState(false);

  // Show project creation wizard if no tenant
  if (!currentTenant && user) {
    return <ProjectCreationWizard onComplete={() => window.location.reload()} />;
  }

  const isEnterpriseTenant = currentTenant?.subscription_plan === 'enterprise';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {isEnterpriseTenant && <Crown className="h-8 w-8 text-yellow-500" />}
            AI Platform Dashboard
          </h1>
          {currentTenant && (
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <Building className="h-4 w-4" />
              {currentTenant.name}
              <Badge variant={
                currentTenant.subscription_plan === 'enterprise' ? 'destructive' :
                currentTenant.subscription_plan === 'pro' ? 'default' : 'secondary'
              }>
                {currentTenant.subscription_plan}
              </Badge>
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          {isEnterpriseTenant && (
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/enterprise'}
            >
              <Crown className="h-4 w-4 mr-2" />
              Enterprise Console
            </Button>
          )}
          <Button onClick={() => setShowProjectWizard(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Enterprise Overview Cards */}
      {isEnterpriseTenant && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Costs</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${currentCosts.total.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {costAlerts.length > 0 ? `${costAlerts.length} alerts` : 'Within budget'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageMetrics.documentsProcessed}</div>
              <p className="text-xs text-muted-foreground">
                {usageMetrics.storageUsed.toFixed(2)} GB used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageMetrics.queriesExecuted}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenantMemberships.length}</div>
              <p className="text-xs text-muted-foreground">
                Active memberships
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          {isEnterpriseTenant && <TabsTrigger value="enhanced-rag">Enhanced RAG</TabsTrigger>}
          {isEnterpriseTenant && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <RAGChatInterface projectId={activeProject} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentManager projectId={activeProject} />
        </TabsContent>

        {isEnterpriseTenant && (
          <TabsContent value="enhanced-rag" className="space-y-6">
            <EnhancedRAGInterface projectId={activeProject} />
          </TabsContent>
        )}

        {isEnterpriseTenant && (
          <TabsContent value="analytics" className="space-y-6">
            <CostTrackingDashboard />
          </TabsContent>
        )}

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Active Project</label>
                  <p className="text-sm text-gray-600">{activeProject}</p>
                </div>
                {currentTenant && (
                  <div>
                    <label className="text-sm font-medium">Workspace</label>
                    <p className="text-sm text-gray-600">{currentTenant.name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Subscription</label>
                  <p className="text-sm">
                    <Badge variant={
                      currentTenant?.subscription_plan === 'enterprise' ? 'destructive' :
                      currentTenant?.subscription_plan === 'pro' ? 'default' : 'secondary'
                    }>
                      {currentTenant?.subscription_plan || 'Free'}
                    </Badge>
                  </p>
                </div>
                {isEnterpriseTenant && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/workflows'}
                    className="w-full"
                  >
                    <Workflow className="h-4 w-4 mr-2" />
                    Manage Workflows
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">User ID</label>
                  <p className="text-sm text-gray-600 font-mono">
                    {user?.id?.substring(0, 8)}...
                  </p>
                </div>
                {currentTenant && hasPermission('tenant', 'read') && (
                  <div>
                    <label className="text-sm font-medium">Permissions</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tenantMemberships
                        .find(m => m.tenant_id === currentTenant.id)
                        ?.permissions.slice(0, 3)
                        .map((perm, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {perm === '*' ? 'All' : perm}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Project Creation Wizard Modal */}
      {showProjectWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <ProjectCreationWizard 
              onComplete={() => {
                setShowProjectWizard(false);
                window.location.reload();
              }}
              onCancel={() => setShowProjectWizard(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
