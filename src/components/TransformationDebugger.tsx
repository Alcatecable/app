import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NeuroLintOrchestrator } from "@/lib/neurolint";

export const TransformationDebugger: React.FC = () => {
  const [testCode, setTestCode] = useState(`const test = "Hello World";
console.log(&quot;test&quot;);
let items = [1,2,3];
items.map(item => <div>{item}</div>);
localStorage.setItem("test", "value");`);

  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResult, setDebugResult] = useState<any>(null);

  const runDebugTransformation = async () => {
    setIsDebugging(true);
    try {
      console.log("Starting debug transformation with code:", testCode);

      const result = await NeuroLintOrchestrator.transform(
        testCode,
        [1, 2, 3, 4],
        {
          verbose: true,
          dryRun: false,
        },
      );

      console.log("Debug transformation result:", result);
      setDebugResult(result);
    } catch (error) {
      console.error("Debug transformation error:", error);
      setDebugResult({
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transformation Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Test Code:</label>
          <Textarea
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            rows={6}
            className="font-mono text-sm"
          />
        </div>

        <Button
          onClick={runDebugTransformation}
          disabled={isDebugging}
          className="w-full"
        >
          {isDebugging ? "Running Debug..." : "Run Debug Transformation"}
        </Button>

        {debugResult && (
          <div className="space-y-2">
            <h3 className="font-semibold">Debug Results:</h3>

            {debugResult.error ? (
              <div className="text-red-600 font-mono text-sm p-2 bg-red-50 rounded">
                Error: {debugResult.error}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="outline">
                    Successful: {debugResult.successfulLayers}
                  </Badge>
                  <Badge variant="outline">
                    Total: {debugResult.results?.length || 0}
                  </Badge>
                  <Badge variant="outline">
                    Time: {debugResult.totalExecutionTime}ms
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Layer Results:</h4>
                  {debugResult.results?.map((result: any, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between items-center">
                        <span>Layer {result.layerId}</span>
                        <Badge
                          variant={result.success ? "default" : "destructive"}
                        >
                          {result.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      {result.error && (
                        <div className="text-red-600 mt-1 font-mono text-xs">
                          {result.error}
                        </div>
                      )}
                      {result.revertReason && (
                        <div className="text-orange-600 mt-1 font-mono text-xs">
                          Reverted: {result.revertReason}
                        </div>
                      )}
                      <div className="text-gray-600 mt-1">
                        Changes: {result.changeCount} | Time:{" "}
                        {result.executionTime}ms
                      </div>
                    </div>
                  ))}
                </div>

                {debugResult.finalCode !== testCode && (
                  <div>
                    <h4 className="font-medium mb-2">Final Code:</h4>
                    <Textarea
                      value={debugResult.finalCode}
                      readOnly
                      rows={6}
                      className="font-mono text-sm bg-green-50"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
