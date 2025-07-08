
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { TenantProvider } from '@/hooks/useTenantContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import EnterpriseConsole from '@/components/EnterpriseConsole';
import WorkflowBuilder from '@/components/WorkflowBuilder';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import AIProjects from '@/pages/AIProjects';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <TenantProvider>
              <div className="min-h-screen bg-gray-50">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/ai-projects" element={<AIProjects />} />
                    <Route path="/enterprise" element={<EnterpriseConsole />} />
                    <Route path="/workflows" element={<WorkflowBuilder />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Toaster />
              </div>
            </TenantProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
