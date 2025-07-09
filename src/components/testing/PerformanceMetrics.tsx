import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Clock,
  MemoryStick,
  Zap,
  TrendingUp,
  Target,
  Cpu,
  HardDrive,
} from "lucide-react";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  target: number;
  status: "excellent" | "good" | "warning" | "critical";
  description: string;
}

export const PerformanceMetrics: React.FC = () => {
  const currentMetrics: PerformanceMetric[] = [
    {
      name: "Processing Speed",
      value: 1250,
      unit: "lines/sec",
      target: 1000,
      status: "excellent",
      description: "Code lines processed per second across all layers",
    },
    {
      name: "Memory Usage",
      value: 85,
      unit: "MB",
      target: 128,
      status: "good",
      description: "Peak memory consumption during processing",
    },
    {
      name: "AST Parse Time",
      value: 45,
      unit: "ms",
      target: 100,
      status: "excellent",
      description: "Average time to parse and analyze code structure",
    },
    {
      name: "Pattern Matching",
      value: 98.5,
      unit: "%",
      target: 95,
      status: "excellent",
      description: "Accuracy of pattern detection across all layers",
    },
    {
      name: "Layer Orchestration",
      value: 25,
      unit: "ms",
      target: 50,
      status: "excellent",
      description: "Time to coordinate between layers",
    },
    {
      name: "Error Recovery",
      value: 15,
      unit: "ms",
      target: 30,
      status: "excellent",
      description: "Time to recover from processing errors",
    },
  ];

  const layerPerformance = [
    { layer: 1, name: "Configuration", time: 5, efficiency: 98 },
    { layer: 2, name: "Pattern Detection", time: 120, efficiency: 96 },
    { layer: 3, name: "Component Analysis", time: 180, efficiency: 94 },
    { layer: 4, name: "Hydration Fixes", time: 95, efficiency: 97 },
    { layer: 5, name: "Next.js Optimization", time: 65, efficiency: 99 },
    { layer: 6, name: "Testing Integration", time: 45, efficiency: 95 },
    { layer: 7, name: "Adaptive Learning", time: 85, efficiency: 92 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "good":
        return <Target className="h-4 w-4 text-blue-600" />;
      case "warning":
        return <Activity className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <Zap className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "processing speed":
        return <Zap className="h-5 w-5" />;
      case "memory usage":
        return <MemoryStick className="h-5 w-5" />;
      case "ast parse time":
        return <Cpu className="h-5 w-5" />;
      case "pattern matching":
        return <Target className="h-5 w-5" />;
      case "layer orchestration":
        return <Activity className="h-5 w-5" />;
      case "error recovery":
        return <HardDrive className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const calculateProgress = (value: number, target: number) => {
    if (target === 0) return 100;
    return Math.min(100, (value / target) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getMetricIcon(metric.name)}
                  <CardTitle className="text-base">{metric.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-sm text-muted-foreground mb-1">
                    {metric.unit}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      vs Target ({metric.target}
                      {metric.unit})
                    </span>
                    {getStatusIcon(metric.status)}
                  </div>
                  <Progress
                    value={calculateProgress(metric.value, metric.target)}
                    className="h-2"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Layer-by-Layer Performance
          </CardTitle>
          <CardDescription>
            Processing time and efficiency metrics for each NeuroLint layer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {layerPerformance.map((layer) => (
              <div key={layer.layer} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Layer {layer.layer}</Badge>
                    <span className="font-medium">{layer.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {layer.time}ms
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {layer.efficiency}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Processing Time</span>
                      <span>{layer.time}ms</span>
                    </div>
                    <Progress
                      value={Math.min(100, (layer.time / 200) * 100)}
                      className="h-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Efficiency</span>
                      <span>{layer.efficiency}%</span>
                    </div>
                    <Progress value={layer.efficiency} className="h-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">24h Improvement</span>
                <Badge variant="default" className="bg-green-600">
                  +15%
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">7d Average</span>
                <Badge variant="secondary">1,180 lines/sec</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Peak Performance</span>
                <Badge variant="outline">1,650 lines/sec</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>CPU Usage</span>
                  <span>23%</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Memory Usage</span>
                  <span>85MB / 128MB</span>
                </div>
                <Progress value={66} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Cache Hit Rate</span>
                  <span>94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
          <CardDescription>
            Suggestions to optimize NeuroLint processing performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">
                  Excellent Performance
                </h4>
                <p className="text-sm text-blue-700">
                  All metrics are performing above target. Consider increasing
                  processing load.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <Target className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">
                  Optimization Opportunity
                </h4>
                <p className="text-sm text-green-700">
                  Layer 7 adaptive learning could benefit from larger training
                  datasets.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900">
                  Cache Optimization
                </h4>
                <p className="text-sm text-purple-700">
                  Pattern matching cache is highly effective at 94% hit rate.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
