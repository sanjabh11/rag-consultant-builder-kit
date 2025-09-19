import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { localStorageManager } from '@/services/storage/LocalStorageManager';
import { UnifiedRAGService, LocalEmbeddingProvider } from '@/services/rag/UnifiedRAGService';
import { LLMManager } from '@/services/llm/BaseLLMClient';
import { Upload, FileText, CheckCircle, XCircle, Loader2, HardDrive } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ProcessedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  chunkCount?: number;
  embeddingCount?: number;
}

interface EnhancedLocalDocumentUploadProps {
  projectId: string;
  collectionId: string;
  onDocumentProcessed?: (documentId: string) => void;
}

export const EnhancedLocalDocumentUpload: React.FC<EnhancedLocalDocumentUploadProps> = ({
  projectId,
  collectionId,
  onDocumentProcessed
}) => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [storageUsage, setStorageUsage] = useState<any>(null);
  const { toast } = useToast();
  
  const ragServiceRef = useRef<UnifiedRAGService | null>(null);
  
  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      try {
        await localStorageManager.initialize();
        const llmManager = new LLMManager();
        const embeddingProvider = new LocalEmbeddingProvider();
        
        ragServiceRef.current = new UnifiedRAGService(
          llmManager,
          localStorageManager,
          embeddingProvider
        );
        
        // Load storage usage
        const usage = await localStorageManager.getStorageUsage();
        setStorageUsage(usage);
      } catch (error) {
        console.error('Failed to initialize services:', error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize local storage services",
          variant: "destructive",
        });
      }
    };
    
    initializeServices();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!ragServiceRef.current) {
      toast({
        title: "Service Not Ready",
        description: "Please wait for services to initialize",
        variant: "destructive",
      });
      return;
    }

    const newDocuments: ProcessedDocument[] = acceptedFiles.map(file => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
    setIsProcessing(true);

    // Process each file
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const documentRecord = newDocuments[i];

      try {
        // Update status to processing
        setDocuments(prev => prev.map(doc => 
          doc.id === documentRecord.id 
            ? { ...doc, status: 'processing', progress: 10 }
            : doc
        ));

        // Read file content
        const content = await readFileContent(file);
        
        // Update progress
        setDocuments(prev => prev.map(doc => 
          doc.id === documentRecord.id 
            ? { ...doc, progress: 30 }
            : doc
        ));

        // Process document with RAG service
        await ragServiceRef.current!.processDocument({
          id: documentRecord.id,
          project_id: projectId,
          collection_id: collectionId,
          name: file.name,
          content: content,
          content_type: file.type
        }, {
          chunkSize: 1000,
          chunkOverlap: 200
        });

        // Update progress
        setDocuments(prev => prev.map(doc => 
          doc.id === documentRecord.id 
            ? { ...doc, progress: 80 }
            : doc
        ));

        // Get processing stats (mock for now)
        const chunkCount = Math.ceil(content.length / 1000);
        const embeddingCount = chunkCount;

        // Mark as completed
        setDocuments(prev => prev.map(doc => 
          doc.id === documentRecord.id 
            ? { 
                ...doc, 
                status: 'completed', 
                progress: 100,
                chunkCount,
                embeddingCount
              }
            : doc
        ));

        // Update storage usage
        const usage = await localStorageManager.getStorageUsage();
        setStorageUsage(usage);

        // Notify parent component
        if (onDocumentProcessed) {
          onDocumentProcessed(documentRecord.id);
        }

        toast({
          title: "Document Processed",
          description: `${file.name} has been processed and indexed locally`,
        });

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        
        setDocuments(prev => prev.map(doc => 
          doc.id === documentRecord.id 
            ? { 
                ...doc, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            : doc
        ));

        toast({
          title: "Processing Failed",
          description: `Failed to process ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setIsProcessing(false);
  }, [projectId, collectionId, onDocumentProcessed, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
      'application/json': ['.json']
    },
    disabled: isProcessing
  });

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        
        // Basic content extraction based on file type
        if (file.type === 'application/pdf') {
          // In a real implementation, use pdf-parse or similar library
          resolve(content || '');
        } else if (file.type.includes('word')) {
          // In a real implementation, use mammoth.js or similar library
          resolve(content || '');
        } else {
          resolve(content || '');
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const getStatusIcon = (status: ProcessedDocument['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Storage Usage Display */}
      {storageUsage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HardDrive className="h-5 w-5" />
              Local Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Documents</p>
                <p className="font-semibold">{storageUsage.documentCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Chunks</p>
                <p className="font-semibold">{storageUsage.chunkCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Embeddings</p>
                <p className="font-semibold">{storageUsage.embeddingCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Storage</p>
                <p className="font-semibold">Local Browser</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Local Document Upload & Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            
            {isDragActive ? (
              <p className="text-lg text-blue-600">Drop files here...</p>
            ) : (
              <>
                <p className="text-lg mb-2">
                  {isProcessing ? 'Processing documents...' : 'Drop files here or click to browse'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports: TXT, PDF, DOC, DOCX, MD, JSON
                </p>
                <Button disabled={isProcessing}>
                  Select Files
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Processing Status */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className="font-medium">{doc.name}</span>
                      <Badge variant="outline">{formatFileSize(doc.size)}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {doc.status === 'completed' && (
                        <>
                          <Badge variant="secondary">
                            {doc.chunkCount} chunks
                          </Badge>
                          <Badge variant="secondary">
                            {doc.embeddingCount} embeddings
                          </Badge>
                        </>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                        disabled={doc.status === 'processing'}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {(doc.status === 'uploading' || doc.status === 'processing') && (
                    <Progress value={doc.progress} className="mb-2" />
                  )}
                  
                  {doc.error && (
                    <p className="text-sm text-red-600 mt-2">{doc.error}</p>
                  )}
                  
                  {doc.status === 'completed' && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Processed and indexed locally - Ready for RAG queries
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedLocalDocumentUpload;
