
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useCreateAIProject } from '@/hooks/useAIProjects';
import { useLLMProviders } from '@/hooks/useLLMProviders';
import { Brain, FileText, Shield, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DOMAINS = [
  { value: 'hr', label: 'Human Resources', description: 'Employee policies, benefits, compliance' },
  { value: 'finance', label: 'Finance', description: 'Financial reports, budgets, analysis' },
  { value: 'legal', label: 'Legal', description: 'Contracts, compliance, legal research' },
  { value: 'manufacturing', label: 'Manufacturing', description: 'Operations, quality, safety' },
  { value: 'healthcare', label: 'Healthcare', description: 'Patient data, medical records' },
  { value: 'sales', label: 'Sales', description: 'Customer data, sales reports' },
];

const COMPLIANCE_FLAGS = [
  { id: 'hipaa', label: 'HIPAA', description: 'Healthcare data protection' },
  { id: 'gdpr', label: 'GDPR', description: 'EU data protection regulation' },
  { id: 'sox', label: 'SOX', description: 'Financial reporting compliance' },
  { id: 'iso27001', label: 'ISO 27001', description: 'Information security management' },
];

interface ProjectCreationWizardProps {
  onComplete: (projectId: string) => void;
  onCancel: () => void;
}

const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    subdomain: '',
    compliance_flags: [] as string[],
    llm_provider: 'llama3',
    token_budget: 10000,
  });

  const { data: llmProviders } = useLLMProviders();
  const createProject = useCreateAIProject();
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const project = await createProject.mutateAsync({
        ...formData,
        status: 'draft',
        config: {},
      });
      toast({
        title: "Project Created",
        description: "Your AI project has been created successfully.",
      });
      onComplete(project.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComplianceChange = (flagId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      compliance_flags: checked 
        ? [...prev.compliance_flags, flagId]
        : prev.compliance_flags.filter(f => f !== flagId)
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Create AI Project - Step {step} of 4
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Details</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., HR Policy Assistant"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Select value={formData.domain} onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((domain) => (
                    <SelectItem key={domain.value} value={domain.value}>
                      <div>
                        <div className="font-medium">{domain.label}</div>
                        <div className="text-sm text-muted-foreground">{domain.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain (Optional)</Label>
              <Input
                id="subdomain"
                value={formData.subdomain}
                onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
                placeholder="e.g., employee_benefits"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance & Security
            </h3>
            <p className="text-sm text-muted-foreground">
              Select the compliance requirements for your project. This will configure appropriate security measures.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {COMPLIANCE_FLAGS.map((flag) => (
                <div key={flag.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id={flag.id}
                    checked={formData.compliance_flags.includes(flag.id)}
                    onCheckedChange={(checked) => handleComplianceChange(flag.id, !!checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={flag.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {flag.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {flag.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5" />
              LLM Configuration
            </h3>
            <div className="space-y-2">
              <Label htmlFor="llm-provider">LLM Provider</Label>
              <Select value={formData.llm_provider} onValueChange={(value) => setFormData(prev => ({ ...prev, llm_provider: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select LLM provider" />
                </SelectTrigger>
                <SelectContent>
                  {llmProviders?.filter(p => p.enabled).map((provider) => (
                    <SelectItem key={provider.id} value={provider.provider_type}>
                      <div className="flex items-center justify-between w-full">
                        <span>{provider.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ${(provider.cost_per_token * 1000).toFixed(4)}/1K tokens
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget & Limits
            </h3>
            <div className="space-y-2">
              <Label>Token Budget: {formData.token_budget.toLocaleString()}</Label>
              <Slider
                value={[formData.token_budget]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, token_budget: value }))}
                max={100000}
                min={1000}
                step={1000}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">
                Estimated cost: ${((formData.token_budget * 0.0001)).toFixed(2)} per month
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handlePrev}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            {step < 4 ? (
              <Button 
                onClick={handleNext} 
                disabled={!formData.name || !formData.domain}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={createProject.isPending}
              >
                {createProject.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCreationWizard;
