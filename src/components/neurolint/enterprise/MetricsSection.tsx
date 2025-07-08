
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart3, AlertTriangle } from 'lucide-react';
import { PerformanceMetrics } from '@/lib/neurolint/metrics';

interface MetricsSectionProps {
  performanceMetrics: PerformanceMetrics | null;
  onExportMetrics: () => void;
}

export function MetricsSection({ performanceMetrics, onExportMetrics }: MetricsSectionProps) {
  if (!performanceMetrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No metrics available yet. Run some transformations to see performance data.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance Metrics</h3>
        <Button onClick={onExportMetrics} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Metrics
        </Button>
      </div>

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
    </div>
  );
}
