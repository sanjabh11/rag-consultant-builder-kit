
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
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Disable cloud documents for now due to schema mismatch
  useEffect(() => {
    setLoading(false);
    setDocuments([]);
  }, [user, projectId]);

  const fetchDocuments = async () => {
    setLoading(false);
    setDocuments([]);
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
    toast({
      title: "Cloud Storage Disabled",
      description: "Please use local storage for now. Cloud storage will be available after proper setup.",
      variant: "destructive",
    });
    return null;
  };

  const deleteDocument = async (documentId: string) => {
    toast({
      title: "Cloud Storage Disabled",
      description: "Please use local storage for now.",
      variant: "destructive",
    });
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
