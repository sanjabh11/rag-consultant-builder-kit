import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Settings,
  Brain,
  DollarSign,
  Building2,
  Zap
} from 'lucide-react';
import { useLocalDocuments } from '@/hooks/useLocalDocuments';
import { useProjects } from '@/hooks/useProjects';
import { useTenant } from '@/hooks/useTenantContext';
import { useCostTracking } from '@/hooks/useCostTracking';
import LocalDocumentUpload from './LocalDocumentUpload';
import RAGChatInterface from './RAGChatInterface';
import AdvancedDocumentProcessor from './AdvancedDocumentProcessor';
import CostTrackingDashboard from './CostTrackingDashboard';
import MultiTenantSetup from './MultiTenantSetup';
import EnhancedRAGInterface from './EnhancedRAGInterface';
import { TenantProvider } from '@/hooks/useTenantContext';

const DashboardContent: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { currentTenant } = useTenant();
  const { currentCosts, utilizationPercentage } = useCostTracking();
  const currentProjectId = projects[0]?.id || 'local-project';
  const { documents, totalSize, totalDocuments } = useLocalDocuments(currentProjectId);
  
  const [activeTab, setActiveTab] = useState('overview');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Document Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            {currentTenant?.name || 'Local Workspace'} • Multi-tenant RAG Platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-800">
            {currentTenant?.subscription.plan.toUpperCase() || 'LOCAL'}
          </Badge>
          <Badge variant="outline">
            {totalDocuments} Documents
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${currentCosts.total.toFixed(4)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {utilizationPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <div className={`w-6 h-6 rounded-full ${getUtilizationColor(utilizationPercentage)}`} />
              </div>
            </div>
            <Progress 
              value={Math.min(utilizationPercentage, 100)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="advanced-rag" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Advanced RAG
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Costs
          </TabsTrigger>
          <TabsTrigger value="tenant" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Workspace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Document Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No documents uploaded yet</p>
                  <Button onClick={() => setActiveTab('upload')}>
                    Upload Your First Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {documents.reduce((sum, doc) => sum + (doc.chunks?.length || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Chunks</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {documents.filter(doc => doc.chunks && doc.chunks.length > 0).length}
                      </div>
                      <div className="text-sm text-gray-600">Processed Docs</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {new Set(documents.map(doc => doc.fileType)).size}
                      </div>
                      <div className="text-sm text-gray-600">File Types</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Documents</h4>
                    {documents.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium">{doc.fileName}</div>
                            <div className="text-sm text-gray-600">
                              {formatFileSize(doc.size)} • {doc.chunks?.length || 0} chunks
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {doc.fileType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LocalDocumentUpload projectId={currentProjectId} />
            <AdvancedDocumentProcessor 
              onDocumentProcessed={(doc) => {
                console.log('Document processed:', doc);
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <RAGChatInterface projectId={currentProjectId} />
        </TabsContent>

        <TabsContent value="advanced-rag">
          <EnhancedRAGInterface projectId={currentProjectId} />
        </TabsContent>

        <TabsContent value="costs">
          <CostTrackingDashboard />
        </TabsContent>

        <TabsContent value="tenant">
          <MultiTenantSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <TenantProvider>
      <DashboardContent />
    </TenantProvider>
  );
};

export default Dashboard;
