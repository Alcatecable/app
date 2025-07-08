
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { DetectedIssue } from '@/lib/neurolint';

interface AnalysisSectionProps {
  analysis: any;
}

export function AnalysisSection({ analysis }: AnalysisSectionProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No analysis available. Please analyze your code first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
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
  );
}
