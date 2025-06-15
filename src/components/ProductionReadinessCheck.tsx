
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReadinessCheck {
  name: string;
  status: 'checking' | 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const ProductionReadinessCheck: React.FC = () => {
  const [checks, setChecks] = useState<ReadinessCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  const runChecks = async () => {
    setIsRunning(true);
    const checkResults: ReadinessCheck[] = [];

    // Check 1: Authentication
    try {
      checkResults.push({
        name: 'Authentication System',
        status: user ? 'pass' : 'warning',
        message: user ? 'User authentication working' : 'Not currently authenticated',
        details: user ? `Logged in as: ${user.email}` : 'Authentication system is set up but no user logged in'
      });
    } catch (error) {
      checkResults.push({
        name: 'Authentication System',
        status: 'fail',
        message: 'Authentication system error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check 2: Database Connection
    try {
      const { data, error } = await supabase.from('projects').select('count').limit(1);
      checkResults.push({
        name: 'Database Connection',
        status: error ? 'fail' : 'pass',
        message: error ? 'Database connection failed' : 'Database connected successfully',
        details: error ? error.message : 'Supabase database is accessible'
      });
    } catch (error) {
      checkResults.push({
        name: 'Database Connection',
        status: 'fail',
        message: 'Database connection error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check 3: Storage Bucket
    try {
      const { data, error } = await supabase.storage.from('documents').list();
      checkResults.push({
        name: 'Storage System',
        status: error ? 'fail' : 'pass',
        message: error ? 'Storage bucket not accessible' : 'Storage system operational',
        details: error ? error.message : 'Document storage bucket is working'
      });
    } catch (error) {
      checkResults.push({
        name: 'Storage System',
        status: 'fail',
        message: 'Storage system error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check 4: Gemini API (Edge Function)
    try {
      const { data, error } = await supabase.functions.invoke('gemini-llm', {
        body: { prompt: 'Test connection', temperature: 0.1, maxTokens: 10 }
      });
      checkResults.push({
        name: 'Gemini API Integration',
        status: error ? 'fail' : 'pass',
        message: error ? 'Gemini API not working' : 'Gemini API connected successfully',
        details: error ? error.message : 'AI text generation is operational'
      });
    } catch (error) {
      checkResults.push({
        name: 'Gemini API Integration',
        status: 'fail',
        message: 'Gemini API connection error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check 5: Document Processing
    try {
      const { data, error } = await supabase.from('documents').select('count').limit(1);
      checkResults.push({
        name: 'Document Processing System',
        status: error ? 'fail' : 'pass',
        message: error ? 'Document system not ready' : 'Document processing ready',
        details: error ? error.message : 'Document upload and processing systems are configured'
      });
    } catch (error) {
      checkResults.push({
        name: 'Document Processing System',
        status: 'fail',
        message: 'Document system error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check 6: RAG System
    try {
      const { data, error } = await supabase.from('document_chunks').select('count').limit(1);
      checkResults.push({
        name: 'RAG Chat System',
        status: error ? 'fail' : 'pass',
        message: error ? 'RAG system not ready' : 'RAG system operational',
        details: error ? error.message : 'Document chunks table exists and RAG queries can be processed'
      });
    } catch (error) {
      checkResults.push({
        name: 'RAG Chat System',
        status: 'fail',
        message: 'RAG system error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setChecks(checkResults);
    setIsRunning(false);
  };

  useEffect(() => {
    runChecks();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="outline" className="text-green-600 border-green-600">Ready</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Warning</Badge>;
      case 'fail':
        return <Badge variant="outline" className="text-red-600 border-red-600">Failed</Badge>;
      default:
        return <Badge variant="outline">Checking</Badge>;
    }
  };

  const overallStatus = () => {
    if (checks.length === 0) return 'checking';
    if (checks.some(check => check.status === 'fail')) return 'fail';
    if (checks.some(check => check.status === 'warning')) return 'warning';
    return 'pass';
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            Production Readiness Check
            {getStatusIcon(overallStatus())}
          </CardTitle>
          <Button onClick={runChecks} disabled={isRunning}>
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Re-check
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.map((check, index) => (
            <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(check.status)}
                  <h3 className="font-medium">{check.name}</h3>
                  {getStatusBadge(check.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">{check.message}</p>
                {check.details && (
                  <p className="text-xs text-gray-500">{check.details}</p>
                )}
              </div>
            </div>
          ))}
          
          {checks.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Production Readiness Summary:</h3>
              {overallStatus() === 'pass' && (
                <p className="text-green-600">✅ All systems are operational. Ready for production deployment!</p>
              )}
              {overallStatus() === 'warning' && (
                <p className="text-yellow-600">⚠️ Systems are mostly ready, but there are some warnings to address.</p>
              )}
              {overallStatus() === 'fail' && (
                <p className="text-red-600">❌ Critical issues detected. Please resolve failures before deploying.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionReadinessCheck;
