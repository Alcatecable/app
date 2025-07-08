import { useState, useCallback, useEffect } from 'react';
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
  Download,
  BarChart3,
  History,
  Shield,
  Cpu
} from 'lucide-react';
import { NeuroLintOrchestrator, LayerExecutionResult, DetectedIssue } from '@/lib/neurolint';
import { LAYER_EXECUTION_ORDER } from '@/lib/neurolint/constants';
import { logger } from '@/lib/neurolint/logger';
import { metrics, PerformanceMetrics } from '@/lib/neurolint/metrics';

interface EnterpriseNeuroLintClientProps {
  className?: string;
}

export function EnterpriseNeuroLintClient({ className }: EnterpriseNeuroLintClientProps) {
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<LayerExecutionResult | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<number[]>([1, 2, 3, 4]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('input');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [executionHistory, setExecutionHistory] = useState<LayerExecutionResult[]>([]);
  const [realTimeProgress, setRealTimeProgress] = useState<{ step: number; total: number; current: string }>({
    step: 0,
    total: 0,
    current: ''
  });

  // Load metrics on component mount
  useEffect(() => {
    const loadMetrics = () => {
      const metricsData = metrics.getPerformanceMetrics();
      setPerformanceMetrics(metricsData);
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) return;
    
    try {
      setIsProcessing(true);
      const analysisResult = NeuroLintOrchestrator.analyze(code);
      setAnalysis(analysisResult);
      setActiveTab('analysis');
    } catch (error) {
      logger.error('Analysis failed', error as Error);
    } finally {
      setIsProcessing(false);
    }
  }, [code]);

  const handleTransform = useCallback(async () => {
    if (!code.trim()) return;
    
    setIsProcessing(true);
    setRealTimeProgress({ step: 0, total: selectedLayers.length, current: 'Initializing...' });
    
    try {
      // Simulate progress updates (in real implementation, this would come from the orchestrator)
      const progressInterval = setInterval(() => {
        setRealTimeProgress(prev => ({
          ...prev,
          step: Math.min(prev.step + 1, prev.total),
          current: `Processing Layer ${Math.min(prev.step + 1, prev.total)}...`
        }));
      }, 2000);

      const result = await NeuroLintOrchestrator.transform(code, selectedLayers, {
        verbose: true,
        dryRun: false
      });

      clearInterval(progressInterval);
      setResults(result);
      setExecutionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 executions
      setActiveTab('results');

      // Update metrics
      const updatedMetrics = metrics.getPerformanceMetrics();
      setPerformanceMetrics(updatedMetrics);

    } catch (error) {
      logger.error('Transformation failed', error as Error);
    } finally {
      setIsProcessing(false);
      setRealTimeProgress({ step: 0, total: 0, current: '' });
    }
  }, [code, selectedLayers]);

  const handleLayerToggle = (layerId: number, checked: boolean) => {
    if (checked) {
      setSelectedLayers(prev => [...prev, layerId].sort());
    } else {
      setSelectedLayers(prev => prev.filter(id => id !== layerId));
    }
  };

  const handleExportLogs = () => {
    const logsData = logger.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurolint-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportMetrics = () => {
    const metricsData = JSON.stringify(performanceMetrics, null, 2);
    const blob = new Blob([metricsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurolint-metrics-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSuccessRate = () => {
    if (!performanceMetrics || performanceMetrics.totalExecutions === 0) return 0;
    return Math.round((performanceMetrics.successfulExecutions / performanceMetrics.totalExecutions) * 100);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with real-time status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Enterprise NeuroLint Orchestration</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Session: {logger.getSessionId().slice(-8)}
              </Badge>
              {performanceMetrics && (
                <Badge variant={getSuccessRate() > 90 ? 'default' : 'destructive'}>
                  Success Rate: {getSuccessRate()}%
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Production-ready code analysis and transformation with comprehensive monitoring
          </CardDescription>
        </CardHeader>
        
        {/* Real-time progress */}
        {isProcessing && realTimeProgress.total > 0 && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{realTimeProgress.current}</span>
                <span>{realTimeProgress.step}/{realTimeProgress.total}</span>
              </div>
              <Progress value={(realTimeProgress.step / realTimeProgress.total) * 100} />
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="logs">Logs & History</TabsTrigger>
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
            <div className="text-xs text-muted-foreground">
              Characters: {code.length} | Max: 1,000,000
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleAnalyze} variant="outline" disabled={!code.trim() || isProcessing}>
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

        <TabsContent value="metrics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
            <Button onClick={handleExportMetrics} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Metrics
            </Button>
          </div>

          {performanceMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Execution Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{performanceMetrics.totalExecutions}</div>
                      <div className="text-sm text-muted-foreground">Total Executions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(performanceMetrics.averageExecutionTime)}ms</div>
                      <div className="text-sm text-muted-foreground">Avg Duration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Layer Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(performanceMetrics.layerMetrics).map(([layerId, metrics]) => (
                      <div key={layerId} className="flex justify-between items-center p-2 border rounded">
                        <span className="font-medium">Layer {layerId}</span>
                        <div className="text-sm text-muted-foreground">
                          {metrics.executions} executions • {Math.round(metrics.averageTime)}ms avg
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No metrics available yet. Run some transformations to see performance data.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Execution History & Logs</h3>
            <Button onClick={handleExportLogs} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>

          {executionHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {executionHistory.map((execution, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {execution.successfulLayers === execution.results.length ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        )}
                        <span className="font-medium">
                          {execution.successfulLayers}/{execution.results.length} layers successful
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(execution.totalExecutionTime)}ms
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
