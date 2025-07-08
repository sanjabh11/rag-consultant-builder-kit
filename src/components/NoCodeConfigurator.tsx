
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useTenant } from '@/hooks/useTenantContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings,
  Palette,
  Database,
  Zap,
  Code,
  Eye,
  Save,
  Download,
  Upload,
  Wand2,
  Layout
} from 'lucide-react';

interface ComponentConfig {
  id: string;
  type: string;
  name: string;
  props: Record<string, any>;
  styles: Record<string, any>;
  enabled: boolean;
}

interface AppConfig {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: number;
  };
  layout: {
    sidebar: boolean;
    header: boolean;
    footer: boolean;
    containerWidth: string;
  };
  features: {
    authentication: boolean;
    fileUpload: boolean;
    search: boolean;
    notifications: boolean;
    analytics: boolean;
  };
  components: ComponentConfig[];
  workflows: any[];
}

const NoCodeConfigurator = () => {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [config, setConfig] = useState<AppConfig>({
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      fontFamily: 'Inter',
      borderRadius: 8
    },
    layout: {
      sidebar: true,
      header: true,
      footer: false,
      containerWidth: 'max-w-7xl'
    },
    features: {
      authentication: true,
      fileUpload: true,
      search: true,
      notifications: true,
      analytics: false
    },
    components: [],
    workflows: []
  });

  const [activeTab, setActiveTab] = useState('theme');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem(`nocode_config_${currentTenant?.id}`);
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, [currentTenant]);

  const saveConfiguration = () => {
    if (currentTenant) {
      localStorage.setItem(`nocode_config_${currentTenant.id}`, JSON.stringify(config));
      toast({
        title: "Configuration Saved",
        description: "Your no-code configuration has been saved successfully.",
      });
    }
  };

  const exportConfiguration = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `app-config-${currentTenant?.slug || 'default'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Configuration Exported",
      description: "Configuration file has been downloaded.",
    });
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          setConfig(importedConfig);
          toast({
            title: "Configuration Imported",
            description: "Configuration has been loaded successfully.",
          });
        } catch (error) {
          toast({
            title: "Import Error",
            description: "Failed to parse configuration file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const updateTheme = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      theme: { ...prev.theme, [key]: value }
    }));
  };

  const updateLayout = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      layout: { ...prev.layout, [key]: value }
    }));
  };

  const updateFeature = (key: string, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value }
    }));
  };

  const addComponent = (type: string) => {
    const newComponent: ComponentConfig = {
      id: `component-${Date.now()}`,
      type,
      name: `${type} Component`,
      props: getDefaultProps(type),
      styles: getDefaultStyles(type),
      enabled: true
    };
    
    setConfig(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  };

  const getDefaultProps = (type: string) => {
    switch (type) {
      case 'button':
        return { text: 'Click Me', variant: 'default' };
      case 'card':
        return { title: 'Card Title', content: 'Card content goes here' };
      case 'form':
        return { fields: ['name', 'email'], submitText: 'Submit' };
      case 'chart':
        return { type: 'bar', data: [] };
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: string) => {
    return {
      padding: 16,
      margin: 8,
      borderRadius: config.theme.borderRadius,
      backgroundColor: 'transparent'
    };
  };

  const AVAILABLE_COMPONENTS = [
    { type: 'button', name: 'Button', icon: '🔘' },
    { type: 'card', name: 'Card', icon: '📋' },
    { type: 'form', name: 'Form', icon: '📝' },
    { type: 'chart', name: 'Chart', icon: '📊' },
    { type: 'table', name: 'Table', icon: '📋' },
    { type: 'modal', name: 'Modal', icon: '🪟' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">No-Code Configurator</h2>
          <p className="text-gray-600">Build and customize your application without coding</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={exportConfiguration}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={importConfiguration}
            style={{ display: 'none' }}
            id="import-config"
          />
          <Button variant="outline" onClick={() => document.getElementById('import-config')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={saveConfiguration}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Preview Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="min-h-96 border-2 border-dashed border-gray-300 rounded-lg p-8"
              style={{
                fontFamily: config.theme.fontFamily,
                '--primary-color': config.theme.primaryColor,
                '--secondary-color': config.theme.secondaryColor,
                '--border-radius': `${config.theme.borderRadius}px`
              } as React.CSSProperties}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Application Preview</h3>
                <p className="text-gray-600 mb-6">This is how your configured application would look</p>
                
                {config.layout.header && (
                  <div className="bg-gray-100 p-4 rounded mb-4">
                    <h4 className="font-medium">Header Section</h4>
                  </div>
                )}
                
                <div className={`mx-auto ${config.layout.containerWidth}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {config.components.filter(c => c.enabled).map((component) => (
                      <div 
                        key={component.id} 
                        className="border rounded p-4"
                        style={{
                          borderRadius: `${config.theme.borderRadius}px`,
                          backgroundColor: component.styles.backgroundColor,
                          padding: `${component.styles.padding}px`,
                          margin: `${component.styles.margin}px`
                        }}
                      >
                        <h5 className="font-medium">{component.name}</h5>
                        <p className="text-sm text-gray-600">{component.type} component</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {config.layout.footer && (
                  <div className="bg-gray-100 p-4 rounded mt-4">
                    <h4 className="font-medium">Footer Section</h4>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">Primary Color</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={config.theme.primaryColor}
                        onChange={(e) => updateTheme('primaryColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.theme.primaryColor}
                        onChange={(e) => updateTheme('primaryColor', e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Secondary Color</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={config.theme.secondaryColor}
                        onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.theme.secondaryColor}
                        onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Font Family</label>
                    <Select value={config.theme.fontFamily} onValueChange={(value) => updateTheme('fontFamily', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Border Radius: {config.theme.borderRadius}px</label>
                    <Slider
                      value={[config.theme.borderRadius]}
                      onValueChange={(value) => updateTheme('borderRadius', value[0])}
                      max={20}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Layout Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Show Sidebar</label>
                      <Switch
                        checked={config.layout.sidebar}
                        onCheckedChange={(checked) => updateLayout('sidebar', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Show Header</label>
                      <Switch
                        checked={config.layout.header}
                        onCheckedChange={(checked) => updateLayout('header', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Show Footer</label>
                      <Switch
                        checked={config.layout.footer}
                        onCheckedChange={(checked) => updateLayout('footer', checked)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Container Width</label>
                    <Select value={config.layout.containerWidth} onValueChange={(value) => updateLayout('containerWidth', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="max-w-3xl">Small (3xl)</SelectItem>
                        <SelectItem value="max-w-5xl">Medium (5xl)</SelectItem>
                        <SelectItem value="max-w-7xl">Large (7xl)</SelectItem>
                        <SelectItem value="max-w-full">Full Width</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Feature Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(config.features).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                      <label className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => updateFeature(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_COMPONENTS.map((comp) => (
                      <Button
                        key={comp.type}
                        variant="outline"
                        onClick={() => addComponent(comp.type)}
                        className="h-auto p-4 flex flex-col gap-2"
                      >
                        <span className="text-2xl">{comp.icon}</span>
                        <span className="text-sm">{comp.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Added Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {config.components.map((component) => (
                      <div key={component.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{component.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{component.type}</Badge>
                          <Switch
                            checked={component.enabled}
                            onCheckedChange={(checked) => {
                              setConfig(prev => ({
                                ...prev,
                                components: prev.components.map(c =>
                                  c.id === component.id ? { ...c, enabled: checked } : c
                                )
                              }));
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {config.components.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No components added yet. Add components from the left panel.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Workflow Automation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Wand2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Workflow Builder</h3>
                  <p className="text-gray-600 mb-4">
                    Create automated workflows by connecting triggers and actions visually.
                  </p>
                  <Button onClick={() => window.location.href = '/workflows'}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Open Workflow Builder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default NoCodeConfigurator;
