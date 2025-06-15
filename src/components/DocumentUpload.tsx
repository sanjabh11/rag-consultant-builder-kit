
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalDocuments } from "@/hooks/useLocalDocuments";
import { useRateLimiting, RATE_LIMITS } from "@/hooks/useRateLimiting";
import LocalDocumentUpload from "./LocalDocumentUpload";
import { Upload, Cloud, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  projectId: string;
  onUploadSuccess?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  projectId,
  onUploadSuccess
}) => {
  const { toast } = useToast();
  const { checkRateLimit } = useRateLimiting({
    ...RATE_LIMITS.DOCUMENT_UPLOAD,
    identifier: `upload_${projectId}`
  });

  const handleUploadWrapper = () => {
    if (!checkRateLimit()) {
      return;
    }
    onUploadSuccess?.();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Local Storage
            </TabsTrigger>
            <TabsTrigger value="cloud" disabled className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Cloud Storage (Coming Soon)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="local" className="mt-4">
            <LocalDocumentUpload 
              projectId={projectId} 
              onUploadSuccess={handleUploadWrapper}
            />
          </TabsContent>
          
          <TabsContent value="cloud" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Cloud storage integration coming soon!</p>
              <p className="text-sm mt-2">For now, documents are stored locally in your browser.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
