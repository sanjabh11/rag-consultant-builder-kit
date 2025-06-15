
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/AuthProvider';
import { ProjectProvider } from '@/components/ProjectProvider';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
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
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ProjectProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main>
                <Dashboard />
              </main>
              <Toaster />
            </div>
          </ProjectProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
