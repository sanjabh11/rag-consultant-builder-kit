
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCloudDocuments } from "@/hooks/useCloudDocuments";
import { Upload, File, Trash2, Cloud, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface CloudDocumentUploadProps {
  projectId: string;
  onUploadSuccess?: () => void;
}

const CloudDocumentUpload: React.FC<CloudDocumentUploadProps> = ({
  projectId,
  onUploadSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    documents, 
    uploading, 
    uploadDocument, 
    deleteDocument 
  } = useCloudDocuments(projectId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !projectId) return;

    const file = files[0];
    const documentId = await uploadDocument(file);
    if (documentId) {
      onUploadSuccess?.();
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Upload Documents (Cloud Storage)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <span className="animate-spin mr-2">🔄</span>
            ) : (
              <File className="w-4 h-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Supported: PDF, DOCX, TXT (stored securely in cloud)
          </p>
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cloud Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-sm">{doc.file_name}</div>
                      {getStatusIcon(doc.processing_status)}
                      <Badge variant="outline" className="text-xs">
                        {doc.processing_status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(doc.file_size)} • {doc.chunk_count} chunks • 
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CloudDocumentUpload;
