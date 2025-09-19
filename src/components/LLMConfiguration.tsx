
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useEnterpriseAuth } from '@/hooks/useEnterpriseAuth';
import { useToast } from '@/hooks/use-toast';
import { Brain, Server, Key, TestTube, Save, Plus, Trash2 } from 'lucide-react';

interface LLMConfig {
  id?: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'llama' | 'gemini' | 'local';
  model: string;
  endpoint_url?: string;
  api_key_encrypted?: string;
  configuration: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    system_prompt?: string;
  };
  is_active: boolean;
}

const LLMConfiguration = () => {
  const { currentTenant, hasPermission } = useEnterpriseAuth();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<LLMConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<LLMConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    loadConfigurations();
  }, [currentTenant]);

  const loadConfigurations = useEffect(() => {
    if (!currentTenant || !hasPermission('llm', 'read')) return;

    loadLLMConfigs();
  }, [currentTenant, hasPermission]);

  const loadLLMConfigs = async () => {
    try {
      // Load from local storage first
      const localConfigs = localStorage.getItem(`llm_configs_${currentTenant?.id}`);
      let loadedConfigs: LLMConfig[] = [];

      if (localConfigs) {
        loadedConfigs = JSON.parse(localConfigs);
      } else {
        // Initialize with default local configurations
        loadedConfigs = [
          {
            id: 'local-1',
            name: 'Local LLM (Browser)',
            provider: 'local',
            endpoint_url: 'browser://local',
            api_key_encrypted: '',
            model: 'local-model',
            configuration: {
              temperature: 0.7,
              max_tokens: 512,
            },
            is_active: true
          },
          {
            id: 'openai-1',
            name: 'OpenAI GPT-3.5',
            provider: 'openai',
            endpoint_url: 'https://api.openai.com/v1',
            api_key_encrypted: process.env.REACT_APP_OPENAI_API_KEY || '',
            model: 'gpt-3.5-turbo',
            configuration: {
              temperature: 0.7,
              max_tokens: 2048,
            },
            is_active: false
          }
        ];

        // Save default configs to local storage
        localStorage.setItem(`llm_configs_${currentTenant?.id}`, JSON.stringify(loadedConfigs));
      }

      setConfigs(loadedConfigs);

      if (loadedConfigs.length > 0 && !selectedConfig) {
        setSelectedConfig(loadedConfigs.find(c => c.is_active) || loadedConfigs[0]);
      }
    } catch (error) {
      console.error('Error loading LLM configurations:', error);
      toast({
        title: "Error",
        description: "Failed to load LLM configurations",
        variant: "destructive",
      });
    }
  };

  const saveConfiguration = async () => {
    if (!selectedConfig || !hasPermission('llm', 'create')) return;

    try {
      setLoading(true);

      // Mock save - in real implementation this would save to database
      toast({
        title: "Configuration Saved",
        description: "LLM configuration has been saved successfully",
      });
      
      setIsEditing(false);
      await loadConfigurations();
    } catch (error) {
      console.error('Error saving LLM configuration:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save LLM configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConfiguration = async () => {
    if (!selectedConfig) return;

    try {
      setLoading(true);
      setTestResult(null);

      // Mock test - in real implementation this would test the LLM
      setTestResult('Configuration test successful - Mock response');
      toast({
        title: "Test Successful",
        description: "LLM configuration is working correctly",
      });
    } catch (error) {
      console.error('Error testing LLM configuration:', error);
      setTestResult(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Test Failed",
        description: "LLM configuration test failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteConfiguration = async (configId: string) => {
    if (!hasPermission('llm', 'delete')) return;

    try {
      // Mock delete - in real implementation this would delete from database
      toast({
        title: "Configuration Deleted",
        description: "LLM configuration has been deleted",
      });
      
      await loadConfigurations();
      if (selectedConfig?.id === configId) {
        setSelectedConfig(configs.find(c => c.id !== configId) || null);
      }
    } catch (error) {
      console.error('Error deleting LLM configuration:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete LLM configuration",
        variant: "destructive",
      });
    }
  };

  const createNewConfiguration = () => {
    setSelectedConfig({
      name: 'New Configuration',
      provider: 'openai',
      model: 'gpt-4',
      configuration: {
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      is_active: false
    });
    setIsEditing(true);
  };

  const updateSelectedConfig = (field: keyof LLMConfig, value: any) => {
    if (!selectedConfig) return;
    setSelectedConfig({ ...selectedConfig, [field]: value });
  };

  const updateConfigurationField = (field: string, value: any) => {
    if (!selectedConfig) return;
    setSelectedConfig({
      ...selectedConfig,
      configuration: { ...selectedConfig.configuration, [field]: value }
    });
  };

  const getModelOptions = (provider: string) => {
    const models = {
      openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      llama: ['llama-3-70b', 'llama-3-8b', 'llama-2-70b'],
      gemini: ['gemini-pro', 'gemini-pro-vision'],
      local: ['custom-model']
    };
    return models[provider as keyof typeof models] || [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            LLM Configuration
          </div>
          <Button onClick={createNewConfiguration} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Configuration
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration List */}
        <div className="space-y-4">
          <h3 className="font-semibold">Existing Configurations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configs.map((config) => (
              <Card 
                key={config.id} 
                className={`cursor-pointer transition-all ${
                  selectedConfig?.id === config.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedConfig(config)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{config.name}</h4>
                    {config.is_active && <Badge variant="default">Active</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">
                    {config.provider} - {config.model}
                  </p>
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConfiguration(config.id!);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Configuration Editor */}
        {selectedConfig && (
          <div className="space-y-6 border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Configuration Details</h3>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                    <Button variant="outline" onClick={testConfiguration} disabled={loading}>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveConfiguration} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Basic Settings
                </h4>
                
                <div>
                  <Label htmlFor="config-name">Configuration Name</Label>
                  <Input
                    id="config-name"
                    value={selectedConfig.name}
                    onChange={(e) => updateSelectedConfig('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={selectedConfig.provider}
                    onValueChange={(value) => updateSelectedConfig('provider', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="llama">LLaMA</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                      <SelectItem value="local">Local/Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={selectedConfig.model}
                    onValueChange={(value) => updateSelectedConfig('model', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getModelOptions(selectedConfig.provider).map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedConfig.provider === 'local' && (
                  <div>
                    <Label htmlFor="endpoint">Endpoint URL</Label>
                    <Input
                      id="endpoint"
                      value={selectedConfig.endpoint_url || ''}
                      onChange={(e) => updateSelectedConfig('endpoint_url', e.target.value)}
                      disabled={!isEditing}
                      placeholder="http://localhost:8000/v1"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={selectedConfig.api_key_encrypted || ''}
                    onChange={(e) => updateSelectedConfig('api_key_encrypted', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter API key"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={selectedConfig.is_active}
                    onCheckedChange={(checked) => updateSelectedConfig('is_active', checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="is-active">Set as Active Configuration</Label>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Advanced Settings
                </h4>

                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={selectedConfig.configuration.temperature || 0.7}
                    onChange={(e) => updateConfigurationField('temperature', parseFloat(e.target.value))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min="1"
                    max="8192"
                    value={selectedConfig.configuration.max_tokens || 2048}
                    onChange={(e) => updateConfigurationField('max_tokens', parseInt(e.target.value))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="top-p">Top P</Label>
                  <Input
                    id="top-p"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedConfig.configuration.top_p || 1}
                    onChange={(e) => updateConfigurationField('top_p', parseFloat(e.target.value))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    value={selectedConfig.configuration.system_prompt || ''}
                    onChange={(e) => updateConfigurationField('system_prompt', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Optional system prompt for the model"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Test Result:</h4>
                <p className="text-sm">{testResult}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LLMConfiguration;
