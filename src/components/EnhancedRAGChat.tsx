
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedRAG } from '@/hooks/useAdvancedRAG';
import { MessageSquare, Search, Settings, Filter } from 'lucide-react';

interface EnhancedRAGChatProps {
  projectId: string;
}

const EnhancedRAGChat: React.FC<EnhancedRAGChatProps> = ({ projectId }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    documentTypes: [] as string[],
    confidence: 0.7,
    maxResults: 5,
  });
  
  const { advancedSearch, isLoading } = useAdvancedRAG();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    const results = await advancedSearch(query, projectId, {
      confidence: filters.confidence,
    });
    
    setSearchResults(results);
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Enhanced RAG Chat
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {showFilters && (
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Confidence Threshold: {filters.confidence}</label>
                <Slider
                  value={[filters.confidence]}
                  onValueChange={([value]) => setFilters(prev => ({ ...prev, confidence: value }))}
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Document Types</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Documents</SelectItem>
                    <SelectItem value="word">Word Documents</SelectItem>
                    <SelectItem value="powerpoint">Presentations</SelectItem>
                    <SelectItem value="excel">Spreadsheets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your documents..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {searchResults && (
          <div className="flex-1 space-y-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">AI Response</h3>
                  <Badge variant="secondary">
                    Confidence: {Math.round(searchResults.confidence * 100)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{searchResults.answer}</p>
                <div className="mt-4 text-sm text-muted-foreground">
                  Processed in {searchResults.processingTime}ms
                </div>
              </CardContent>
            </Card>

            {searchResults.sources.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-medium">Sources ({searchResults.sources.length})</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {searchResults.sources.map((source: any, index: number) => (
                      <div key={source.id} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{source.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(source.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {source.snippet}
                        </p>
                        {source.page && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Page {source.page}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedRAGChat;
