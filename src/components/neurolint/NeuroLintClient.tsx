
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  Download, 
  Copy, 
  RotateCcw, 
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { NeuroLintOrchestrator } from '@/lib/neurolint/orchestrator';
import { SmartLayerSelector } from '@/lib/neurolint/smart-selector';
import { TransformationResult } from '@/lib/neurolint/types';

const LAYER_CONFIGS = [
  { id: 1, name: 'Configuration', description: 'TypeScript, Next.js, package.json fixes', color: 'bg-blue-500' },
  { id: 2, name: 'Pattern Recognition', description: 'HTML entities, imports, quotes', color: 'bg-green-500' },
  { id: 3, name: 'Component Enhancement', description: 'Button props, form structure, keys', color: 'bg-purple-500' },
  { id: 4, name: 'Hydration & SSR', description: 'Client-side guards, theme providers', color: 'bg-orange-500' },
  { id: 5, name: 'Next.js App Router', description: '"use client", import fixes', color: 'bg-red-500' },
  { id: 6, name: 'Testing & Validation', description: 'Error boundaries, accessibility', color: 'bg-indigo-500' }
];

export default function NeuroLintClient() {
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [smartMode, setSmartMode] = useState(true);
  const [progress, setProgress] = useState(0);

  const handleLayerToggle = (layerId: number) => {
    if (smartMode) return; // Disable manual selection in smart mode
    
    setSelectedLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const processCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to analyze');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      let layersToUse = selectedLayers;

      if (smartMode) {
        const recommendations = await SmartLayerSelector.recommendLayers(code);
        layersToUse = recommendations;
        toast.info(`Smart mode selected ${recommendations.length} layers`);
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const transformationResult = await NeuroLintOrchestrator.processCode(code, {
        selectedLayers: layersToUse,
        enablePatternLearning: true
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(transformationResult);

      if (transformationResult.successfulLayers > 0) {
        toast.success(`Successfully applied ${transformationResult.successfulLayers} layers`);
      } else {
        toast.warning('No changes were made to your code');
      }

    } catch (error) {
      console.error('Processing failed:', error);
      toast.error('Failed to process code. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadCode = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  const resetForm = () => {
    setCode('');
    setResult(null);
    setSelectedLayers([1, 2, 3, 4, 5, 6]);
    setSmartMode(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">NeuroLint Code Processor</h1>
        <p className="text-muted-foreground">
          Intelligent multi-layer code analysis and optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Input Code
            </CardTitle>
            <CardDescription>
              Paste your code below for analysis and optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your TypeScript/JavaScript code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />

            {/* Layer Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Layer Configuration</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant={smartMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSmartMode(!smartMode)}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Smart Mode
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLayers(smartMode ? [] : [1, 2, 3, 4, 5, 6])}
                    disabled={smartMode}
                  >
                    Select All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LAYER_CONFIGS.map((layer) => (
                  <div
                    key={layer.id}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-all
                      ${selectedLayers.includes(layer.id) || smartMode
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                      }
                      ${smartMode ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    onClick={() => !smartMode && handleLayerToggle(layer.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${layer.color}`} />
                      <span className="text-sm font-medium">{layer.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {layer.description}
                    </p>
                  </div>
                ))}
              </div>

              {smartMode && (
                <Alert>
                  <Zap className="w-4 h-4" />
                  <AlertDescription>
                    Smart mode automatically selects the most relevant layers based on your code analysis.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={processCode} 
                disabled={isProcessing || !code.trim()}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Process Code
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing layers...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Results
            </CardTitle>
            <CardDescription>
              Analysis results and optimized code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {result.successfulLayers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Successful Layers
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.results?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Changes
                      </div>
                    </div>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-semibold">
                      {result.totalExecutionTime?.toFixed(2) || 0}ms
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Processing Time
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Layer Results</h4>
                    {result.results?.map((layerResult, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {layerResult.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm">{layerResult.layerName}</span>
                        </div>
                        <Badge variant={layerResult.success ? "default" : "destructive"}>
                          {layerResult.changeCount || 0} changes
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="space-y-3">
                    {result.results?.map((layerResult, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Layer {layerResult.layerId}: {layerResult.layerName}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm text-muted-foreground">
                                {layerResult.executionTime?.toFixed(2)}ms
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {layerResult.success ? (
                            <div className="space-y-2">
                              <p className="text-sm text-green-600">
                                Successfully applied {layerResult.changeCount} changes
                              </p>
                              {layerResult.improvements && layerResult.improvements.length > 0 && (
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {layerResult.improvements.map((improvement, i) => (
                                    <li key={i}>• {improvement}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-red-600">
                              {layerResult.error || 'Layer execution failed'}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="code" className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.finalCode || '')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCode('optimized-code.ts', result.finalCode || '')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  
                  <Textarea
                    value={result.finalCode || ''}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Process your code to see results here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
