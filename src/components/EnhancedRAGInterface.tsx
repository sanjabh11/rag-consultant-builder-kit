
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Brain, 
  Zap, 
  Settings, 
  Database,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAdvancedRAGPipeline } from '@/hooks/useAdvancedRAGPipeline';
import { useCostTracking } from '@/hooks/useCostTracking';

interface EnhancedRAGInterfaceProps {
  projectId: string;
}

const EnhancedRAGInterface: React.FC<EnhancedRAGInterfaceProps> = ({ projectId }) => {
  const { processQuery, isProcessing, pipelineConfig, updatePipelineConfig } = useAdvancedRAGPipeline(projectId);
  const { trackQuery } = useCostTracking();
  
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    const startTime = Date.now();
    const response = await processQuery(query, {
      maxSources: 5,
      confidenceThreshold: 0.6,
      useMultipleStores: true
    });
    
    if (response) {
      setResult(response);
      const complexity = response.processingTime > 1000 ? 'complex' : 'simple';
      trackQuery(complexity);
    }
  };

  const handleConfigUpdate = (key: string, value: any) => {
    updatePipelineConfig({ [key]: value });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Enhanced RAG Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about your documents..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Pipeline Settings
            </Button>
            
            <Button 
              onClick={handleSearch}
              disabled={!query.trim() || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              RAG Pipeline Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Chunking Settings</h4>
                <div>
                  <Label htmlFor="chunk-size">Chunk Size: {pipelineConfig.chunkSize}</Label>
                  <Input
                    id="chunk-size"
                    type="range"
                    min="500"
                    max="2000"
                    step="100"
                    value={pipelineConfig.chunkSize}
                    onChange={(e) => handleConfigUpdate('chunkSize', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="chunk-overlap">Chunk Overlap: {pipelineConfig.chunkOverlap}</Label>
                  <Input
                    id="chunk-overlap"
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={pipelineConfig.chunkOverlap}
                    onChange={(e) => handleConfigUpdate('chunkOverlap', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Search Features</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hybrid-search">Hybrid Search</Label>
                  <Switch
                    id="hybrid-search"
                    checked={pipelineConfig.hybridSearch}
                    onCheckedChange={(checked) => handleConfigUpdate('hybridSearch', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reranking">Result Reranking</Label>
                  <Switch
                    id="reranking"
                    checked={pipelineConfig.reranking}
                    onCheckedChange={(checked) => handleConfigUpdate('reranking', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="multi-query">Multi-Query Expansion</Label>
                  <Switch
                    id="multi-query"
                    checked={pipelineConfig.multiQuery}
                    onCheckedChange={(checked) => handleConfigUpdate('multiQuery', checked)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Vector Stores</h4>
              <div className="space-y-2">
                {pipelineConfig.vectorStores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{store.name}</div>
                        <div className="text-sm text-gray-600">{store.type}</div>
                      </div>
                    </div>
                    <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                      {store.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Answer */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Answer</h4>
              <p className="text-gray-800">{result.answer}</p>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {result.processingTime}ms
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span className={getConfidenceColor(result.confidence)}>
                  {result.confidence.toFixed(1)}% confidence
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                {result.vectorStoreUsed}
              </div>
            </div>

            {/* Sources */}
            <div>
              <h4 className="font-medium mb-3">Sources ({result.sources.length})</h4>
              <div className="space-y-3">
                {result.sources.map((source: any, index: number) => (
                  <div key={source.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">
                        {source.metadata.fileName}
                      </div>
                      <Badge variant="outline">
                        {(source.score * 100).toFixed(1)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {source.content}
                    </p>
                    {source.metadata.chunkIndex !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        Chunk {source.metadata.chunkIndex + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedRAGInterface;
