
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, CheckCircle, AlertCircle, Clock, Eye } from 'lucide-react';

interface ProcessingJob {
  id: string;
  fileName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  extractedInfo?: {
    language: string;
    entities: string[];
    summary: string;
    documentType: string;
  };
  error?: string;
}

const AdvancedDocumentProcessor: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    for (const file of acceptedFiles) {
      const jobId = Math.random().toString(36).substr(2, 9);
      const newJob: ProcessingJob = {
        id: jobId,
        fileName: file.name,
        status: 'queued',
        progress: 0,
      };
      
      setProcessingJobs(prev => [...prev, newJob]);
      
      try {
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project-docs')
          .upload(`${projectId}/${file.name}`, file);

        if (uploadError) throw uploadError;

        // Start advanced processing
        const { data, error } = await supabase.functions.invoke('process-document-advanced', {
          body: {
            projectId,
            filePath: uploadData.path,
            fileName: file.name,
            jobId,
          },
        });

        if (error) throw error;

        // Start polling for job status
        pollJobStatus(jobId);

      } catch (error) {
        setProcessingJobs(prev => 
          prev.map(job => 
            job.id === jobId 
              ? { ...job, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
              : job
          )
        );
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    setIsUploading(false);
  }, [projectId, toast]);

  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-processing-status', {
          body: { jobId },
        });

        if (error) throw error;

        setProcessingJobs(prev => 
          prev.map(job => 
            job.id === jobId 
              ? { 
                  ...job, 
                  status: data.status,
                  progress: data.progress,
                  extractedInfo: data.extractedInfo,
                  error: data.error,
                }
              : job
          )
        );

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          if (data.status === 'completed') {
            toast({
              title: "Processing Complete",
              description: `Successfully processed document with AI insights`,
            });
          }
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Error polling job status:', error);
      }
    }, 2000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
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
        return 'success';
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
                  Supports PDF, Word, PowerPoint, Excel, TXT, and HTML files
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
                    <Progress value={job.progress} className="mb-2" />
                  )}

                  {job.error && (
                    <p className="text-sm text-red-600 mb-2">{job.error}</p>
                  )}

                  {job.extractedInfo && (
                    <div className="bg-muted p-3 rounded mt-2">
                      <h4 className="font-medium mb-2 flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        AI Analysis Results
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Language:</span> {job.extractedInfo.language}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {job.extractedInfo.documentType}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Entities:</span> {job.extractedInfo.entities.join(', ')}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Summary:</span> {job.extractedInfo.summary}
                        </div>
                      </div>
                    </div>
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

export default AdvancedDocumentProcessor;
