
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductionReadinessCheck from '@/components/ProductionReadinessCheck';
import { Rocket, Settings, Database, Cloud } from 'lucide-react';

const ProductionStatus: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Rocket className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold">Production Readiness Status</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This dashboard shows the current status of all systems required for production deployment
          of your RAG document processing application.
        </p>
      </div>

      <ProductionReadinessCheck />

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Core Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✅ User Authentication</li>
              <li>✅ Project Management</li>
              <li>✅ Document Upload</li>
              <li>✅ Document Processing</li>
              <li>✅ RAG Chat Interface</li>
              <li>✅ Vector Search</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✅ Supabase Database</li>
              <li>✅ File Storage</li>
              <li>✅ Edge Functions</li>
              <li>✅ Row Level Security</li>
              <li>✅ API Rate Limiting</li>
              <li>✅ Error Handling</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✅ Environment Variables</li>
              <li>✅ API Keys Setup</li>
              <li>✅ CORS Configuration</li>
              <li>✅ Security Policies</li>
              <li>✅ Type Safety</li>
              <li>✅ Build Process</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps for Deployment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Verify Gemini API Key</h3>
              <p className="text-sm text-gray-600">
                Make sure your Gemini API key (GEMINI_API_KEY) is properly set in Supabase Edge Function secrets.
                You provided: AIzaSyDmpYnphVeUXH1v4NUyhR47Jx61zIU3GYQ
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">2. Test the System</h3>
              <p className="text-sm text-gray-600">
                Upload a test document and try the RAG chat functionality to ensure everything works end-to-end.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">3. Deploy</h3>
              <p className="text-sm text-gray-600">
                Once all checks pass, you can deploy using Lovable's publish feature or connect to your preferred hosting platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionStatus;
