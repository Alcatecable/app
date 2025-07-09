
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
  Download, 
  Copy, 
  RotateCcw, 
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Settings,
  Activity,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { NeuroLintOrchestrator } from '@/lib/neurolint/orchestrator';
import { TransformationResult } from '@/lib/neurolint/types';

const LAYER_CONFIGS = [
  { id: 1, name: 'Configuration', description: 'TypeScript, Next.js, package.json optimization' },
  { id: 2, name: 'Pattern Recognition', description: 'HTML entities, imports, and code patterns' },
  { id: 3, name: 'Component Enhancement', description: 'React components and Button variants' },
  { id: 4, name: 'Hydration & SSR', description: 'Client-side guards and theme providers' },
  { id: 5, name: 'Next.js App Router', description: 'Use client placement and import cleanup' },
  { id: 6, name: 'Testing & Validation', description: 'Error boundaries and accessibility' },
  { id: 7, name: 'Adaptive Learning', description: 'Apply learned patterns from previous transformations' }
];

export default function NeuroLintClient() {
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [progress, setProgress] = useState(0);

  const handleLayerToggle = (layerId: number) => {
    setSelectedLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId].sort()
    );
  };

  const processCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter code to analyze');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const transformationResult = await NeuroLintOrchestrator.transform(code, selectedLayers, {
        verbose: true,
        dryRun: false
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
  };

  const selectAllLayers = () => {
    setSelectedLayers([1, 2, 3, 4, 5, 6, 7]);
  };

  const clearAllLayers = () => {
    setSelectedLayers([]);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="border-b pb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Code Analysis</h1>
        <p className="mt-1 text-sm text-gray-600">
          Multi-layer code transformation and optimization
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
              <FileText className="h-5 w-5" />
              <span>Code Input</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your code for analysis and transformation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your TypeScript, JavaScript, or React code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />

            {/* Layer Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Layer Configuration</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAllLayers}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllLayers}>
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {LAYER_CONFIGS.map((layer) => (
                  <div
                    key={layer.id}
                    className={`
                      cursor-pointer rounded-lg border p-3 transition-colors
                      ${selectedLayers.includes(layer.id)
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    onClick={() => handleLayerToggle(layer.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedLayers.includes(layer.id)}
                        onChange={() => handleLayerToggle(layer.id)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Layer {layer.id}: {layer.name}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      {layer.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>{selectedLayers.length}</strong> layers selected for transformation
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                onClick={processCode} 
                disabled={isProcessing || !code.trim() || selectedLayers.length === 0}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Transform Code
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Processing layers...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
              <Database className="h-5 w-5" />
              <span>Transformation Results</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Analysis results and transformed code output
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="details">Layer Details</TabsTrigger>
                  <TabsTrigger value="code">Transformed Code</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-2xl font-semibold text-green-600">
                        {result.successfulLayers}
                      </div>
                      <div className="text-sm text-gray-600">
                        Successful Layers
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-2xl font-semibold text-blue-600">
                        {result.results?.reduce((sum, r) => sum + (r.changeCount || 0), 0) || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Changes
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {result.totalExecutionTime?.toFixed(2) || 0}ms
                    </div>
                    <div className="text-sm text-gray-600">
                      Processing Time
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Layer Results</h4>
                    {result.results?.map((layerResult, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center space-x-2">
                          {layerResult.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm text-gray-900">
                            Layer {layerResult.layerId}: {layerResult.layerName || `Layer ${layerResult.layerId}`}
                          </span>
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
                      <Card key={index} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base text-gray-900">
                              Layer {layerResult.layerId}: {layerResult.layerName || `Layer ${layerResult.layerId}`}
                            </CardTitle>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{layerResult.executionTime?.toFixed(2)}ms</span>
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
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {layerResult.improvements.map((improvement, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>{improvement}</span>
                                    </li>
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
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.finalCode || '')}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCode('transformed-code.js', result.finalCode || '')}
                    >
                      <Download className="mr-2 h-4 w-4" />
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
              <div className="py-12 text-center">
                <Settings className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">
                  Transform your code to see results here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
