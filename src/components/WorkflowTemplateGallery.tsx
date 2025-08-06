import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, FileText, PlusCircle } from 'lucide-react';
import { fetchN8nWorkflows, N8nWorkflow } from '@/services/n8nService';

// Define the WorkflowTemplate interface
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

// No fallback mock data; gallery relies on live fetch.
const mockTemplates: WorkflowTemplate[] = [];

interface WorkflowTemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void;
  selectedTemplate: string | null;
  n8nUrl?: string;
  apiKey?: string;
}

export const WorkflowTemplateGallery: React.FC<WorkflowTemplateGalleryProps> = ({ onSelectTemplate, selectedTemplate, n8nUrl, apiKey }) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(mockTemplates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real n8n workflows if n8nUrl is provided
  useEffect(() => {
    if (!n8nUrl) {
      setTemplates(mockTemplates);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchN8nWorkflows(n8nUrl, apiKey)
      .then((workflows) => {
        // Map n8n workflows to WorkflowTemplate format
        setTemplates(
          workflows.map((w) => ({
            id: w.id,
            name: w.name,
            description: w.active ? 'Active workflow' : 'Inactive workflow',
            icon: <FileText className="h-8 w-8 text-gray-500" />,
          }))
        );
      })
      .catch(() => {
        setTemplates(mockTemplates);
        setError('Failed to fetch workflows from n8n. Showing mock templates.');
      })
      .finally(() => setLoading(false));
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