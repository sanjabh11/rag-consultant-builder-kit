
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocalDocuments } from "@/hooks/useLocalDocuments";
import { getStorageUsage } from "@/hooks/useLocalStorage";
import { Upload, File, Trash2, HardDrive } from "lucide-react";

interface LocalDocumentUploadProps {
  projectId: string;
  onUploadSuccess?: () => void;
}

const ALLOWED_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword"
];

const LocalDocumentUpload: React.FC<LocalDocumentUploadProps> = ({
  projectId,
  onUploadSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    documents, 
    uploadDocument, 
    deleteDocument, 
    isProcessing, 
    totalSize,
    totalDocuments 
  } = useLocalDocuments(projectId);
  
  const storageInfo = getStorageUsage();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !projectId) return;

    const file = files[0];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return;
    }

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
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents (Local Storage)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
            <HardDrive className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">Storage Usage</div>
              <div className="text-xs text-muted-foreground">
                {storageInfo.usedMB} MB used of ~10 MB available
              </div>
            </div>
            <Badge variant="outline">
              {totalDocuments} docs
            </Badge>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <span className="animate-spin mr-2">🔄</span>
            ) : (
              <File className="w-4 h-4 mr-2" />
            )}
            {isProcessing ? 'Processing...' : 'Upload Document'}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Supported: PDF, DOCX, TXT (stored locally in browser)
          </p>
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents ({totalDocuments})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{doc.fileName}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(doc.size)} • {doc.chunks?.length || 0} chunks • 
                      {new Date(doc.uploadedAt).toLocaleDateString()}
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

export default LocalDocumentUpload;
