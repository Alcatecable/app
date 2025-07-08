
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, History, CheckCircle, AlertTriangle } from 'lucide-react';
import { LayerExecutionResult } from '@/lib/neurolint';

interface LogsSectionProps {
  executionHistory: LayerExecutionResult[];
  onExportLogs: () => void;
}

export function LogsSection({ executionHistory, onExportLogs }: LogsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Execution History & Logs</h3>
        <Button onClick={onExportLogs} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {executionHistory.length > 0 ? (
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
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No execution history available yet.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
