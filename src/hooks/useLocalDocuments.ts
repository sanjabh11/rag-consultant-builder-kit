
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useToast } from './use-toast';

interface LocalDocument {
  id: string;
  projectId: string;
  fileName: string;
  fileType: string;
  content: string;
  size: number;
  uploadedAt: string;
  chunks?: Array<{
    id: string;
    text: string;
    index: number;
  }>;
}

export const useLocalDocuments = (projectId: string) => {
  const [documents, setDocuments] = useLocalStorage<LocalDocument[]>(`project_docs_${projectId}`, []);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const uploadDocument = async (file: File): Promise<string | null> => {
    setIsProcessing(true);
    
    try {
      // Check storage limits
      const storage = JSON.stringify(documents).length;
      if (storage > 8 * 1024 * 1024) { // 8MB limit per project
        throw new Error('Storage limit exceeded. Please delete some documents first.');
      }

      // Read file content
      const content = await readFileContent(file);
      
      const newDocument: LocalDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        fileName: file.name,
        fileType: file.type,
        content,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        chunks: []
      };

      // Process document into chunks
      const chunks = await chunkDocument(content, newDocument.id);
      newDocument.chunks = chunks;

      // Store document
      setDocuments(prev => [...prev, newDocument]);

      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded and processed successfully.`,
      });

      return newDocument.id;
    } catch (error) {
      console.error('Document upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast({
      title: "Document deleted",
      description: "Document has been removed successfully.",
    });
  };

  const getDocument = (documentId: string) => {
    return documents.find(doc => doc.id === documentId);
  };

  const searchDocuments = (query: string): LocalDocument[] => {
    if (!query.trim()) return documents;
    
    const searchTerm = query.toLowerCase();
    return documents.filter(doc => 
      doc.fileName.toLowerCase().includes(searchTerm) ||
      doc.content.toLowerCase().includes(searchTerm) ||
      doc.chunks?.some(chunk => chunk.text.toLowerCase().includes(searchTerm))
    );
  };

  const getTotalSize = () => {
    return documents.reduce((total, doc) => total + doc.size, 0);
  };

  return {
    documents,
    uploadDocument,
    deleteDocument,
    getDocument,
    searchDocuments,
    isProcessing,
    totalSize: getTotalSize(),
    totalDocuments: documents.length
  };
};

// Helper function to read file content
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Helper function to chunk document content
const chunkDocument = async (content: string, documentId: string) => {
  const chunkSize = 1000; // characters per chunk
  const overlap = 100; // overlap between chunks
  const chunks = [];
  
  for (let i = 0; i < content.length; i += chunkSize - overlap) {
    const chunkText = content.slice(i, i + chunkSize);
    chunks.push({
      id: `${documentId}_chunk_${chunks.length}`,
      text: chunkText,
      index: chunks.length
    });
  }
  
  return chunks;
};
