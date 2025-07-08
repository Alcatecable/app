
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  Layers, 
  Shield, 
  Zap, 
  Brain, 
  RefreshCw,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";

export const SystemOverview = () => {
  const coreComponents = [
    {
      name: "NeuroLintOrchestrator",
      description: "Main coordination system",
      status: "Active",
      performance: 95,
      icon: Brain,
      color: "text-blue-600"
    },
    {
      name: "TransformationValidator",
      description: "Safety validation with rollback",
      status: "Monitoring",
      performance: 89,
      icon: Shield,
      color: "text-green-600"
    },
    {
      name: "LayerDependencyManager",
      description: "Automatic dependency resolution",
      status: "Active",
      performance: 92,
      icon: Layers,
      color: "text-purple-600"
    },
    {
      name: "SmartLayerSelector",
      description: "AI-driven layer recommendations",
      status: "Learning",
      performance: 87,
      icon: Zap,
      color: "text-yellow-600"
    },
    {
      name: "ErrorRecoverySystem",
      description: "Categorized error handling",
      status: "Standby",
      performance: 94,
      icon: RefreshCw,
      color: "text-red-600"
    },
    {
      name: "PerformanceOptimizer",
      description: "Caching and optimization",
      status: "Optimizing",
      performance: 91,
      icon: TrendingUp,
      color: "text-indigo-600"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Active": { color: "bg-green-100 text-green-800", icon: CheckCircle },
      "Monitoring": { color: "bg-blue-100 text-blue-800", icon: Clock },
      "Learning": { color: "bg-purple-100 text-purple-800", icon: Brain },
      "Standby": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      "Optimizing": { color: "bg-indigo-100 text-indigo-800", icon: TrendingUp }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const StatusIcon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cpu className="w-6 h-6 text-blue-600" />
          <span>System Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coreComponents.map((component, index) => (
            <div
              key={index}
              className="group bg-slate-50 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 border border-slate-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <component.icon className={`w-5 h-5 ${component.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {component.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {component.description}
                    </p>
                  </div>
                </div>
                {getStatusBadge(component.status)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Performance</span>
                  <span className="font-medium text-slate-900">{component.performance}%</span>
                </div>
                <Progress 
                  value={component.performance} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
