
-- Create tables for AI consultant platform
CREATE TABLE IF NOT EXISTS public.ai_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL, -- hr, finance, legal, manufacturing, etc.
  subdomain TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, generating, deployed, failed
  config JSONB NOT NULL DEFAULT '{}',
  compliance_flags TEXT[] DEFAULT '{}',
  llm_provider TEXT DEFAULT 'llama3',
  token_budget INTEGER DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for document ingestion and management
CREATE TABLE IF NOT EXISTS public.document_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.ai_projects NOT NULL,
  name TEXT NOT NULL,
  namespace TEXT NOT NULL, -- unique identifier for vector store
  document_count INTEGER DEFAULT 0,
  last_ingested_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for LLM provider configurations
CREATE TABLE IF NOT EXISTS public.llm_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL, -- llama3, gemini, mistral, claude
  endpoint_url TEXT,
  status TEXT NOT NULL DEFAULT 'offline', -- online, offline, error
  cost_per_token DECIMAL(10,6) DEFAULT 0.0001,
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for RAG queries and responses
CREATE TABLE IF NOT EXISTS public.rag_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.ai_projects NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  query_text TEXT NOT NULL,
  response_text TEXT,
  retrieved_chunks JSONB DEFAULT '[]',
  llm_provider TEXT,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for workflow templates
CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  n8n_workflow JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.ai_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_projects
CREATE POLICY "Users can view their own projects" 
  ON public.ai_projects 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
  ON public.ai_projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON public.ai_projects 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for document_collections
CREATE POLICY "Users can view collections for their projects" 
  ON public.document_collections 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_projects 
      WHERE ai_projects.id = document_collections.project_id 
      AND ai_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create collections for their projects" 
  ON public.document_collections 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_projects 
      WHERE ai_projects.id = document_collections.project_id 
      AND ai_projects.user_id = auth.uid()
    )
  );

-- Create policies for llm_providers (tenant-level)
CREATE POLICY "Users can view tenant LLM providers" 
  ON public.llm_providers 
  FOR SELECT 
  USING (true); -- For now, allow all authenticated users to see providers

-- Create policies for rag_queries
CREATE POLICY "Users can view their own queries" 
  ON public.rag_queries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own queries" 
  ON public.rag_queries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policies for workflow_templates (public read)
CREATE POLICY "Anyone can view workflow templates" 
  ON public.workflow_templates 
  FOR SELECT 
  USING (true);

-- Insert some default LLM providers
INSERT INTO public.llm_providers (tenant_id, name, provider_type, endpoint_url, cost_per_token, enabled) VALUES
('00000000-0000-0000-0000-000000000000', 'LLaMA 3 70B', 'llama3', 'http://llama3-service:8000', 0.0001, true),
('00000000-0000-0000-0000-000000000000', 'Gemini 2.5 Pro', 'gemini', 'https://generativelanguage.googleapis.com/v1', 0.0015, false),
('00000000-0000-0000-0000-000000000000', 'Mistral Large', 'mistral', '', 0.0008, false);

-- Insert default workflow templates
INSERT INTO public.workflow_templates (name, domain, description, n8n_workflow) VALUES
('Document Ingestion Pipeline', 'general', 'Monitor folder → Parse docs → Embed to Vector DB → Notify', '{"nodes": [{"name": "Google Drive Trigger"}, {"name": "PDF Parser"}, {"name": "Embed & Store"}, {"name": "Slack Notification"}]}'),
('HR Policy Q&A', 'hr', 'HR-specific workflow for employee questions', '{"nodes": [{"name": "Question Input"}, {"name": "HR Vector Search"}, {"name": "LLM Response"}, {"name": "Log Interaction"}]}'),
('Financial Report Analysis', 'finance', 'Process financial documents and generate summaries', '{"nodes": [{"name": "S3 File Monitor"}, {"name": "Table Extraction"}, {"name": "Financial Analysis"}, {"name": "Executive Summary"}]}'),
('Legal Contract Review', 'legal', 'Analyze contracts and extract key terms', '{"nodes": [{"name": "Contract Upload"}, {"name": "Legal Analysis"}, {"name": "Risk Assessment"}, {"name": "Notification"}]}');
