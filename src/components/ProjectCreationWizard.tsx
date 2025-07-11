import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useCreateAIProject } from '@/hooks/useAIProjects';
import { useLLMProviders } from '@/hooks/useLLMProviders';
import { useCostEstimation } from '@/hooks/useCostEstimation';
import { Brain, FileText, Shield, DollarSign, Zap, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CostBreakdown from '@/components/CostBreakdown';

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

const GPU_OPTIONS = [
  { value: 'none', label: 'No GPU (API-only)' },
  { value: 'a100', label: 'NVIDIA A100' },
  { value: 'h100', label: 'NVIDIA H100' },
];

const VECTOR_STORES = [
  { value: 'chroma', label: 'ChromaDB (Self-hosted)' },
  { value: 'weaviate', label: 'Weaviate (Managed)' },
  { value: 'qdrant', label: 'Qdrant (Managed)' },
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
    token_budget: 100000,
    gpu_provider: 'none',
    gpu_count: 0,
    gpu_hours_per_day: 24,
    vector_store: 'chroma',
    storage_gb: 50,
    supabase_plan: 'free' as 'free' | 'pro',
    n8n_mode: 'cloud_free' as 'self_hosted' | 'cloud_free',
    use_k8s: false,
  });

  const { data: llmProviders } = useLLMProviders();
  const createProject = useCreateAIProject();
  const { toast } = useToast();

  // Real-time cost estimation
  const costInputs = useMemo(() => ({
    gpu_provider: formData.gpu_provider,
    gpu_count: formData.gpu_count,
    gpu_hours_per_day: formData.gpu_hours_per_day,
    vector_store: formData.vector_store,
    llm_provider: formData.llm_provider,
    token_budget: formData.token_budget,
    supabase_plan: formData.supabase_plan,
    storage_gb: formData.storage_gb,
    bandwidth_gb: 10, // Default estimate
    n8n_mode: formData.n8n_mode,
    use_k8s: formData.use_k8s,
  }), [formData]);

  const { costBreakdown, isCalculating } = useCostEstimation(costInputs);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const project = await createProject.mutateAsync({
        ...formData,
        status: 'draft',
        config: {
          cost_estimate: costBreakdown,
          infrastructure: {
            gpu_provider: formData.gpu_provider,
            gpu_count: formData.gpu_count,
            gpu_hours_per_day: formData.gpu_hours_per_day,
            vector_store: formData.vector_store,
            storage_gb: formData.storage_gb,
            supabase_plan: formData.supabase_plan,
            n8n_mode: formData.n8n_mode,
            use_k8s: formData.use_k8s,
          }
        },
      });
      toast({
        title: "Project Created",
        description: `Your AI project has been created with estimated monthly cost of $${costBreakdown?.total || 0}.`,
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Create AI Project - Step {step} of 5
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
                  <Zap className="h-5 w-5" />
                  Infrastructure Configuration
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>GPU Provider</Label>
                    <Select value={formData.gpu_provider} onValueChange={(value) => setFormData(prev => ({ ...prev, gpu_provider: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GPU_OPTIONS.map((gpu) => (
                          <SelectItem key={gpu.value} value={gpu.value}>
                            {gpu.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.gpu_provider !== 'none' && (
                    <>
                      <div>
                        <Label>Number of GPUs: {formData.gpu_count}</Label>
                        <Slider
                          value={[formData.gpu_count]}
                          onValueChange={([value]) => setFormData(prev => ({ ...prev, gpu_count: value }))}
                          max={8}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Hours per day: {formData.gpu_hours_per_day}</Label>
                        <Slider
                          value={[formData.gpu_hours_per_day]}
                          onValueChange={([value]) => setFormData(prev => ({ ...prev, gpu_hours_per_day: value }))}
                          max={24}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Vector Database</Label>
                    <Select value={formData.vector_store} onValueChange={(value) => setFormData(prev => ({ ...prev, vector_store: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VECTOR_STORES.map((store) => (
                          <SelectItem key={store.value} value={store.value}>
                            {store.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Storage (GB): {formData.storage_gb}</Label>
                    <Slider
                      value={[formData.storage_gb]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, storage_gb: value }))}
                      max={1000}
                      min={1}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
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

                <div>
                  <Label>Token Budget: {formData.token_budget.toLocaleString()}</Label>
                  <Slider
                    value={[formData.token_budget]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, token_budget: value }))}
                    max={1000000}
                    min={10000}
                    step={10000}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Review & Cost Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Project Name</Label>
                      <p>{formData.name || 'Untitled'}</p>
                    </div>
                    <div>
                      <Label>Domain</Label>
                      <p className="capitalize">{formData.domain || 'Not selected'}</p>
                    </div>
                    <div>
                      <Label>GPU Configuration</Label>
                      <p>
                        {formData.gpu_provider === 'none' ? 'No GPU' : 
                         `${formData.gpu_count}× ${formData.gpu_provider.toUpperCase()}`}
                      </p>
                    </div>
                    <div>
                      <Label>Vector Store</Label>
                      <p className="capitalize">{formData.vector_store}</p>
                    </div>
                  </div>

                  {costBreakdown && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Estimated Monthly Cost: ${costBreakdown.total}
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• GPU: ${costBreakdown.gpu_cost}</li>
                        <li>• Vector DB: ${costBreakdown.vector_db_cost}</li>
                        <li>• LLM Tokens: ${costBreakdown.llm_cost}</li>
                        <li>• Infrastructure: ${costBreakdown.infrastructure_cost}</li>
                      </ul>
                    </div>
                  )}
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
                {step < 5 ? (
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
      </div>

      {/* Sticky Cost Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <CostBreakdown 
            breakdown={costBreakdown} 
            isCalculating={isCalculating}
            showDetails={step >= 3}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectCreationWizard;
