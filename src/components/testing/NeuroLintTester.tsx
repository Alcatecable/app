import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  TestTube,
  Activity,
  Target,
  Zap,
  Code,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { CodeInput } from "./CodeInput";
import { TestResults } from "./TestResults";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { TestRunner } from "@/lib/neurolint/test-runner/core";
import { performanceBenchmarks } from "@/lib/neurolint/performance-benchmarks";

interface TestSession {
  id: string;
  code: string;
  testType: string;
  timestamp: Date;
  results: any;
  duration: number;
  status: "running" | "passed" | "failed" | "error";
}

export const NeuroLintTester: React.FC = () => {
  const [activeTab, setActiveTab] = useState("code-test");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<string>("");
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [userCode, setUserCode] = useState("");
  const [selectedTestType, setSelectedTestType] = useState("unit");

  const testRunner = new TestRunner();

  const handleRunTests = useCallback(
    async (testType: string, code?: string) => {
      setIsRunning(true);
      setProgress(0);
      setCurrentTest("Initializing test suite...");

      const sessionId = `test-${Date.now()}`;
      const startTime = Date.now();

      try {
        let results;

        switch (testType) {
          case "unit":
            results = await testRunner.runUnitTests((progress, testName) => {
              setProgress(progress);
              setCurrentTest(testName);
            });
            break;
          case "integration":
            results = await testRunner.runIntegrationTests((progress, testName) => {
              setProgress(progress);
              setCurrentTest(testName);
            });
            break;
          case "performance":
            results = await performanceBenchmarks.runFullBenchmark((progress, testName) => {
              setProgress(progress);
              setCurrentTest(testName);
            });
            break;
          case "edge-cases":
            results = await testRunner.runEdgeCaseTests((progress, testName) => {
              setProgress(progress);
              setCurrentTest(testName);
            });
            break;
          case "load":
            results = await testRunner.runLoadTests((progress, testName) => {
              setProgress(progress);
              setCurrentTest(testName);
            });
            break;
          case "custom":
            if (!code) throw new Error("No code provided for custom test");
            results = await testRunner.runCustomCodeTest(code, (progress, testName) => {
              setProgress(progress);
              setCurrentTest(testName);
            });
            break;
          default:
            throw new Error(`Unknown test type: ${testType}`);
        }

        const duration = Date.now() - startTime;
        const session: TestSession = {
          id: sessionId,
          code: code || "",
          testType,
          timestamp: new Date(),
          results,
          duration,
          status: results.passed ? "passed" : "failed",
        };

        setTestSessions((prev) => [session, ...prev.slice(0, 9)]);
        setProgress(100);
        setCurrentTest("Tests completed!");
      } catch (error) {
        console.error("Test execution failed:", error);
        const session: TestSession = {
          id: sessionId,
          code: code || "",
          testType,
          timestamp: new Date(),
          results: { error: error.message, passed: false },
          duration: Date.now() - startTime,
          status: "error",
        };
        setTestSessions((prev) => [session, ...prev.slice(0, 9)]);
      } finally {
        setIsRunning(false);
        setTimeout(() => {
          setProgress(0);
          setCurrentTest("");
        }, 2000);
      }
    },
    [testRunner],
  );

  const handleRunCustomTest = useCallback(() => {
    if (!userCode.trim()) {
      alert("Please enter some code to test");
      return;
    }
    handleRunTests("custom", userCode);
  }, [userCode, handleRunTests]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "running":
        return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-sm">
          v2.0 Testing Suite
        </Badge>
      </div>

      {isRunning && (
        <Alert className="border-blue-200 bg-blue-50">
          <Activity className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>{currentTest}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="code-test" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Custom Code
          </TabsTrigger>
          <TabsTrigger value="unit" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Unit Tests
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Integration
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="edge-cases" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Edge Cases
          </TabsTrigger>
          <TabsTrigger value="load" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Load Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code-test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Custom Code Testing
              </CardTitle>
              <CardDescription>
                Paste your own code below to test it against all 7 NeuroLint
                layers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CodeInput
                value={userCode}
                onChange={setUserCode}
                placeholder="// Paste your JavaScript/TypeScript/React code here
const MyComponent = () => {
  const [items, setItems] = useState([]);

  return (
    <div>
      {items.map(item => (
        <div>{item.name}</div>
      ))}
    </div>
  );
};"
              />
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleRunCustomTest}
                  disabled={isRunning || !userCode.trim()}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Run NeuroLint Analysis
                </Button>
                <Badge variant="secondary">{userCode.length} characters</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Unit Tests - All 7 Layers
              </CardTitle>
              <CardDescription>
                Individual tests for each NeuroLint layer to ensure core
                functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">7</div>
                  <div className="text-sm text-muted-foreground">Layers</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">120+</div>
                  <div className="text-sm text-muted-foreground">
                    Unit Tests
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">95%</div>
                  <div className="text-sm text-muted-foreground">Coverage</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">~30s</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              </div>
              <Button
                onClick={() => handleRunTests("unit")}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Run Unit Tests
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Integration Tests - Orchestration Flow
              </CardTitle>
              <CardDescription>
                End-to-end testing of the complete NeuroLint orchestration
                system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Pipeline Flow</h4>
                    <p className="text-sm text-muted-foreground">
                      Tests complete layer-to-layer execution
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Error Recovery</h4>
                    <p className="text-sm text-muted-foreground">
                      Validates fallback mechanisms
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">State Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Ensures consistent state across layers
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleRunTests("integration")}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Run Integration Tests
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Benchmarks
              </CardTitle>
              <CardDescription>
                Measure processing speed, memory usage, and throughput across
                all layers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceMetrics />
              <Button
                onClick={() => handleRunTests("performance")}
                disabled={isRunning}
                className="flex items-center gap-2 mt-4"
              >
                <Play className="h-4 w-4" />
                Run Performance Benchmarks
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edge-cases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Edge Case Testing
              </CardTitle>
              <CardDescription>
                Test malformed code, unusual patterns, and boundary conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Malformed Syntax</h4>
                  <p className="text-sm text-muted-foreground">
                    Invalid JavaScript/TypeScript code
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Complex Patterns</h4>
                  <p className="text-sm text-muted-foreground">
                    Nested components and deep structures
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Empty Files</h4>
                  <p className="text-sm text-muted-foreground">
                    Boundary conditions and minimal input
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Large Files</h4>
                  <p className="text-sm text-muted-foreground">
                    Memory and performance limits
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleRunTests("edge-cases")}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Run Edge Case Tests
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="load" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Load Testing - Large Codebases
              </CardTitle>
              <CardDescription>
                Test performance and stability with large codebases and
                concurrent processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      1000+
                    </div>
                    <div className="text-sm text-muted-foreground">Files</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      10MB+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Codebase
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      50+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Concurrent
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      5min
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Duration
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleRunTests("load")}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Run Load Tests
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {testSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Test Sessions
            </CardTitle>
            <CardDescription>
              History of your recent test runs and results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(session.status)}
                    <div>
                      <div className="font-semibold">
                        {session.testType.charAt(0).toUpperCase() +
                          session.testType.slice(1)}{" "}
                        Test
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {session.timestamp.toLocaleString()}
                        <Separator orientation="vertical" className="h-3" />
                        {session.duration}ms
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        session.status === "passed" ? "default" : "destructive"
                      }
                    >
                      {session.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Show detailed results in modal or expand
                      }}
                    >
                      View Results
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {testSessions.length > 0 && <TestResults sessions={testSessions} />}
    </div>
  );
};
