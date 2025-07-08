
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Code, 
  Component, 
  Droplets, 
  Navigation, 
  TestTube,
  ChevronRight,
  Layers
} from "lucide-react";

export const LayerArchitecture = () => {
  const layers = [
    {
      id: 1,
      name: "Configuration",
      description: "TypeScript, Next.js, package.json fixes",
      icon: Settings,
      color: "from-blue-500 to-cyan-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      features: ["TypeScript Config", "Next.js Setup", "Package Management"]
    },
    {
      id: 2,
      name: "Patterns",
      description: "HTML entities, imports, React patterns",
      icon: Code,
      color: "from-green-500 to-emerald-600",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      features: ["Import Optimization", "HTML Entities", "Code Patterns"]
    },
    {
      id: 3,
      name: "Components",
      description: "Button variants, form validation, props",
      icon: Component,
      color: "from-purple-500 to-violet-600",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
      features: ["Component Props", "Form Validation", "UI Variants"]
    },
    {
      id: 4,
      name: "Hydration",
      description: "SSR guards, theme providers, client APIs",
      icon: Droplets,
      color: "from-orange-500 to-red-600",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
      features: ["SSR Guards", "Theme Providers", "Client APIs"]
    },
    {
      id: 5,
      name: "Next.js",
      description: "App Router fixes, routing optimizations",
      icon: Navigation,
      color: "from-indigo-500 to-purple-600",
      textColor: "text-indigo-700",
      bgColor: "bg-indigo-50",
      features: ["App Router", "Route Optimization", "Performance"]
    },
    {
      id: 6,
      name: "Testing",
      description: "Validation, final build checks",
      icon: TestTube,
      color: "from-pink-500 to-rose-600",
      textColor: "text-pink-700",
      bgColor: "bg-pink-50",
      features: ["Build Validation", "Test Coverage", "Quality Checks"]
    }
  ];

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Layers className="w-6 h-6 text-blue-600" />
          <span>Layer Architecture</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {layers.map((layer, index) => (
            <div key={layer.id} className="group">
              <div className="flex items-center space-x-4">
                {/* Layer Connection Line */}
                {index < layers.length - 1 && (
                  <div className="absolute left-8 mt-16 w-px h-8 bg-gradient-to-b from-slate-300 to-transparent"></div>
                )}
                
                {/* Layer Card */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-slate-300">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Layer Number & Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center shadow-lg`}>
                          <layer.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-center mt-2">
                          <Badge variant="outline" className="text-xs">
                            Layer {layer.id}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Layer Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className={`text-lg font-semibold ${layer.textColor} group-hover:text-slate-900 transition-colors`}>
                              {layer.name}
                            </h3>
                            <p className="text-slate-600 text-sm mt-1">
                              {layer.description}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </div>
                        
                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                          {layer.features.map((feature, featureIndex) => (
                            <Badge
                              key={featureIndex}
                              variant="secondary"
                              className={`${layer.bgColor} ${layer.textColor} border-0 text-xs`}
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Architecture Flow Summary */}
        <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-2">Intelligent Layer Processing</h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            Each layer builds upon the previous one, with intelligent dependency management and 
            automatic rollback capabilities. The system analyzes your codebase and selects the 
            optimal layers for maximum efficiency and safety.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
