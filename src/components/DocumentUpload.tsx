
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Upload, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  projectId: string;
  onUploadSuccess?: () => void;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword"
];

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  projectId,
  onUploadSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !projectId) return;

    setUploading(true);
    try {
      const file = files[0];
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, Word or Text file",
          variant: "destructive"
        });
        return;
      }

      const path = `${projectId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("project-docs")
        .upload(path, file);

      if (error) throw error;

      // Step 2: Get public file URL
      const fileUrl = supabase.storage.from("project-docs").getPublicUrl(path).data.publicUrl;

      // Step 3: Call edge function to chunk/index
      const resp = await supabase.functions.invoke("ingest-doc-chunks", {
        body: {
          fileUrl,
          fileName: file.name,
          projectId,
        }
      });
      if (resp.error) throw new Error(resp.error.message || 'Failed to index document');

      toast({
        title: "File uploaded",
        description: `${file.name} uploaded and indexed successfully.`,
      });

      onUploadSuccess?.();
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Could not upload file."
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          <Upload className="inline mr-2" />
          Upload Project Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="mt-2"
          disabled={uploading}
        >
          {uploading ? (
            <span className="animate-spin mr-2">🔄</span>
          ) : (
            <File className="w-4 h-4 mr-1" />
          )}
          Upload file
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          Accepted types: PDF, DOCX, TXT
        </p>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
