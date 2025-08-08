
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Users, Key, Globe } from 'lucide-react';

interface SSOProviderConfig {
  id?: string;
  tenant_id: string;
  provider_type: 'okta' | 'azure_ad' | 'google' | 'github';
  provider_name: string;
  client_id: string;
  client_secret?: string;
  issuer_url?: string;
  authorization_url?: string;
  token_url?: string;
  user_info_url?: string;
  scopes: string[];
  default_role_id?: string;
  is_active: boolean;
  auto_provision_users: boolean;
}

interface SSOProviderProps {
  tenantId: string;
  onClose?: () => void;
}

export const SSOProviderConfig: React.FC<SSOProviderProps> = ({ tenantId, onClose }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<SSOProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<SSOProviderConfig | null>(null);
  const [formData, setFormData] = useState<Partial<SSOProviderConfig>>({
    tenant_id: tenantId,
    provider_type: 'google',
    provider_name: '',
    client_id: '',
    client_secret: '',
    scopes: ['openid', 'email', 'profile'],
    is_active: true,
    auto_provision_users: false,
  });

  // Load existing SSO providers
  useEffect(() => {
    loadProviders();
  }, [tenantId]);

  const loadProviders = async () => {
    try {
      // Mock data since the table doesn't exist yet
      const mockProviders: SSOProviderConfig[] = [
        {
          id: '1',
          tenant_id: tenantId,
          provider_type: 'google',
          provider_name: 'Google SSO',
          client_id: 'mock-client-id',
          scopes: ['openid', 'email', 'profile'],
          is_active: true,
          auto_provision_users: false
        }
      ];
      
      setProviders(mockProviders);
    } catch (error) {
      console.error('Error loading SSO providers:', error);
      toast({
        title: "Error",
        description: "Failed to load SSO providers",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!formData.provider_name || !formData.client_id) {
      toast({
        title: "Validation Error",
        description: "Provider name and Client ID are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Set provider-specific URLs based on type
      const providerUrls = getProviderUrls(formData.provider_type!);
      const dataToSave = {
        ...formData,
        ...providerUrls,
      };

      // Mock save - in real implementation this would save to database
      toast({
        title: "Success",
        description: selectedProvider?.id ? "SSO provider updated successfully" : "SSO provider created successfully",
      });

      await loadProviders();
      resetForm();
    } catch (error: any) {
      console.error('Error saving SSO provider:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save SSO provider",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProviderUrls = (type: string) => {
    switch (type) {
      case 'google':
        return {
          authorization_url: 'https://accounts.google.com/o/oauth2/v2/auth',
          token_url: 'https://oauth2.googleapis.com/token',
          user_info_url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        };
      case 'github':
        return {
          authorization_url: 'https://github.com/login/oauth/authorize',
          token_url: 'https://github.com/login/oauth/access_token',
          user_info_url: 'https://api.github.com/user',
        };
      case 'okta':
        return {
          authorization_url: formData.issuer_url ? `${formData.issuer_url}/v1/authorize` : '',
          token_url: formData.issuer_url ? `${formData.issuer_url}/v1/token` : '',
          user_info_url: formData.issuer_url ? `${formData.issuer_url}/v1/userinfo` : '',
        };
      case 'azure_ad':
        return {
          authorization_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          token_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          user_info_url: 'https://graph.microsoft.com/v1.0/me',
        };
      default:
        return {};
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SSO provider?')) return;

    setLoading(true);
    try {
      // Mock delete - in real implementation this would delete from database
      toast({
        title: "Success",
        description: "SSO provider deleted successfully",
      });
      
      await loadProviders();
    } catch (error) {
      console.error('Error deleting SSO provider:', error);
      toast({
        title: "Error",
        description: "Failed to delete SSO provider",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProvider(null);
    setFormData({
      tenant_id: tenantId,
      provider_type: 'google',
      provider_name: '',
      client_id: '',
      client_secret: '',
      scopes: ['openid', 'email', 'profile'],
      is_active: true,
      auto_provision_users: false,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SSO Configuration
          </CardTitle>
          <CardDescription>
            Configure Single Sign-On providers for your tenant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider_type">Provider Type</Label>
              <Select
                value={formData.provider_type}
                onValueChange={(value) => setFormData({ ...formData, provider_type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Google
                    </div>
                  </SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="okta">Okta</SelectItem>
                  <SelectItem value="azure_ad">Azure AD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="provider_name">Provider Name</Label>
              <Input
                id="provider_name"
                placeholder="e.g., Company Google SSO"
                value={formData.provider_name || ''}
                onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                id="client_id"
                placeholder="OAuth Client ID"
                value={formData.client_id || ''}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="client_secret">Client Secret</Label>
              <Input
                id="client_secret"
                type="password"
                placeholder="OAuth Client Secret"
                value={formData.client_secret || ''}
                onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
              />
            </div>
          </div>

          {(formData.provider_type === 'okta') && (
            <div>
              <Label htmlFor="issuer_url">Issuer URL</Label>
              <Input
                id="issuer_url"
                placeholder="https://your-domain.okta.com/oauth2/default"
                value={formData.issuer_url || ''}
                onChange={(e) => setFormData({ ...formData, issuer_url: e.target.value })}
              />
            </div>
          )}

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto_provision"
                checked={formData.auto_provision_users}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_provision_users: checked })}
              />
              <Label htmlFor="auto_provision">Auto-provision users</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {selectedProvider && (
              <Button
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedProvider ? 'Update' : 'Create'} Provider
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List existing providers */}
      {providers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Configured Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{provider.provider_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {provider.provider_type} • {provider.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setFormData(provider);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(provider.id!)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
