
-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-docs', 'project-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for project-docs bucket
DROP POLICY IF EXISTS "Users can upload documents to their projects" ON storage.objects;
CREATE POLICY "Users can upload documents to their projects" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'project-docs' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can view their project documents" ON storage.objects;
CREATE POLICY "Users can view their project documents" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'project-docs' AND
    -- The user's ID will be the first folder in the path
    auth.uid() = (string_to_array(name, '/'))[1]::uuid
  );

DROP POLICY IF EXISTS "Users can update their project documents" ON storage.objects;
CREATE POLICY "Users can update their project documents" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'project-docs' AND
    auth.uid() = (string_to_array(name, '/'))[1]::uuid
  );

DROP POLICY IF EXISTS "Users can delete their project documents" ON storage.objects;
CREATE POLICY "Users can delete their project documents" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'project-docs' AND
    auth.uid() = (string_to_array(name, '/'))[1]::uuid
  );
