
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, FileText, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useCloudDocuments } from '@/hooks/useCloudDocuments';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface DocumentManagerProps {
  projectId: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ projectId }) => {
  const { documents, loading, deleteDocument } = useCloudDocuments(projectId);
  const { toast } = useToast();

  const handleDelete = async (documentId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      await deleteDocument(documentId);
      toast({
        title: "Document deleted",
        description: `"${fileName}" has been removed from your project.`,
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading documents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Library ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet.</p>
            <p className="text-sm">Upload documents to start building your knowledge base.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(doc.processing_status)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{doc.file_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                      <span>{doc.chunk_count} chunks</span>
                      <span>Uploaded {formatDistanceToNow(new Date(doc.uploaded_at))} ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(doc.processing_status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id, doc.file_name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentManager;
