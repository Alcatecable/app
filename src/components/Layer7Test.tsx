import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, RefreshCw, FileText } from "lucide-react";
import { NeuroLintOrchestrator } from "@/lib/neurolint/orchestrator";
import { patternLearner } from "@/lib/neurolint/pattern-learner";

export function Layer7Test() {
  const [testCode, setTestCode] = useState(`import { useState } from 'react';

function TestComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}`);

  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [learningStats, setLearningStats] = useState<any>(null);

  const runTest = async () => {
    setIsProcessing(true);
    try {
      // First, run layers 5 and 6 to generate learning data
      console.log("🎯 Running Layers 5-6 to generate learning patterns...");
      const trainingResult = await NeuroLintOrchestrator.transform(
        testCode,
        [5, 6],
        {
          verbose: true,
          dryRun: false,
        },
      );

      // Then run Layer 7 to apply learned patterns
      console.log("🧠 Running Layer 7 to apply learned patterns...");
      const layer7Result = await NeuroLintOrchestrator.transform(
        testCode,
        [7],
        {
          verbose: true,
          dryRun: false,
        },
      );

      // Get learning statistics
      const stats = patternLearner.getStatistics();

      setResults({
        training: trainingResult,
        layer7: layer7Result,
        originalCode: testCode,
      });

      setLearningStats(stats);
    } catch (error) {
      console.error("Layer 7 test failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearLearning = () => {
    patternLearner.clearRules();
    setLearningStats(patternLearner.getStatistics());
    setResults(null);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Layer 7: Adaptive Pattern Learning Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Code:</label>
            <Textarea
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={runTest}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {isProcessing ? "Processing..." : "Run Layer 7 Test"}
            </Button>

            <Button
              variant="outline"
              onClick={clearLearning}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Clear Learning
            </Button>
          </div>

          {learningStats && (
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-4">
                <h4 className="font-medium text-purple-900 mb-2">
                  Learning Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700">Total Rules:</span>
                    <div className="font-bold text-purple-900">
                      {learningStats.totalRules}
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-700">Avg Confidence:</span>
                    <div className="font-bold text-purple-900">
                      {(learningStats.averageConfidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-700">Applications:</span>
                    <div className="font-bold text-purple-900">
                      {learningStats.totalApplications}
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-700">Rules by Layer:</span>
                    <div className="font-bold text-purple-900">
                      {Object.entries(learningStats.rulesByLayer).map(
                        ([layer, count]) => (
                          <Badge
                            key={layer}
                            variant="secondary"
                            className="mr-1 text-xs"
                          >
                            L{layer}: {count}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {results && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Results</h3>

              {/* Training Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Training Phase (Layers 5-6)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Successful Layers:</strong>{" "}
                      {results.training.successfulLayers} /{" "}
                      {results.training.results.length}
                    </p>
                    <p className="text-sm">
                      <strong>Execution Time:</strong>{" "}
                      {Math.round(results.training.totalExecutionTime)}ms
                    </p>
                    <div className="text-sm">
                      <strong>Improvements:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {results.training.results
                          .filter((r: any) => r.success && r.improvements)
                          .flatMap((r: any) => r.improvements)
                          .map((improvement: string, index: number) => (
                            <li key={index} className="text-green-700">
                              {improvement}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Layer 7 Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    AI Learning Phase (Layer 7)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Success:</strong>{" "}
                      {results.layer7.successfulLayers > 0 ? "Yes" : "No"}
                    </p>
                    <p className="text-sm">
                      <strong>Execution Time:</strong>{" "}
                      {Math.round(results.layer7.totalExecutionTime)}ms
                    </p>
                    {results.layer7.results.length > 0 &&
                      results.layer7.results[0].improvements && (
                        <div className="text-sm">
                          <strong>Applied Learning:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {results.layer7.results[0].improvements.map(
                              (improvement: string, index: number) => (
                                <li key={index} className="text-blue-700">
                                  {improvement}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Code Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Code Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Original
                      </label>
                      <Textarea
                        value={results.originalCode}
                        readOnly
                        rows={8}
                        className="font-mono text-xs bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-green-700">
                        After Layer 7
                      </label>
                      <Textarea
                        value={results.layer7.finalCode}
                        readOnly
                        rows={8}
                        className="font-mono text-xs border-green-200 bg-green-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
