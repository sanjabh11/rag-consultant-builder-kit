
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Users, 
  Settings, 
  Shield, 
  Database,
  Check,
  AlertCircle
} from 'lucide-react';
import { useTenant } from '@/hooks/useTenantContext';

const MultiTenantSetup: React.FC = () => {
  const { currentTenant, tenants, switchTenant } = useTenant();
  const [isCreating, setIsCreating] = useState(false);
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    slug: '',
    plan: 'free' as 'free' | 'pro' | 'enterprise',
    maxUsers: 1,
    maxStorageGB: 5,
    features: [] as string[]
  });

  const availableFeatures = [
    { id: 'document-upload', name: 'Document Upload', free: true },
    { id: 'local-rag', name: 'Local RAG', free: true },
    { id: 'cloud-rag', name: 'Cloud RAG', free: false },
    { id: 'advanced-analytics', name: 'Advanced Analytics', free: false },
    { id: 'cost-tracking', name: 'Cost Tracking', free: false },
    { id: 'multi-user', name: 'Multi-User Access', free: false },
    { id: 'api-access', name: 'API Access', free: false },
    { id: 'custom-branding', name: 'Custom Branding', free: false }
  ];

  const planLimits = {
    free: { maxUsers: 1, maxStorageGB: 5, features: ['document-upload', 'local-rag', 'basic-analytics'] },
    pro: { maxUsers: 10, maxStorageGB: 50, features: ['document-upload', 'local-rag', 'cloud-rag', 'advanced-analytics', 'cost-tracking'] },
    enterprise: { maxUsers: 100, maxStorageGB: 500, features: availableFeatures.map(f => f.id) }
  };

  const handleCreateTenant = () => {
    setIsCreating(true);
    // Simulate tenant creation
    setTimeout(() => {
      setIsCreating(false);
      setNewTenantData({
        name: '',
        slug: '',
        plan: 'free',
        maxUsers: 1,
        maxStorageGB: 5,
        features: []
      });
    }, 2000);
  };

  const handlePlanChange = (plan: 'free' | 'pro' | 'enterprise') => {
    const limits = planLimits[plan];
    setNewTenantData(prev => ({
      ...prev,
      plan,
      maxUsers: limits.maxUsers,
      maxStorageGB: limits.maxStorageGB,
      features: limits.features
    }));
  };

  const toggleFeature = (featureId: string) => {
    setNewTenantData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Tenant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Current Workspace
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentTenant ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{currentTenant.name}</h3>
                  <p className="text-sm text-gray-600">/{currentTenant.slug}</p>
                </div>
                <Badge className={getPlanColor(currentTenant.subscription.plan)}>
                  {currentTenant.subscription.plan.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <div className="font-semibold">{currentTenant.settings.maxUsers}</div>
                  <div className="text-xs text-gray-600">Max Users</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Database className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <div className="font-semibold">{currentTenant.settings.maxStorageGB} GB</div>
                  <div className="text-xs text-gray-600">Storage</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Settings className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <div className="font-semibold">{currentTenant.settings.features.length}</div>
                  <div className="text-xs text-gray-600">Features</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Shield className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                  <div className="font-semibold">{currentTenant.subscription.status}</div>
                  <div className="text-xs text-gray-600">Status</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Active Features</h4>
                <div className="flex flex-wrap gap-2">
                  {currentTenant.settings.features.map(feature => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {availableFeatures.find(f => f.id === feature)?.name || feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No workspace selected</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Workspace Selector */}
      {tenants.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Switch Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={currentTenant?.id} onValueChange={switchTenant}>
              <SelectTrigger>
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map(tenant => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    <div className="flex items-center gap-2">
                      <span>{tenant.name}</span>
                      <Badge className={getPlanColor(tenant.subscription.plan)} variant="outline">
                        {tenant.subscription.plan}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Create New Workspace */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={newTenantData.name}
                onChange={(e) => setNewTenantData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Workspace"
              />
            </div>
            <div>
              <Label htmlFor="workspace-slug">Workspace Slug</Label>
              <Input
                id="workspace-slug"
                value={newTenantData.slug}
                onChange={(e) => setNewTenantData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="my-workspace"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="plan-select">Subscription Plan</Label>
            <Select value={newTenantData.plan} onValueChange={handlePlanChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free - $0/month</SelectItem>
                <SelectItem value="pro">Pro - $29/month</SelectItem>
                <SelectItem value="enterprise">Enterprise - $99/month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Features</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableFeatures.map(feature => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Switch
                    id={feature.id}
                    checked={newTenantData.features.includes(feature.id)}
                    onCheckedChange={() => toggleFeature(feature.id)}
                    disabled={feature.free && newTenantData.plan === 'free' ? false : !feature.free && newTenantData.plan === 'free'}
                  />
                  <Label htmlFor={feature.id} className="text-sm">
                    {feature.name}
                    {!feature.free && (
                      <Badge variant="outline" className="ml-1 text-xs">Pro</Badge>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Limits: {newTenantData.maxUsers} users, {newTenantData.maxStorageGB} GB storage
            </div>
            <Button 
              onClick={handleCreateTenant}
              disabled={!newTenantData.name || !newTenantData.slug || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Workspace'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiTenantSetup;
