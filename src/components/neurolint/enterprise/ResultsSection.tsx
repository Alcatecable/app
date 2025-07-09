
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { LayerExecutionResult } from '@/lib/neurolint';
import { LAYER_CONFIGS } from '@/lib/neurolint/constants';

interface ResultsSectionProps {
  results: LayerExecutionResult | null;
  originalCode: string;
}

export function ResultsSection({ results, originalCode }: ResultsSectionProps) {
  if (!results) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No transformation results available. Please run a transformation first.
        </AlertDescription>
      </Alert>
    );
  }

  const successfulLayers = results.successfulLayers || 0;
  const totalLayers = results.results?.length || 1;
  const totalExecutionTime = results.totalExecutionTime || results.executionTime;
  const totalChanges = results.results?.reduce((sum, r) => sum + r.changeCount, 0) || results.changeCount;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transformation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {successfulLayers}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {totalLayers - successfulLayers}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(totalExecutionTime)}ms
              </div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {totalChanges}
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
            {(results.results || [results]).map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium">
                      Layer {result.layerId}: {LAYER_CONFIGS[result.layerId]?.name || 'Unknown'}
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
      
      {results.finalCode && results.finalCode !== originalCode && (
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
  );
}
