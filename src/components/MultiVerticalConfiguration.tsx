
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useTenant } from '@/hooks/useTenantContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Stethoscope, 
  GraduationCap, 
  Briefcase, 
  Factory,
  ShoppingCart,
  Users,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';

interface VerticalConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  settings: {
    terminology: Record<string, string>;
    workflows: string[];
    compliance: string[];
    features: string[];
  };
}

const AVAILABLE_VERTICALS = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'Stethoscope',
    description: 'Medical practices, hospitals, and healthcare providers',
    defaultTerminology: {
      'documents': 'Patient Records',
      'projects': 'Cases',
      'users': 'Medical Staff',
      'dashboard': 'Clinical Dashboard'
    },
    compliance: ['HIPAA', 'GDPR', 'SOC2'],
    workflows: ['Patient Intake', 'Diagnosis Workflow', 'Treatment Planning']
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    description: 'Schools, universities, and educational institutions',
    defaultTerminology: {
      'documents': 'Course Materials',
      'projects': 'Courses',
      'users': 'Students & Faculty',
      'dashboard': 'Academic Dashboard'
    },
    compliance: ['FERPA', 'COPPA', 'GDPR'],
    workflows: ['Student Enrollment', 'Course Planning', 'Assessment Workflow']
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: 'Briefcase',
    description: 'Law firms, legal departments, and compliance teams',
    defaultTerminology: {
      'documents': 'Legal Documents',
      'projects': 'Cases',
      'users': 'Legal Team',
      'dashboard': 'Case Management'
    },
    compliance: ['Attorney-Client Privilege', 'Bar Requirements', 'GDPR'],
    workflows: ['Case Intake', 'Document Review', 'Client Communication']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: 'Factory',
    description: 'Manufacturing companies and industrial operations',
    defaultTerminology: {
      'documents': 'Technical Specs',
      'projects': 'Production Lines',
      'users': 'Operators',
      'dashboard': 'Operations Dashboard'
    },
    compliance: ['ISO 9001', 'OSHA', 'Environmental'],
    workflows: ['Quality Control', 'Production Planning', 'Maintenance']
  },
  {
    id: 'retail',
    name: 'Retail & E-commerce',
    icon: 'ShoppingCart',
    description: 'Retail stores, e-commerce platforms, and consumer brands',
    defaultTerminology: {
      'documents': 'Product Catalogs',
      'projects': 'Campaigns',
      'users': 'Team Members',
      'dashboard': 'Sales Dashboard'
    },
    compliance: ['PCI DSS', 'GDPR', 'CCPA'],
    workflows: ['Inventory Management', 'Order Processing', 'Customer Service']
  }
];

const MultiVerticalConfiguration = () => {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [verticals, setVerticals] = useState<VerticalConfig[]>([]);
  const [selectedVertical, setSelectedVertical] = useState<string>('');
  const [customTerminology, setCustomTerminology] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize with saved configurations or defaults
    const savedVerticals = localStorage.getItem(`verticals_${currentTenant?.id}`);
    if (savedVerticals) {
      setVerticals(JSON.parse(savedVerticals));
    } else {
      // Set up default verticals
      const defaultVerticals = AVAILABLE_VERTICALS.map(v => ({
        id: v.id,
        name: v.name,
        icon: v.icon,
        description: v.description,
        enabled: false,
        settings: {
          terminology: v.defaultTerminology,
          workflows: v.workflows,
          compliance: v.compliance,
          features: ['basic-rag', 'document-upload', 'analytics']
        }
      }));
      setVerticals(defaultVerticals);
    }
  }, [currentTenant]);

  const saveConfiguration = () => {
    if (currentTenant) {
      localStorage.setItem(`verticals_${currentTenant.id}`, JSON.stringify(verticals));
      toast({
        title: "Configuration Saved",
        description: "Multi-vertical settings have been updated successfully.",
      });
    }
  };

  const toggleVertical = (verticalId: string) => {
    setVerticals(prev => prev.map(v => 
      v.id === verticalId ? { ...v, enabled: !v.enabled } : v
    ));
  };

  const updateTerminology = (verticalId: string, key: string, value: string) => {
    setVerticals(prev => prev.map(v => 
      v.id === verticalId 
        ? { 
            ...v, 
            settings: { 
              ...v.settings, 
              terminology: { ...v.settings.terminology, [key]: value } 
            } 
          } 
        : v
    ));
  };

  const addWorkflow = (verticalId: string, workflow: string) => {
    if (!workflow.trim()) return;
    
    setVerticals(prev => prev.map(v => 
      v.id === verticalId 
        ? { 
            ...v, 
            settings: { 
              ...v.settings, 
              workflows: [...v.settings.workflows, workflow] 
            } 
          } 
        : v
    ));
  };

  const removeWorkflow = (verticalId: string, workflowIndex: number) => {
    setVerticals(prev => prev.map(v => 
      v.id === verticalId 
        ? { 
            ...v, 
            settings: { 
              ...v.settings, 
              workflows: v.settings.workflows.filter((_, i) => i !== workflowIndex) 
            } 
          } 
        : v
    ));
  };

  const getIcon = (iconName: string) => {
    const icons = {
      Stethoscope,
      GraduationCap,
      Briefcase,
      Factory,
      ShoppingCart,
      Building2
    };
    const Icon = icons[iconName as keyof typeof icons] || Building2;
    return <Icon className="h-5 w-5" />;
  };

  const enabledVerticals = verticals.filter(v => v.enabled);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multi-Vertical Configuration</h2>
          <p className="text-gray-600">Configure industry-specific settings and terminology</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {enabledVerticals.length} Active Verticals
          </Badge>
          <Button onClick={saveConfiguration}>
            <Settings className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="terminology">Terminology</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verticals.map((vertical) => (
              <Card key={vertical.id} className={`cursor-pointer transition-all ${vertical.enabled ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIcon(vertical.icon)}
                      <CardTitle className="text-lg">{vertical.name}</CardTitle>
                    </div>
                    <Switch
                      checked={vertical.enabled}
                      onCheckedChange={() => toggleVertical(vertical.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{vertical.description}</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium">Compliance:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vertical.settings.compliance.map((comp, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium">Workflows: {vertical.settings.workflows.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vertical Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enabledVerticals.map((vertical) => (
                  <Card key={vertical.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        {getIcon(vertical.icon)}
                        <CardTitle className="text-base">{vertical.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Features</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {vertical.settings.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Compliance Requirements</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {vertical.settings.compliance.map((comp, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {comp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Terminology</CardTitle>
              <p className="text-sm text-gray-600">Customize terms for each vertical to match industry language</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {enabledVerticals.map((vertical) => (
                  <div key={vertical.id} className="border rounded-lg p-4">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      {getIcon(vertical.icon)}
                      {vertical.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(vertical.settings.terminology).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-sm font-medium capitalize">{key}</label>
                          <Input
                            value={value}
                            onChange={(e) => updateTerminology(vertical.id, key, e.target.value)}
                            placeholder={`Custom term for ${key}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vertical-Specific Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {enabledVerticals.map((vertical) => (
                  <div key={vertical.id} className="border rounded-lg p-4">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      {getIcon(vertical.icon)}
                      {vertical.name} Workflows
                    </h3>
                    <div className="space-y-2 mb-3">
                      {vertical.settings.workflows.map((workflow, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{workflow}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeWorkflow(vertical.id, index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new workflow..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addWorkflow(vertical.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addWorkflow(vertical.id, input.value);
                          input.value = '';
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiVerticalConfiguration;
