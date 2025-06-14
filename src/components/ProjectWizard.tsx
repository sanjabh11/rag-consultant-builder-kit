
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Shield, 
  Brain, 
  DollarSign,
  CheckCircle,
  FileText,
  Users,
  Building
} from 'lucide-react';

interface ProjectSpec {
  projectName: string;
  vertical: string;
  subdomain: string;
  description: string;
  dataSources: string[];
  expectedUsers: number;
  throughput: number;
  sla: string;
  complianceFlags: string[];
  llmProvider: string;
  budget: number;
  deploymentType: string;
}

const ProjectWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [spec, setSpec] = useState<ProjectSpec>({
    projectName: '',
    vertical: '',
    subdomain: '',
    description: '',
    dataSources: [],
    expectedUsers: 50,
    throughput: 100,
    sla: '99.9',
    complianceFlags: [],
    llmProvider: '',
    budget: 1000,
    deploymentType: 'cloud'
  });

  const totalSteps = 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const verticals = [
    { value: 'hr', label: 'Human Resources', icon: <Users className="h-4 w-4" /> },
    { value: 'legal', label: 'Legal', icon: <Shield className="h-4 w-4" /> },
    { value: 'finance', label: 'Finance', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'healthcare', label: 'Healthcare', icon: <Building className="h-4 w-4" /> },
    { value: 'manufacturing', label: 'Manufacturing', icon: <Building className="h-4 w-4" /> },
    { value: 'customer-support', label: 'Customer Support', icon: <Users className="h-4 w-4" /> }
  ];

  const llmProviders = [
    { value: 'llama3', label: 'LLaMA 3 70B (Private)', cost: '$0.0001/1K tokens' },
    { value: 'gemini', label: 'Gemini 2.5 Pro', cost: '$0.0015/1K tokens' },
    { value: 'mistral', label: 'Mistral Large', cost: '$0.0008/1K tokens' }
  ];

  const complianceOptions = [
    { id: 'hipaa', label: 'HIPAA', description: 'Healthcare data protection' },
    { id: 'gdpr', label: 'GDPR', description: 'EU data privacy regulation' },
    { id: 'sox', label: 'SOX', description: 'Financial reporting compliance' },
    { id: 'iso27001', label: 'ISO 27001', description: 'Information security management' }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplianceChange = (flagId: string, checked: boolean) => {
    setSpec(prev => ({
      ...prev,
      complianceFlags: checked 
        ? [...prev.complianceFlags, flagId]
        : prev.complianceFlags.filter(f => f !== flagId)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Project Basics</h2>
              <p className="text-muted-foreground">Let's start with the fundamentals of your AI project</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={spec.projectName}
                  onChange={(e) => setSpec(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="e.g., HR Policy Assistant"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="vertical">Industry Vertical</Label>
                <Select value={spec.vertical} onValueChange={(value) => setSpec(prev => ({ ...prev, vertical: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your industry vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    {verticals.map((vertical) => (
                      <SelectItem key={vertical.value} value={vertical.value}>
                        <div className="flex items-center gap-2">
                          {vertical.icon}
                          {vertical.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subdomain">Subdomain (Optional)</Label>
                <Input
                  id="subdomain"
                  value={spec.subdomain}
                  onChange={(e) => setSpec(prev => ({ ...prev, subdomain: e.target.value }))}
                  placeholder="e.g., employee benefits, contract analysis"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  value={spec.description}
                  onChange={(e) => setSpec(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what your AI assistant should help with..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Data Sources</h2>
              <p className="text-muted-foreground">What documents and data will power your AI assistant?</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Support for PDF, Word, Excel, PowerPoint, and text files
                    </p>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Google Drive Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Google Drive to automatically sync documents
                  </p>
                  <Button variant="outline" className="w-full">
                    Connect Google Drive
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SharePoint Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect to Microsoft SharePoint for document sync
                  </p>
                  <Button variant="outline" className="w-full">
                    Connect SharePoint
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Scale & Performance</h2>
              <p className="text-muted-foreground">Configure your system for optimal performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expected Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Number of concurrent users: {spec.expectedUsers}</Label>
                    <Slider
                      value={[spec.expectedUsers]}
                      onValueChange={([value]) => setSpec(prev => ({ ...prev, expectedUsers: value }))}
                      max={500}
                      min={1}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Throughput</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Messages per minute: {spec.throughput}</Label>
                    <Slider
                      value={[spec.throughput]}
                      onValueChange={([value]) => setSpec(prev => ({ ...prev, throughput: value }))}
                      max={1000}
                      min={10}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Service Level Agreement (SLA)</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={spec.sla} onValueChange={(value) => setSpec(prev => ({ ...prev, sla: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="99.0">99.0% - Standard (8.7 hours downtime/year)</SelectItem>
                    <SelectItem value="99.5">99.5% - High (4.4 hours downtime/year)</SelectItem>
                    <SelectItem value="99.9">99.9% - Critical (52 minutes downtime/year)</SelectItem>
                    <SelectItem value="99.99">99.99% - Mission Critical (5 minutes downtime/year)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Compliance & Security</h2>
              <p className="text-muted-foreground">Ensure your deployment meets regulatory requirements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complianceOptions.map((option) => (
                <Card key={option.id} className="cursor-pointer hover:bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={option.id}
                        checked={spec.complianceFlags.includes(option.id)}
                        onCheckedChange={(checked) => handleComplianceChange(option.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="text-base font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {spec.complianceFlags.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Compliance Features Enabled</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your deployment will include enhanced security, encryption, audit logging, 
                        and region-specific data handling to meet selected compliance requirements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">LLM Selection & Budget</h2>
              <p className="text-muted-foreground">Choose your AI model and set spending limits</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Select LLM Provider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {llmProviders.map((provider) => (
                  <div 
                    key={provider.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      spec.llmProvider === provider.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSpec(prev => ({ ...prev, llmProvider: provider.value }))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{provider.label}</h4>
                        <p className="text-sm text-muted-foreground">{provider.cost}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {provider.value === 'llama3' && <Badge variant="secondary">Private</Badge>}
                        {spec.llmProvider === provider.value && <CheckCircle className="h-5 w-5 text-blue-600" />}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Monthly spending limit: ${spec.budget}</Label>
                    <Slider
                      value={[spec.budget]}
                      onValueChange={([value]) => setSpec(prev => ({ ...prev, budget: value }))}
                      max={10000}
                      min={100}
                      step={100}
                      className="mt-2"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Estimated usage based on your configuration:</p>
                    <p>• {spec.expectedUsers} users × {spec.throughput} messages/min ≈ ${Math.round(spec.budget * 0.3)}/month</p>
                    <p>• 80% buffer for traffic spikes included</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Review & Deploy</h2>
              <p className="text-muted-foreground">Review your configuration and deploy your AI assistant</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Project Name</Label>
                    <p className="text-sm">{spec.projectName || 'Untitled Project'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Vertical</Label>
                    <p className="text-sm">{spec.vertical || 'Not selected'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Expected Users</Label>
                    <p className="text-sm">{spec.expectedUsers}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Throughput</Label>
                    <p className="text-sm">{spec.throughput} msgs/min</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">SLA Target</Label>
                    <p className="text-sm">{spec.sla}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">LLM Provider</Label>
                    <p className="text-sm">{llmProviders.find(p => p.value === spec.llmProvider)?.label || 'Not selected'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Monthly Budget</Label>
                    <p className="text-sm">${spec.budget}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Compliance</Label>
                    <p className="text-sm">{spec.complianceFlags.length > 0 ? spec.complianceFlags.join(', ') : 'None'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Ready to Deploy</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your AI assistant will be deployed with the selected configuration. 
                      You can modify these settings later from the project dashboard.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Create AI Project</h1>
          <Badge variant="outline">Step {currentStep} of {totalSteps}</Badge>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <Card className="min-h-[600px]">
        <CardContent className="p-8">
          {renderStep()}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep === totalSteps ? (
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Deploy Project
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectWizard;
