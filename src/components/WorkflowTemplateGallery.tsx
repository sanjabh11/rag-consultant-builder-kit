import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, FileText, PlusCircle, Briefcase, Scale, DollarSign } from 'lucide-react';
import { fetchN8nWorkflows, N8nWorkflow } from '@/services/n8nService';
import { realWorkflowService } from '@/services/workflow/RealWorkflowService';

// Define the WorkflowTemplate interface
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  domain?: string;
}

// Real workflow templates loaded from service
const getWorkflowIcon = (domain: string) => {
  switch (domain) {
    case 'hr': return <Bot className="h-8 w-8 text-blue-500" />;
    case 'legal': return <Scale className="h-8 w-8 text-purple-500" />;
    case 'finance': return <DollarSign className="h-8 w-8 text-green-500" />;
    case 'general': return <FileText className="h-8 w-8 text-gray-500" />;
    default: return <Briefcase className="h-8 w-8 text-orange-500" />;
  }
};

interface WorkflowTemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void;
  selectedTemplate: string | null;
  n8nUrl?: string;
  apiKey?: string;
}

export const WorkflowTemplateGallery: React.FC<WorkflowTemplateGalleryProps> = ({ onSelectTemplate, selectedTemplate, n8nUrl, apiKey }) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workflow templates from the real workflow service
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await realWorkflowService.initialize();
        
        // Try to get workflows from n8n first, then fall back to templates
        if (n8nUrl) {
          try {
            const workflows = await fetchN8nWorkflows(n8nUrl, apiKey);
            const mappedWorkflows = workflows.map((w) => ({
              id: w.id,
              name: w.name,
              description: w.active ? 'Active workflow' : 'Inactive workflow',
              icon: <FileText className="h-8 w-8 text-gray-500" />,
              domain: 'general'
            }));
            setTemplates(mappedWorkflows);
          } catch (n8nError) {
            // Fall back to workflow templates
            const workflowTemplates = await realWorkflowService.getWorkflowTemplates();
            const mappedTemplates = workflowTemplates.map((template) => ({
              id: template.id,
              name: template.name,
              description: template.description,
              icon: getWorkflowIcon(template.domain),
              domain: template.domain
            }));
            setTemplates(mappedTemplates);
            setError('Using built-in workflow templates (n8n connection failed)');
          }
        } else {
          // Use workflow templates when no n8n URL provided
          const workflowTemplates = await realWorkflowService.getWorkflowTemplates();
          const mappedTemplates = workflowTemplates.map((template) => ({
            id: template.id,
            name: template.name,
            description: template.description,
            icon: getWorkflowIcon(template.domain),
            domain: template.domain
          }));
          setTemplates(mappedTemplates);
        }
      } catch (error) {
        console.error('Failed to load workflow templates:', error);
        setError('Failed to load workflow templates');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [n8nUrl, apiKey]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={`cursor-pointer transition-all ${
            selectedTemplate === template.id
              ? 'border-blue-500 ring-2 ring-blue-500'
              : 'hover:border-gray-300'
          }`}
          onClick={() => onSelectTemplate(template.id)}
        >
          <CardHeader>
            <div className="flex items-center gap-4">
              {template.icon}
              <CardTitle>{template.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};