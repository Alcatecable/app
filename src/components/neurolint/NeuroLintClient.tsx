
import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play, 
  Zap, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Code,
  FileText,
  Layers
} from 'lucide-react';
import { NeuroLintOrchestrator, LayerExecutionResult, DetectedIssue } from '@/lib/neurolint';
import { LAYER_EXECUTION_ORDER } from '@/lib/neurolint/constants';

interface NeuroLintClientProps {
  className?: string;
}

export function NeuroLintClient({ className }: NeuroLintClientProps) {
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<LayerExecutionResult | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<number[]>([1, 2, 3, 4]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('input');

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) return;
    
    try {
      const analysisResult = NeuroLintOrchestrator.analyze(code);
      setAnalysis(analysisResult);
      setActiveTab('analysis');
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  }, [code]);

  const handleTransform = useCallback(async () => {
    if (!code.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await NeuroLintOrchestrator.transform(code, selectedLayers, {
        verbose: true,
        dryRun: false
      });
      setResults(result);
      setActiveTab('results');
    } catch (error) {
      console.error('Transformation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [code, selectedLayers]);

  const handleLayerToggle = (layerId: number, checked: boolean) => {
    if (checked) {
      setSelectedLayers(prev => [...prev, layerId].sort());
    } else {
      setSelectedLayers(prev => prev.filter(id => id !== layerId));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            NeuroLint Orchestration Client
          </CardTitle>
          <CardDescription>
            Advanced code analysis and transformation with multi-layer processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="input" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code Input</label>
                <Textarea
                  placeholder="Paste your code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAnalyze} variant="outline" disabled={!code.trim()}>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Code
                </Button>
                <Button onClick={handleTransform} disabled={!code.trim() || isProcessing}>
                  {isProcessing ? (
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isProcessing ? 'Processing...' : 'Transform Code'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-4">
              {analysis ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Confidence: {Math.round(analysis.confidence * 100)}% • 
                      Impact: {analysis.estimatedImpact.level} • 
                      Estimated time: {analysis.estimatedImpact.estimatedFixTime}
                    </AlertDescription>
                  </Alert>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detected Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.detectedIssues.map((issue: DetectedIssue, index: number) => (
                          <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={getSeverityColor(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                                <span className="font-medium">{issue.pattern}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{issue.description}</p>
                            </div>
                            <Badge variant="outline">Layer {issue.fixedByLayer}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">Suggested Layers: {analysis.recommendedLayers.join(', ')}</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {analysis.reasoning.map((reason: string, index: number) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No analysis available. Please analyze your code first.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Layer Configuration</CardTitle>
                  <CardDescription>
                    Select which layers to execute during transformation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {LAYER_EXECUTION_ORDER.map((layer) => (
                      <div key={layer.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`layer-${layer.id}`}
                          checked={selectedLayers.includes(layer.id)}
                          onCheckedChange={(checked) => 
                            handleLayerToggle(layer.id, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`layer-${layer.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">Layer {layer.id}: {layer.name}</div>
                          <div className="text-sm text-muted-foreground">{layer.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4">
              {results ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Transformation Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {results.successfulLayers}
                          </div>
                          <div className="text-sm text-muted-foreground">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {results.results.length - results.successfulLayers}
                          </div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {Math.round(results.totalExecutionTime)}ms
                          </div>
                          <div className="text-sm text-muted-foreground">Total Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {results.results.reduce((sum, r) => sum + r.changeCount, 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Changes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Layer Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.results.map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {result.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                              )}
                              <div>
                                <div className="font-medium">
                                  Layer {result.layerId}: {LAYER_EXECUTION_ORDER.find(l => l.id === result.layerId)?.name}
                                </div>
                                {result.error && (
                                  <div className="text-sm text-red-600">{result.error}</div>
                                )}
                                {result.improvements && result.improvements.length > 0 && (
                                  <div className="text-sm text-green-600">
                                    {result.improvements.join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <div>{Math.round(result.executionTime)}ms</div>
                              <div>{result.changeCount} changes</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {results.finalCode !== code && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Transformed Code</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={results.finalCode}
                          readOnly
                          rows={10}
                          className="font-mono text-sm"
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No transformation results available. Please run a transformation first.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
