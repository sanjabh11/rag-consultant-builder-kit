import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { unifiedAPIClient } from '@/services/api/UnifiedAPIClient';
import { VectorStoreFactory, VectorStoreType } from '@/services/vectorstore/VectorStoreAdapter';
import { embeddingModelManager } from '@/services/embeddings/AdvancedEmbeddingService';
import { realWorkflowService } from '@/services/workflow/RealWorkflowService';
import { Sparkles, ArrowRight, ArrowLeft, Check, Database, Brain, Settings, Shield, Clock } from 'lucide-react';

interface ProjectConfiguration {
  name: string;
  description: string;
  domain: string;
  vectorStore: VectorStoreType;
  embeddingModel: string;
  llmProvider: string;
  workflows: string[];
  complianceFlags: string[];
  tokenBudget: number;
  features: string[];
}

interface AdvancedProjectCreationWizardProps {
  onComplete: (project: any) => void;
  onCancel: () => void;
}

const domainOptions = [
  { value: 'legal', label: 'Legal & Compliance' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance & Accounting' },
  { value: 'general', label: 'General Purpose' }
];

export const AdvancedProjectCreationWizard: React.FC<AdvancedProjectCreationWizardProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [configuration, setConfiguration] = useState<ProjectConfiguration>({
    name: '',
    description: '',
    domain: '',
    vectorStore: 'local',
    embeddingModel: 'Xenova/all-MiniLM-L6-v2',
    llmProvider: 'local',
    workflows: [],
    complianceFlags: [],
    tokenBudget: 50000,
    features: []
  });
  
  const [availableWorkflows, setAvailableWorkflows] = useState<any[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    loadAvailableOptions();
  }, []);

  const loadAvailableOptions = async () => {
    try {
      await realWorkflowService.initialize();
      const workflows = await realWorkflowService.getWorkflowTemplates();
      setAvailableWorkflows(workflows);
      
      const models = embeddingModelManager.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  const updateConfiguration = (updates: Partial<ProjectConfiguration>) => {
    setConfiguration(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    
    try {
      const project = await unifiedAPIClient.createProject({
        name: configuration.name,
        domain: configuration.domain,
        config: {
          vectorStore: configuration.vectorStore,
          embeddingModel: configuration.embeddingModel,
          llmProvider: configuration.llmProvider,
          workflows: configuration.workflows,
          features: configuration.features
        },
        compliance_flags: configuration.complianceFlags,
        llm_provider: configuration.llmProvider,
        token_budget: configuration.tokenBudget
      });

      toast({
        title: "Project Created Successfully",
        description: `${configuration.name} is ready for use`,
      });

      onComplete(project);
      
    } catch (error) {
      console.error('Project creation failed:', error);
      toast({
        title: "Project Creation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-2xl font-bold mb-2">Project Basics</h3>
            </div>
            <div className="space-y-4">
              <Input
                value={configuration.name}
                onChange={(e) => updateConfiguration({ name: e.target.value })}
                placeholder="Project Name"
              />
              <Textarea
                value={configuration.description}
                onChange={(e) => updateConfiguration({ description: e.target.value })}
                placeholder="Project Description"
              />
              <Select
                value={configuration.domain}
                onValueChange={(value) => updateConfiguration({ domain: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Domain" />
                </SelectTrigger>
                <SelectContent>
                  {domainOptions.map((domain) => (
                    <SelectItem key={domain.value} value={domain.value}>
                      {domain.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-bold mb-2">Technical Configuration</h3>
            </div>
            <div className="space-y-4">
              <Select
                value={configuration.vectorStore}
                onValueChange={(value: VectorStoreType) => updateConfiguration({ vectorStore: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Vector Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local (Browser Storage)</SelectItem>
                  <SelectItem value="chroma">ChromaDB</SelectItem>
                  <SelectItem value="weaviate">Weaviate</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={configuration.embeddingModel}
                onValueChange={(value) => updateConfiguration({ embeddingModel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Embedding Model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model.replace('Xenova/', '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer ${
                    configuration.llmProvider === 'local' ? 'border-blue-500' : ''
                  }`}
                  onClick={() => updateConfiguration({ llmProvider: 'local' })}
                >
                  <CardContent className="p-4 text-center">
                    <Brain className="h-6 w-6 mx-auto mb-2" />
                    <p>Local Processing</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer ${
                    configuration.llmProvider === 'openai' ? 'border-blue-500' : ''
                  }`}
                  onClick={() => updateConfiguration({ llmProvider: 'openai' })}
                >
                  <CardContent className="p-4 text-center">
                    <Brain className="h-6 w-6 mx-auto mb-2" />
                    <p>OpenAI GPT</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-2xl font-bold mb-2">Workflows & Features</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Available Workflows</label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {availableWorkflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={configuration.workflows.includes(workflow.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateConfiguration({ 
                              workflows: [...configuration.workflows, workflow.id] 
                            });
                          } else {
                            updateConfiguration({ 
                              workflows: configuration.workflows.filter(id => id !== workflow.id) 
                            });
                          }
                        }}
                      />
                      <div>
                        <p className="font-medium">{workflow.name}</p>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-bold mb-2">Review & Create</h3>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {configuration.name}</p>
                  <p><strong>Domain:</strong> {configuration.domain}</p>
                  <p><strong>Vector Store:</strong> {configuration.vectorStore}</p>
                  <p><strong>Workflows:</strong> {configuration.workflows.length} selected</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <Progress value={progress} className="mb-4" />
        <p className="text-sm text-muted-foreground text-center">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {renderStepContent()}

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          disabled={isCreating}
        >
          {currentStep === 1 ? (
            "Cancel"
          ) : (
            <>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </>
          )}
        </Button>

        <Button
          onClick={currentStep === totalSteps ? handleSubmit : handleNext}
          disabled={isCreating || (currentStep === 1 && !configuration.name)}
        >
          {currentStep === totalSteps ? (
            isCreating ? "Creating..." : "Create Project"
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdvancedProjectCreationWizard;
