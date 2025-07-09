import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  BarChart3,
  FileCode,
  Bug,
  Zap,
  ChevronDown,
  ChevronRight,
  Download,
  Share,
} from "lucide-react";

interface TestSession {
  id: string;
  code: string;
  testType: string;
  timestamp: Date;
  results: any;
  duration: number;
  status: "running" | "passed" | "failed" | "error";
}

interface TestResultsProps {
  sessions: TestSession[];
}

interface LayerResult {
  layerId: number;
  layerName: string;
  passed: boolean;
  duration: number;
  changes: number;
  issues: string[];
  before: string;
  after: string;
}

export const TestResults: React.FC<TestResultsProps> = ({ sessions }) => {
  const [selectedSession, setSelectedSession] = useState<TestSession | null>(
    sessions.length > 0 ? sessions[0] : null,
  );
  const [expandedLayers, setExpandedLayers] = useState<Set<number>>(new Set());

  const toggleLayerExpansion = (layerId: number) => {
    const newExpanded = new Set(expandedLayers);
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId);
    } else {
      newExpanded.add(layerId);
    }
    setExpandedLayers(newExpanded);
  };

  const getStatusIcon = (status: string, size = "h-4 w-4") => {
    switch (status) {
      case "passed":
        return <CheckCircle className={`${size} text-green-500`} />;
      case "failed":
        return <XCircle className={`${size} text-red-500`} />;
      case "error":
        return <AlertTriangle className={`${size} text-yellow-500`} />;
      case "running":
        return <Activity className={`${size} text-blue-500 animate-spin`} />;
      default:
        return <Activity className={`${size} text-gray-500`} />;
    }
  };

  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case "unit":
        return <FileCode className="h-4 w-4" />;
      case "integration":
        return <Activity className="h-4 w-4" />;
      case "performance":
        return <Zap className="h-4 w-4" />;
      case "edge-cases":
        return <AlertTriangle className="h-4 w-4" />;
      case "load":
        return <BarChart3 className="h-4 w-4" />;
      case "custom":
        return <Bug className="h-4 w-4" />;
      default:
        return <FileCode className="h-4 w-4" />;
    }
  };

  const calculateOverallStats = (session: TestSession) => {
    if (!session.results || session.status === "error") {
      return { passed: 0, failed: 1, total: 1, successRate: 0 };
    }

    const {
      layerResults = [],
      unitTestResults = [],
      integrationResults = [],
    } = session.results;

    let passed = 0;
    let total = 0;

    if (layerResults.length > 0) {
      passed += layerResults.filter((r: LayerResult) => r.passed).length;
      total += layerResults.length;
    }

    if (unitTestResults.length > 0) {
      passed += unitTestResults.filter((r: any) => r.passed).length;
      total += unitTestResults.length;
    }

    if (integrationResults.length > 0) {
      passed += integrationResults.filter((r: any) => r.passed).length;
      total += integrationResults.length;
    }

    const failed = total - passed;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    return { passed, failed, total, successRate };
  };

  const renderLayerResults = (layerResults: LayerResult[]) => {
    if (!layerResults || layerResults.length === 0) {
      return (
        <div className="text-muted-foreground">No layer results available</div>
      );
    }

    return (
      <div className="space-y-4">
        {layerResults.map((layer) => (
          <Card
            key={layer.layerId}
            className={`border-l-4 ${
              layer.passed ? "border-l-green-500" : "border-l-red-500"
            }`}
          >
            <Collapsible
              open={expandedLayers.has(layer.layerId)}
              onOpenChange={() => toggleLayerExpansion(layer.layerId)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(layer.passed ? "passed" : "failed")}
                      <div>
                        <CardTitle className="text-lg">
                          Layer {layer.layerId}: {layer.layerName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {layer.duration}ms
                          </span>
                          <span>{layer.changes} changes made</span>
                          {layer.issues.length > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              {layer.issues.length} issues
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={layer.passed ? "default" : "destructive"}>
                        {layer.passed ? "Passed" : "Failed"}
                      </Badge>
                      {expandedLayers.has(layer.layerId) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {layer.issues.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="font-semibold text-red-800 mb-2">
                        Issues Found:
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                        {layer.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {layer.before && layer.after && (
                    <div className="space-y-4">
                      <h5 className="font-semibold">Code Changes:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="text-sm font-medium mb-2 text-red-600">
                            Before:
                          </h6>
                          <pre className="text-xs bg-red-50 p-3 rounded border overflow-x-auto">
                            {layer.before}
                          </pre>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium mb-2 text-green-600">
                            After:
                          </h6>
                          <pre className="text-xs bg-green-50 p-3 rounded border overflow-x-auto">
                            {layer.after}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    );
  };

  const renderPerformanceMetrics = (performanceResults: any) => {
    if (!performanceResults) return null;

    const { metrics = {}, benchmarks = [] } = performanceResults;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.totalDuration || 0}ms
            </div>
            <div className="text-sm text-muted-foreground">Total Duration</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {metrics.memoryUsage || 0}MB
            </div>
            <div className="text-sm text-muted-foreground">Memory Peak</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.throughput || 0}
            </div>
            <div className="text-sm text-muted-foreground">Files/sec</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.accuracy || 0}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </Card>
        </div>

        {benchmarks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Benchmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {benchmarks.map((benchmark: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{benchmark.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32">
                        <Progress
                          value={(benchmark.score / benchmark.maxScore) * 100}
                        />
                      </div>
                      <span className="text-sm font-mono">
                        {benchmark.score}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const downloadResults = (session: TestSession) => {
    const data = {
      session: {
        id: session.id,
        testType: session.testType,
        timestamp: session.timestamp,
        duration: session.duration,
        status: session.status,
      },
      results: session.results,
      stats: calculateOverallStats(session),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neurolint-test-results-${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!selectedSession) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Test Results</h3>
          <p className="text-muted-foreground">
            Run a test to see detailed results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = calculateOverallStats(selectedSession);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getTestTypeIcon(selectedSession.testType)}
                Test Results -{" "}
                {selectedSession.testType.charAt(0).toUpperCase() +
                  selectedSession.testType.slice(1)}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedSession.timestamp.toLocaleString()}
                </span>
                <span>{selectedSession.duration}ms total</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadResults(selectedSession)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.passed}
              </div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.failed}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(stats.successRate)}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {stats.passed}/{stats.total}
              </span>
            </div>
            <Progress value={stats.successRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {sessions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>
              Click on a session to view its detailed results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sessions.map((session) => (
                <Button
                  key={session.id}
                  variant={
                    selectedSession.id === session.id ? "default" : "outline"
                  }
                  className="h-auto p-3 justify-start"
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {getStatusIcon(session.status)}
                    <div className="text-left">
                      <div className="text-sm font-medium">
                        {session.testType.charAt(0).toUpperCase() +
                          session.testType.slice(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="layers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="layers">Layer Results</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="details">Raw Details</TabsTrigger>
        </TabsList>

        <TabsContent value="layers">
          <Card>
            <CardHeader>
              <CardTitle>NeuroLint Layer Results</CardTitle>
              <CardDescription>
                Detailed results for each layer in the NeuroLint processing
                pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSession.results?.layerResults ? (
                renderLayerResults(selectedSession.results.layerResults)
              ) : (
                <div className="text-muted-foreground">
                  No layer results available for this test type.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Timing, memory usage, and throughput statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSession.results?.performanceResults ? (
                renderPerformanceMetrics(
                  selectedSession.results.performanceResults,
                )
              ) : (
                <div className="text-muted-foreground">
                  No performance metrics available for this test type.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Raw Test Data</CardTitle>
              <CardDescription>
                Complete test results in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto max-h-96">
                {JSON.stringify(selectedSession.results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
