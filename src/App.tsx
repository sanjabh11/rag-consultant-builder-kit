
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AIProjects from "./pages/AIProjects";
import WorkflowBuilder from "./components/WorkflowBuilder";
import LLMConfigPanel from "./components/LLMConfigPanel";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import SubscriptionManager from "./components/SubscriptionManager";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import TeamCollaboration from "./components/TeamCollaboration";
import TeamManagement from "./components/TeamManagement";
import ErrorBoundary from "./components/ErrorBoundary";
import MobileOptimizedLayout from "./components/MobileOptimizedLayout";
import { useMobileOptimization } from "./hooks/useMobileOptimization";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppContent = () => {
  const { isMobile } = useMobileOptimization();

  return (
    <Routes>
      <Route path="/" element={<Layout><Index /></Layout>} />
      <Route path="/auth" element={<Auth />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/ai-projects" element={<Layout><AIProjects /></Layout>} />
        <Route path="/workflows" element={<Layout><WorkflowBuilder /></Layout>} />
        <Route path="/llm-config" element={<Layout><LLMConfigPanel /></Layout>} />
        <Route path="/subscription" element={<Layout><SubscriptionManager /></Layout>} />
        <Route path="/analytics" element={<Layout><AnalyticsDashboard /></Layout>} />
        <Route path="/team/:projectId" element={<Layout><TeamCollaboration projectId={""} /></Layout>} />
        <Route path="/team-management/:projectId" element={
          <Layout>
            <TeamManagement projectId={window.location.pathname.split('/').pop() || ''} />
          </Layout>
        } />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
