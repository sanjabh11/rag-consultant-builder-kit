import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Zap, Eye } from 'lucide-react';
import { useAdvancedDocumentProcessor } from '@/hooks/useAdvancedDocumentProcessor';
import { useDropzone } from 'react-dropzone';

interface AdvancedDocumentProcessorProps {
  onDocumentProcessed: (document: any) => void;
}

const AdvancedDocumentProcessor: React.FC<AdvancedDocumentProcessorProps> = ({
  onDocumentProcessed,
}) => {
  const [processingOptions, setProcessingOptions] = useState({
    chunkSize: 1000,
    chunkOverlap: 200,
    extractKeywords: true,
    extractEntities: true,
  });

  const { processDocument, isProcessing, processingProgress } = useAdvancedDocumentProcessor();

  const onDrop = async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const result = await processDocument(file, processingOptions);
      if (result) {
        onDocumentProcessed(result);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    disabled: isProcessing,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Advanced Document Processor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Processing Options */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Processing Options
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="extract-keywords"
                checked={processingOptions.extractKeywords}
                onCheckedChange={(checked) =>
                  setProcessingOptions(prev => ({ ...prev, extractKeywords: checked }))
                }
                disabled={isProcessing}
              />
              <Label htmlFor="extract-keywords">Extract Keywords</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="extract-entities"
                checked={processingOptions.extractEntities}
                onCheckedChange={(checked) =>
                  setProcessingOptions(prev => ({ ...prev, extractEntities: checked }))
                }
                disabled={isProcessing}
              />
              <Label htmlFor="extract-entities">Extract Entities</Label>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline">Chunk Size: {processingOptions.chunkSize}</Badge>
            <Badge variant="outline">Overlap: {processingOptions.chunkOverlap}</Badge>
          </div>
        </div>

        {/* Upload Area */}
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
          
          {isProcessing ? (
            <div className="space-y-3">
              <p className="text-lg font-medium">Processing document...</p>
              <Progress value={processingProgress} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-muted-foreground">{processingProgress}% complete</p>
            </div>
          ) : isDragActive ? (
            <p className="text-lg">Drop the files here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-lg">Drag & drop files here, or click to select</p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, TXT, DOC, and DOCX files
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <span>Enhanced PDF extraction</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-500" />
            <span>Semantic chunking</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-500" />
            <span>Keyword extraction</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-500" />
            <span>Entity recognition</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedDocumentProcessor;