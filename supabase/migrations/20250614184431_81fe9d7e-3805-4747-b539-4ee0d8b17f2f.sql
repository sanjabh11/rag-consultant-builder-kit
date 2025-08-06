
-- Create the missing document_chunks table for RAG functionality
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.ai_projects NOT NULL,
  document_id UUID,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(768), -- Embedding dimension for Gemini
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for project-based queries
CREATE INDEX IF NOT EXISTS document_chunks_project_id_idx ON public.document_chunks (project_id);

-- Enable RLS on document_chunks
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for document_chunks
DROP POLICY IF EXISTS "Users can view chunks for their projects" ON public.document_chunks;
CREATE POLICY "Users can view chunks for their projects" 
  ON public.document_chunks 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_projects 
      WHERE ai_projects.id = document_chunks.project_id 
      AND ai_projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create chunks for their projects" ON public.document_chunks;
CREATE POLICY "Users can create chunks for their projects" 
  ON public.document_chunks 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_projects 
      WHERE ai_projects.id = document_chunks.project_id 
      AND ai_projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update chunks for their projects" ON public.document_chunks;
CREATE POLICY "Users can update chunks for their projects" 
  ON public.document_chunks 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_projects 
      WHERE ai_projects.id = document_chunks.project_id 
      AND ai_projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete chunks for their projects" ON public.document_chunks;
CREATE POLICY "Users can delete chunks for their projects" 
  ON public.document_chunks 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_projects 
      WHERE ai_projects.id = document_chunks.project_id 
      AND ai_projects.user_id = auth.uid()
    )
  );

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to document_chunks
DROP TRIGGER IF EXISTS update_document_chunks_updated_at ON public.document_chunks;
CREATE TRIGGER update_document_chunks_updated_at 
  BEFORE UPDATE ON public.document_chunks 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
