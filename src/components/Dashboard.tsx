
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Cloud, HardDrive, Settings, BarChart3 } from 'lucide-react';
import { useProjects } from './ProjectProvider';
import { useCloudDocuments } from '@/hooks/useCloudDocuments';
import CloudDocumentUpload from './CloudDocumentUpload';
import LocalDocumentUpload from './LocalDocumentUpload';
import CloudRAGChat from './CloudRAGChat';
import LocalRAGChat from './LocalRAGChat';
import DocumentManager from './DocumentManager';
import OnboardingGuide from './OnboardingGuide';
import ProductionReadinessCheck from './ProductionReadinessCheck';

const Dashboard: React.FC = () => {
  const { currentProject } = useProjects();
  const [activeTab, setActiveTab] = useState('cloud');
  const [showProductionCheck, setShowProductionCheck] = useState(false);
  
  // Get document stats for onboarding
  const { documents } = useCloudDocuments(currentProject?.id || '');
  const hasCompletedChat = false; // This could be tracked in state/localStorage

  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome to RAG Chat Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Create your first project to get started with document upload and AI-powered chat.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>✨ Upload documents (PDF, TXT, DOCX)</p>
              <p>🤖 Chat with AI about your content</p>
              <p>📁 Organize with projects</p>
              <p>☁️ Cloud or local processing</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">{currentProject.name}</h2>
          {currentProject.description && (
            <p className="text-gray-600 mt-1">{currentProject.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Active Project</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProductionCheck(!showProductionCheck)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Production Check
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Onboarding Guide */}
        <OnboardingGuide
          projectId={currentProject.id}
          documentCount={documents.length}
          hasCompletedChat={hasCompletedChat}
        />

        {/* Production Readiness Check (conditional) */}
        {showProductionCheck && (
          <ProductionReadinessCheck />
        )}

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Cloud RAG
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Local RAG
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cloud" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Upload */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Upload Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CloudDocumentUpload projectId={currentProject.id} />
                  </CardContent>
                </Card>
              </div>
              
              {/* Document Library */}
              <div className="space-y-4">
                <DocumentManager projectId={currentProject.id} />
              </div>
              
              {/* RAG Chat */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      AI Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CloudRAGChat projectId={currentProject.id} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="local" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Local Document Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LocalDocumentUpload projectId={currentProject.id} />
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Local RAG Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LocalRAGChat projectId={currentProject.id} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
