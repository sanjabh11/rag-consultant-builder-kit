
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CloudDocument {
  id: string;
  project_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  chunk_count: number;
  uploaded_at: string;
  user_id: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const useCloudDocuments = (projectId: string) => {
  const [documents, setDocuments] = useState<CloudDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && projectId) {
      fetchDocuments();
    }
  }, [user, projectId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as CloudDocument[]) || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload PDF, TXT, or DOCX files.';
    }
    
    return null;
  };

  const uploadDocument = async (file: File): Promise<string | null> => {
    if (!user || !projectId) return null;
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Upload Error",
        description: validationError,
        variant: "destructive",
      });
      return null;
    }
    
    setUploading(true);
    try {
      // Use a secure folder structure: user.id/projectId/fileName
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${projectId}/${fileName}`;

      // Upload to storage bucket (documents)
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document metadata record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          project_id: projectId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          processing_status: 'pending',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newDocument = data as CloudDocument;
      setDocuments(prev => [newDocument, ...prev]);

      // Trigger edge function for document processing
      try {
        await supabase.functions.invoke('process-document', {
          body: { documentId: newDocument.id },
        });
      } catch (processError) {
        console.error('Document processing failed:', processError);
        toast({
          title: "Warning",
          description: "Document uploaded but processing failed. You can retry processing later.",
          variant: "destructive",
        });
      }

      toast({
        title: "Success",
        description: "Document uploaded and processing started",
      });
      return newDocument.id;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload document. Please check permissions and try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Get document info first
      const { data: doc } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentId)
        .maybeSingle();

      if ((doc as CloudDocument)?.storage_path) {
        // Delete from storage
        await supabase.storage
          .from('documents')
          .remove([(doc as CloudDocument).storage_path]);
      }

      // Delete document record (this will cascade to chunks)
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(d => d.id !== documentId));
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
};
