
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { useLocalDocuments } from '@/hooks/useLocalDocuments';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ProcessingJob {
  id: string;
  fileName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  documentId?: string;
}

const AdvancedDocumentUpload: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const { processPDF, isProcessing: isPDFProcessing, progress: pdfProgress } = usePDFProcessor();
  const { uploadDocument } = useLocalDocuments(projectId);
  const { toast } = useToast();

  const processFile = async (file: File) => {
    const jobId = Math.random().toString(36).substr(2, 9);
    const newJob: ProcessingJob = {
      id: jobId,
      fileName: file.name,
      status: 'processing',
      progress: 0,
    };
    
    setProcessingJobs(prev => [...prev, newJob]);
    
    try {
      let content = '';
      let metadata = {};

      if (file.type === 'application/pdf') {
        const pdfResult = await processPDF(file);
        if (!pdfResult) throw new Error('PDF processing failed');
        content = pdfResult.text;
        metadata = pdfResult.metadata;
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        content = await readTextFile(file);
      } else {
        throw new Error('Unsupported file type');
      }

      // Create enhanced file object with extracted content
      const enhancedFile = new File([content], file.name, { type: 'text/plain' });
      
      const documentId = await uploadDocument(enhancedFile);
      
      if (documentId) {
        setProcessingJobs(prev => 
          prev.map(job => 
            job.id === jobId 
              ? { ...job, status: 'completed', progress: 100, documentId }
              : job
          )
        );
        
        toast({
          title: "Document uploaded successfully",
          description: `${file.name} has been processed and uploaded`,
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setProcessingJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
            : job
        )
      );
    }
  };

  const readTextFile = (file: File): Promise<string> => {
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await processFile(file);
    }
  }, [projectId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/html': ['.html'],
    },
    multiple: true,
  });

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'queued':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'queued':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Advanced Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <input {...getInputProps()} />
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop documents here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, TXT, Markdown, and HTML files
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {processingJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processingJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium">{job.fileName}</span>
                      <Badge variant={getStatusColor(job.status) as any}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>

                  {job.status === 'processing' && (
                    <Progress value={isPDFProcessing ? pdfProgress : 50} className="mb-2" />
                  )}

                  {job.error && (
                    <p className="text-sm text-red-600 mb-2">{job.error}</p>
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

export default AdvancedDocumentUpload;
