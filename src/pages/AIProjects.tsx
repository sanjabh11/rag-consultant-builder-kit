
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIProjects } from '@/hooks/useAIProjects';
import ProjectCreationWizard from '@/components/ProjectCreationWizard';
import RAGChatInterface from '@/components/RAGChatInterface';
import CostBreakdown from '@/components/CostBreakdown';
import { Brain, Plus, MessageSquare, Settings, Calendar, DollarSign, Zap, Database } from 'lucide-react';
import { CostBreakdown as CostBreakdownType } from '@/services/costEstimator';

const AIProjects = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showCostDetails, setShowCostDetails] = useState<string | null>(null);
  const { data: projects, isLoading } = useAIProjects();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'default';
      case 'generating': return 'secondary';
      case 'draft': return 'outline';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'hr': return '👥';
      case 'finance': return '💰';
      case 'legal': return '⚖️';
      case 'healthcare': return '🏥';
      case 'manufacturing': return '🏭';
      case 'sales': return '📈';
      default: return '🤖';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to safely extract cost estimate from config
  const getCostEstimate = (config: any): CostBreakdownType | null => {
    if (!config || typeof config !== 'object') return null;
    return config.cost_estimate || null;
  };

  // Helper function to safely extract infrastructure from config
  const getInfrastructure = (config: any) => {
    if (!config || typeof config !== 'object') return null;
    return config.infrastructure || null;
  };

  if (showWizard) {
    return (
      <div className="container mx-auto py-8">
        <ProjectCreationWizard
          onComplete={(projectId) => {
            setShowWizard(false);
            setSelectedProject(projectId);
          }}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setSelectedProject(null)}>
            ← Back to Projects
          </Button>
        </div>
        <RAGChatInterface projectId={selectedProject} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI Projects
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your AI consultant projects across different verticals
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No AI Projects Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first AI consultant project to get started with automated document processing and Q&A.
            </p>
            <Button onClick={() => setShowWizard(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => {
            const costEstimate = getCostEstimate(project.config);
            const infrastructure = getInfrastructure(project.config);
            
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-2xl">{getDomainIcon(project.domain)}</span>
                    {project.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {project.domain}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.subdomain && (
                    <p className="text-sm text-muted-foreground">
                      Subdomain: {project.subdomain}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      <span className="capitalize">{project.llm_provider}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{project.token_budget.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Cost Information */}
                  {costEstimate && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Monthly Cost</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowCostDetails(showCostDetails === project.id ? null : project.id)}
                        >
                          {formatCurrency(costEstimate.total)}
                        </Button>
                      </div>
                      
                      {infrastructure && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {infrastructure.gpu_provider !== 'none' && (
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              <span>{infrastructure.gpu_count}× {infrastructure.gpu_provider.toUpperCase()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            <span className="capitalize">{infrastructure.vector_store}</span>
                          </div>
                        </div>
                      )}

                      {showCostDetails === project.id && costEstimate && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <CostBreakdown 
                            breakdown={costEstimate} 
                            showDetails={true}
                            className="border-0 bg-transparent p-0"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {project.compliance_flags.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Compliance:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.compliance_flags.map((flag) => (
                          <Badge key={flag} variant="secondary" className="text-xs">
                            {flag.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIProjects;
