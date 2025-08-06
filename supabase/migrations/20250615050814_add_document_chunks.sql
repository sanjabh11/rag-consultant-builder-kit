
-- Create document_chunks table for storing processed document chunks
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding TEXT, -- Store as JSON string for now, can be upgraded to vector type later
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for document_chunks
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chunks from their documents" 
  ON public.document_chunks 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = document_chunks.document_id 
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage document chunks" 
  ON public.document_chunks 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_project_id ON public.document_chunks(project_id);

-- Add updated_at trigger
-- Drop trigger if already exists then recreate
DROP TRIGGER IF EXISTS update_document_chunks_updated_at ON public.document_chunks;
CREATE TRIGGER update_document_chunks_updated_at 
  BEFORE UPDATE ON public.document_chunks 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
