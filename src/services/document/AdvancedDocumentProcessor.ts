// Advanced document processing with support for multiple file formats
export class AdvancedDocumentProcessor {
  private supportedFormats = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'application/json',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  async processDocument(file: File): Promise<ProcessedDocument> {
    if (!this.isSupported(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    const startTime = Date.now();
    let content: string;
    let metadata: DocumentMetadata = {
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
      processedAt: new Date().toISOString()
    };

    try {
      switch (file.type) {
        case 'text/plain':
        case 'text/markdown':
          content = await this.processTextFile(file);
          break;
        case 'application/pdf':
          const pdfResult = await this.processPDFFile(file);
          content = pdfResult.content;
          metadata = { ...metadata, ...pdfResult.metadata };
          break;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          const docResult = await this.processWordDocument(file);
          content = docResult.content;
          metadata = { ...metadata, ...docResult.metadata };
          break;
        case 'application/json':
          content = await this.processJSONFile(file);
          break;
        case 'text/csv':
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          const csvResult = await this.processSpreadsheet(file);
          content = csvResult.content;
          metadata = { ...metadata, ...csvResult.metadata };
          break;
        default:
          content = await this.processTextFile(file);
      }

      // Clean and normalize content
      content = this.cleanContent(content);
      
      // Extract additional metadata
      const additionalMetadata = this.extractContentMetadata(content);
      metadata = { ...metadata, ...additionalMetadata };

      const processingTime = Date.now() - startTime;

      return {
        content,
        metadata: {
          ...metadata,
          processingTimeMs: processingTime,
          wordCount: this.countWords(content),
          characterCount: content.length
        },
        chunks: await this.intelligentChunking(content, metadata)
      };

    } catch (error) {
      throw new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  private async processPDFFile(file: File): Promise<{ content: string; metadata: Partial<DocumentMetadata> }> {
    // For browser environment, we'll use a simplified PDF text extraction
    // In production, you'd use pdf-parse or similar library
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Simple PDF text extraction (basic implementation)
          // This is a placeholder - use a proper PDF library in production
          const text = this.extractTextFromPDFBuffer(uint8Array);
          
          resolve({
            content: text,
            metadata: {
              pdfPages: this.estimatePDFPages(uint8Array),
              extractionMethod: 'simple'
            }
          });
        } catch (error) {
          reject(new Error(`PDF processing failed: ${error}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private async processWordDocument(file: File): Promise<{ content: string; metadata: Partial<DocumentMetadata> }> {
    // For browser environment, simplified Word document processing
    // In production, use mammoth.js or similar library
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          
          // This is a placeholder implementation
          // Use mammoth.js for proper Word document extraction
          const text = this.extractTextFromWordBuffer(arrayBuffer);
          
          resolve({
            content: text,
            metadata: {
              documentType: 'word',
              extractionMethod: 'simple'
            }
          });
        } catch (error) {
          reject(new Error(`Word document processing failed: ${error}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Word document'));
      reader.readAsArrayBuffer(file);
    });
  }

  private async processJSONFile(file: File): Promise<string> {
    const jsonText = await this.processTextFile(file);
    try {
      const jsonObject = JSON.parse(jsonText);
      return this.flattenJSONToText(jsonObject);
    } catch {
      return jsonText; // Return as plain text if JSON parsing fails
    }
  }

  private async processSpreadsheet(file: File): Promise<{ content: string; metadata: Partial<DocumentMetadata> }> {
    // Simplified CSV/Excel processing for browser
    // In production, use SheetJS or similar library
    const textContent = await this.processTextFile(file);
    
    let content: string;
    let metadata: Partial<DocumentMetadata> = {};

    if (file.type === 'text/csv') {
      const rows = textContent.split('\n').map(row => row.split(','));
      content = this.csvToText(rows);
      metadata = {
        rowCount: rows.length,
        columnCount: rows[0]?.length || 0
      };
    } else {
      // For Excel files, fallback to text extraction
      content = textContent;
      metadata = {
        documentType: 'spreadsheet',
        extractionMethod: 'fallback'
      };
    }

    return { content, metadata };
  }

  // Content cleaning and normalization
  private cleanContent(content: string): string {
    return content
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove multiple consecutive line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  // Extract metadata from content
  private extractContentMetadata(content: string): Partial<DocumentMetadata> {
    const words = this.countWords(content);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    // Detect language (simple heuristic)
    const language = this.detectLanguage(content);
    
    // Extract key phrases (simple implementation)
    const keyPhrases = this.extractKeyPhrases(content);

    return {
      wordCount: words,
      sentenceCount: sentences,
      paragraphCount: paragraphs,
      language,
      keyPhrases: keyPhrases.slice(0, 10), // Top 10 key phrases
      readingLevel: this.estimateReadingLevel(words, sentences)
    };
  }

  // Intelligent chunking based on content structure
  private async intelligentChunking(content: string, metadata: DocumentMetadata): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];
    const chunkSize = 1000;
    const chunkOverlap = 200;
    
    // Try semantic chunking first
    const semanticChunks = this.semanticChunking(content);
    
    if (semanticChunks.length > 0 && semanticChunks.every(chunk => chunk.length <= chunkSize * 1.5)) {
      // Use semantic chunks if they're reasonably sized
      semanticChunks.forEach((chunk, index) => {
        chunks.push({
          id: `semantic_${index}`,
          content: chunk,
          chunkType: 'semantic',
          wordCount: this.countWords(chunk),
          index
        });
      });
    } else {
      // Fall back to sliding window chunking
      const sentences = this.splitIntoSentences(content);
      let currentChunk = '';
      let chunkIndex = 0;
      
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
          chunks.push({
            id: `sliding_${chunkIndex}`,
            content: currentChunk.trim(),
            chunkType: 'sliding_window',
            wordCount: this.countWords(currentChunk),
            index: chunkIndex
          });
          
          // Create overlap
          const words = currentChunk.split(' ');
          const overlapWords = words.slice(-Math.floor(chunkOverlap / 5)); // Approximate word count
          currentChunk = overlapWords.join(' ') + ' ' + sentence;
          chunkIndex++;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      }
      
      // Add final chunk
      if (currentChunk.trim()) {
        chunks.push({
          id: `sliding_${chunkIndex}`,
          content: currentChunk.trim(),
          chunkType: 'sliding_window',
          wordCount: this.countWords(currentChunk),
          index: chunkIndex
        });
      }
    }
    
    return chunks;
  }

  // Utility methods
  private isSupported(mimeType: string): boolean {
    return this.supportedFormats.includes(mimeType);
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private semanticChunking(content: string): string[] {
    // Simple semantic chunking based on paragraphs and headings
    const paragraphs = content.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > 1000 && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  private detectLanguage(text: string): string {
    // Simple language detection heuristic
    const sample = text.slice(0, 1000).toLowerCase();
    
    if (/[а-я]/.test(sample)) return 'ru';
    if (/[中文]/.test(sample)) return 'zh';
    if (/[ñáéíóúü]/.test(sample)) return 'es';
    if (/[àâäéèêëïîôöùûüÿç]/.test(sample)) return 'fr';
    if (/[äöüß]/.test(sample)) return 'de';
    
    return 'en'; // Default to English
  }

  private extractKeyPhrases(text: string): string[] {
    // Simple key phrase extraction using word frequency
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  private estimateReadingLevel(words: number, sentences: number): string {
    if (sentences === 0) return 'unknown';
    
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence < 12) return 'elementary';
    if (avgWordsPerSentence < 18) return 'middle_school';
    if (avgWordsPerSentence < 24) return 'high_school';
    return 'college';
  }

  // Placeholder implementations for file format specific processing
  private extractTextFromPDFBuffer(buffer: Uint8Array): string {
    // This is a placeholder - use pdf-parse or PDF.js in production
    const text = new TextDecoder('utf-8').decode(buffer);
    return text.replace(/[^\x20-\x7E\n]/g, ' '); // Extract printable characters
  }

  private extractTextFromWordBuffer(buffer: ArrayBuffer): string {
    // This is a placeholder - use mammoth.js in production
    const text = new TextDecoder('utf-8').decode(buffer);
    return text.replace(/[^\x20-\x7E\n]/g, ' '); // Extract printable characters
  }

  private estimatePDFPages(buffer: Uint8Array): number {
    // Simple estimation based on file size
    return Math.ceil(buffer.length / 50000); // Rough estimate
  }

  private flattenJSONToText(obj: any, prefix: string = ''): string {
    let text = '';
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          text += `${fullKey}: [${value.join(', ')}]\n`;
        } else {
          text += this.flattenJSONToText(value, fullKey);
        }
      } else {
        text += `${fullKey}: ${value}\n`;
      }
    }
    
    return text;
  }

  private csvToText(rows: string[][]): string {
    if (rows.length === 0) return '';
    
    const headers = rows[0];
    let text = `Headers: ${headers.join(', ')}\n\n`;
    
    rows.slice(1).forEach((row, index) => {
      text += `Row ${index + 1}:\n`;
      headers.forEach((header, colIndex) => {
        text += `  ${header}: ${row[colIndex] || ''}\n`;
      });
      text += '\n';
    });
    
    return text;
  }
}

// Type definitions
export interface ProcessedDocument {
  content: string;
  metadata: DocumentMetadata;
  chunks: DocumentChunk[];
}

export interface DocumentMetadata {
  filename: string;
  fileType: string;
  fileSize: number;
  processedAt: string;
  processingTimeMs?: number;
  wordCount?: number;
  characterCount?: number;
  sentenceCount?: number;
  paragraphCount?: number;
  language?: string;
  keyPhrases?: string[];
  readingLevel?: string;
  pdfPages?: number;
  rowCount?: number;
  columnCount?: number;
  documentType?: string;
  extractionMethod?: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  chunkType: 'semantic' | 'sliding_window' | 'fixed_size';
  wordCount: number;
  index: number;
}

// Singleton instance
export const advancedDocumentProcessor = new AdvancedDocumentProcessor();
