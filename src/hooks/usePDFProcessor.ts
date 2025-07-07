import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFProcessingResult {
  text: string;
  pageCount: number;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
}

export const usePDFProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const processPDF = async (file: File): Promise<PDFProcessingResult | null> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const metadata = await pdf.getMetadata();
      const pageCount = pdf.numPages;
      
      let fullText = '';
      
      // Extract text from all pages with enhanced processing
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        setProgress((pageNum / pageCount) * 100);
        
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Enhanced text extraction with proper spacing and formatting
        const textItems = textContent.items as any[];
        let pageText = '';
        let lastY = 0;
        let currentLine = '';
        
        textItems.forEach((item, index) => {
          if (item.str && item.str.trim()) {
            // Detect line breaks based on Y position changes
            if (lastY !== 0 && Math.abs(item.transform[5] - lastY) > 5) {
              if (currentLine.trim()) {
                pageText += currentLine.trim() + '\n';
                currentLine = '';
              }
            }
            
            // Add spacing between words if needed
            if (currentLine && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
              currentLine += ' ';
            }
            
            currentLine += item.str;
            lastY = item.transform[5];
          }
        });
        
        // Add the last line
        if (currentLine.trim()) {
          pageText += currentLine.trim() + '\n';
        }
        
        // Clean up the text
        pageText = pageText
          .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
          .replace(/\n\s*\n/g, '\n')  // Remove empty lines
          .trim();
        
        if (pageText) {
          fullText += `\n\n--- Page ${pageNum} ---\n${pageText}`;
        }
      }

      const info = metadata.info as Record<string, any> | undefined;

      const result: PDFProcessingResult = {
        text: fullText.trim(),
        pageCount,
        metadata: {
          title: info?.Title,
          author: info?.Author,
          subject: info?.Subject,
          creator: info?.Creator,
          producer: info?.Producer,
          creationDate: info?.CreationDate,
          modificationDate: info?.ModDate,
        }
      };

      toast({
        title: "PDF processed successfully",
        description: `Extracted text from ${pageCount} pages`,
      });

      return result;
    } catch (error) {
      console.error('PDF processing error:', error);
      toast({
        title: "PDF processing failed",
        description: error instanceof Error ? error.message : "Failed to process PDF",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return {
    processPDF,
    isProcessing,
    progress
  };
};
