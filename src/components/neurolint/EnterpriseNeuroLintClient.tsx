
import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NeuroLintOrchestrator, LayerExecutionResult, TransformationResult } from '@/lib/neurolint';
import { logger } from '@/lib/neurolint/logger';
import { metrics, PerformanceMetrics } from '@/lib/neurolint/metrics';

// Import refactored components
import { NeuroLintHeader } from './enterprise/NeuroLintHeader';
import { RealTimeProgress } from './enterprise/RealTimeProgress';
import { InputSection } from './enterprise/InputSection';
import { AnalysisSection } from './enterprise/AnalysisSection';
import { ConfigurationSection } from './enterprise/ConfigurationSection';
import { ResultsSection } from './enterprise/ResultsSection';
import { MetricsSection } from './enterprise/MetricsSection';
import { LogsSection } from './enterprise/LogsSection';

interface EnterpriseNeuroLintClientProps {
  className?: string;
}

// Convert TransformationResult to LayerExecutionResult format
function convertToLayerExecutionResult(result: TransformationResult): LayerExecutionResult {
  return {
    layerId: 0, // Summary result
    layerName: 'Complete Transformation',
    success: result.results.every(r => r.success),
    executionTime: result.totalExecutionTime,
    changeCount: result.results.reduce((sum, r) => sum + r.changeCount, 0),
    originalCode: result.originalCode,
    modifiedCode: result.finalCode,
    transformedCode: result.finalCode,
    improvements: result.results.flatMap(r => r.improvements || []),
  };
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
    const interval = setInterval(loadMetrics, 5000);
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
      
      // Convert TransformationResult to LayerExecutionResult
      const convertedResult = convertToLayerExecutionResult(result);
      setResults(convertedResult);
      setExecutionHistory(prev => [convertedResult, ...prev.slice(0, 9)]);
      setActiveTab('results');

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

  const getSuccessRate = () => {
    if (!performanceMetrics || performanceMetrics.totalExecutions === 0) return 0;
    return Math.round((performanceMetrics.successfulExecutions / performanceMetrics.totalExecutions) * 100);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <NeuroLintHeader 
          sessionId={logger.getSessionId()} 
          successRate={getSuccessRate()} 
        />
        <RealTimeProgress 
          isProcessing={isProcessing} 
          progress={realTimeProgress} 
        />
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
          <InputSection
            code={code}
            setCode={setCode}
            isProcessing={isProcessing}
            onAnalyze={handleAnalyze}
            onTransform={handleTransform}
          />
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <AnalysisSection analysis={analysis} />
        </TabsContent>
        
        <TabsContent value="config" className="space-y-4">
          <ConfigurationSection
            selectedLayers={selectedLayers}
            onLayerToggle={handleLayerToggle}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <ResultsSection results={results} originalCode={code} />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <MetricsSection
            performanceMetrics={performanceMetrics}
            onExportMetrics={handleExportMetrics}
          />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <LogsSection
            executionHistory={executionHistory}
            onExportLogs={handleExportLogs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
