
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import LocalDocumentUpload from "./LocalDocumentUpload";
import CloudDocumentUpload from "./CloudDocumentUpload";
import { Upload, Cloud, HardDrive } from "lucide-react";

interface DocumentUploadProps {
  projectId: string;
  onUploadSuccess?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  projectId,
  onUploadSuccess
}) => {
  const { user } = useAuth();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={user ? "cloud" : "local"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cloud" disabled={!user} className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Cloud Storage {!user && "(Login Required)"}
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Local Storage
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cloud" className="mt-4">
            {user ? (
              <CloudDocumentUpload 
                projectId={projectId} 
                onUploadSuccess={onUploadSuccess}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Please log in to use cloud storage</p>
                <p className="text-sm mt-2">Cloud storage provides better processing and team collaboration</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="local" className="mt-4">
            <LocalDocumentUpload 
              projectId={projectId} 
              onUploadSuccess={onUploadSuccess}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
