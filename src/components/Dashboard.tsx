import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Cloud, HardDrive, Settings, BarChart3 } from 'lucide-react';
import { useProjects } from './ProjectProvider';
import { useLocalDocuments } from '@/hooks/useLocalDocuments';
import CloudDocumentUpload from './CloudDocumentUpload';
import LocalDocumentUpload from './LocalDocumentUpload';
import CloudRAGChat from './CloudRAGChat';
import LocalRAGChat from './LocalRAGChat';
import DocumentManager from './DocumentManager';
import OnboardingGuide from './OnboardingGuide';
import ProductionReadinessCheck from './ProductionReadinessCheck';

const Dashboard: React.FC = () => {
  const { currentProject } = useProjects();
  const [activeTab, setActiveTab] = useState('local');
  const [showProductionCheck, setShowProductionCheck] = useState(false);

  // Use local documents for document count in onboarding
  const { documents: localDocuments } = useLocalDocuments(currentProject?.id || '');
  const hasCompletedChat = false;

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full mx-auto shadow-xl border-0 bg-gradient-to-r from-blue-50 to-sky-100">
          <CardHeader>
            <CardTitle className="text-center font-extrabold text-transparent text-2xl bg-gradient-to-tr from-sky-700 to-indigo-500 bg-clip-text">Welcome to RAG Chat Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-900/70 text-center">
              Create your first project to get started with document upload and AI-powered chat.
            </p>
            <div className="grid grid-cols-2 gap-2 justify-items-center text-xs text-sky-600 font-medium">
              <span>✨ Upload docs</span>
              <span>🤖 Chat with AI</span>
              <span>📁 Organize projects</span>
              <span>☁️ Cloud/local</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 md:px-4 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-sky-900">{currentProject.name}</h2>
          {currentProject.description && (
            <p className="text-gray-500 mt-1">{currentProject.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-indigo-400 text-indigo-700 bg-indigo-50">Active Project</Badge>
          <Button
            variant="outline"
            size="sm"
            className="bg-white shadow hover:bg-blue-100 transition-all"
            onClick={() => setShowProductionCheck(!showProductionCheck)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Production Check
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <OnboardingGuide
          projectId={currentProject.id}
          documentCount={localDocuments.length}
          hasCompletedChat={hasCompletedChat}
        />

        {showProductionCheck && (
          <ProductionReadinessCheck />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-indigo-100 to-blue-100 shadow rounded-lg overflow-hidden">
            <TabsTrigger value="cloud" className="flex items-center gap-2 text-sky-800 font-semibold">
              <Cloud className="h-4 w-4" />
              Cloud RAG
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2 text-indigo-700 font-semibold">
              <HardDrive className="h-4 w-4" />
              Local RAG
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cloud" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <Card className="shadow-sm border-sky-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sky-700">
                      <FileText className="h-5 w-5" />
                      Upload Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CloudDocumentUpload projectId={currentProject.id} />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <DocumentManager projectId={currentProject.id} />
              </div>
              <div className="space-y-4">
                <Card className="shadow-sm border-sky-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sky-700">
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
                <Card className="shadow-sm border-indigo-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-700">
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
                <Card className="shadow-sm border-indigo-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-700">
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
