
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEnterpriseAuth } from '@/hooks/useEnterpriseAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, Shield, Database, FileType, Users } from 'lucide-react';

const TenantConfiguration = () => {
  const { currentTenant, hasPermission } = useEnterpriseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(currentTenant?.settings || {});

  const handleConfigUpdate = async () => {
    if (!hasPermission('tenant', 'update')) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to update tenant configuration",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('tenants')
        .update({ 
          settings: config,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTenant?.id);

      if (error) throw error;

      toast({
        title: "Configuration Updated",
        description: "Tenant configuration has been saved successfully",
      });
    } catch (error) {
      console.error('Error updating tenant config:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update tenant configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addAllowedFileType = (fileType: string) => {
    const currentTypes = config.allowedFileTypes || [];
    if (!currentTypes.includes(fileType)) {
      updateConfig('allowedFileTypes', [...currentTypes, fileType]);
    }
  };

  const removeAllowedFileType = (fileType: string) => {
    const currentTypes = config.allowedFileTypes || [];
    updateConfig('allowedFileTypes', currentTypes.filter(type => type !== fileType));
  };

  const addFeature = (feature: string) => {
    const currentFeatures = config.features || [];
    if (!currentFeatures.includes(feature)) {
      updateConfig('features', [...currentFeatures, feature]);
    }
  };

  const removeFeature = (feature: string) => {
    const currentFeatures = config.features || [];
    updateConfig('features', currentFeatures.filter(f => f !== feature));
  };

  const availableFileTypes = ['pdf', 'txt', 'docx', 'csv', 'xlsx', 'pptx', 'md', 'json'];
  const availableFeatures = [
    'document-upload',
    'cloud-rag', 
    'local-rag',
    'advanced-analytics',
    'cost-tracking',
    'workflow-automation',
    'white-labeling',
    'sso-integration',
    'api-access',
    'custom-models'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Tenant Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Database className="h-4 w-4" />
            Storage & Limits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxStorageGB">Max Storage (GB)</Label>
              <Input
                id="maxStorageGB"
                type="number"
                value={config.maxStorageGB || 10}
                onChange={(e) => updateConfig('maxStorageGB', parseInt(e.target.value))}
                min="1"
                max="1000"
              />
            </div>
            
            <div>
              <Label htmlFor="maxUsers">Max Users</Label>
              <Input
                id="maxUsers"
                type="number"
                value={config.maxUsers || 5}
                onChange={(e) => updateConfig('maxUsers', parseInt(e.target.value))}
                min="1"
                max="10000"
              />
            </div>
          </div>
        </div>

        {/* File Type Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileType className="h-4 w-4" />
            Allowed File Types
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {(config.allowedFileTypes || []).map((type: string) => (
              <Badge key={type} variant="secondary" className="cursor-pointer">
                {type}
                <button
                  onClick={() => removeAllowedFileType(type)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          
          <Select onValueChange={addAllowedFileType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Add file type" />
            </SelectTrigger>
            <SelectContent>
              {availableFileTypes
                .filter(type => !(config.allowedFileTypes || []).includes(type))
                .map((type) => (
                  <SelectItem key={type} value={type}>
                    .{type}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Feature Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Enabled Features
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {(config.features || []).map((feature: string) => (
              <Badge key={feature} variant="default" className="cursor-pointer">
                {feature.replace('-', ' ')}
                <button
                  onClick={() => removeFeature(feature)}
                  className="ml-1 text-red-200 hover:text-red-100"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          
          <Select onValueChange={addFeature}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Add feature" />
            </SelectTrigger>
            <SelectContent>
              {availableFeatures
                .filter(feature => !(config.features || []).includes(feature))
                .map((feature) => (
                  <SelectItem key={feature} value={feature}>
                    {feature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Settings
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require-2fa">Require Two-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Force all users to enable 2FA</p>
              </div>
              <Switch
                id="require-2fa"
                checked={config.require2FA || false}
                onCheckedChange={(checked) => updateConfig('require2FA', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ip-whitelist">IP Whitelist Enabled</Label>
                <p className="text-sm text-gray-600">Restrict access to specific IP addresses</p>
              </div>
              <Switch
                id="ip-whitelist"
                checked={config.ipWhitelistEnabled || false}
                onCheckedChange={(checked) => updateConfig('ipWhitelistEnabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="audit-logging">Enhanced Audit Logging</Label>
                <p className="text-sm text-gray-600">Log all user actions and API calls</p>
              </div>
              <Switch
                id="audit-logging"
                checked={config.auditLogging || false}
                onCheckedChange={(checked) => updateConfig('auditLogging', checked)}
              />
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold">API Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rate-limit">Rate Limit (requests/minute)</Label>
              <Input
                id="rate-limit"
                type="number"
                value={config.rateLimitPerMinute || 100}
                onChange={(e) => updateConfig('rateLimitPerMinute', parseInt(e.target.value))}
                min="1"
                max="10000"
              />
            </div>
            
            <div>
              <Label htmlFor="max-file-size">Max File Size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                value={config.maxFileSizeMB || 50}
                onChange={(e) => updateConfig('maxFileSizeMB', parseInt(e.target.value))}
                min="1"
                max="1000"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleConfigUpdate} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantConfiguration;
