
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  FileText, 
  ExternalLink, 
  Star, 
  GitBranch, 
  Heart,
  Code,
  Terminal,
  Settings
} from "lucide-react";

export const Documentation = () => {
  const documentationLinks = [
    {
      title: "Core Documentation",
      description: "Complete guide to NeuroLint architecture and features",
      icon: Book,
      type: "Essential",
      color: "from-blue-500 to-cyan-600",
      badge: "Core"
    },
    {
      title: "CLI Usage Guide", 
      description: "Comprehensive CLI commands and examples",
      icon: Terminal,
      type: "Guide",
      color: "from-green-500 to-emerald-600",
      badge: "CLI"
    },
    {
      title: "Implementation Patterns",
      description: "MUST READ - Orchestration implementation patterns",
      icon: Settings,
      type: "Critical",
      color: "from-red-500 to-pink-600",
      badge: "Must Read",
      highlight: true
    }
  ];

  const resources = [
    {
      title: "Contributing Guidelines",
      description: "How to contribute to NeuroLint development",
      icon: GitBranch,
      action: "View Guidelines"
    },
    {
      title: "MIT License",
      description: "Open source license details",
      icon: FileText,
      action: "View License"
    },
    {
      title: "GitHub Repository",
      description: "Source code and issue tracking",
      icon: Star,
      action: "Visit GitHub"
    }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Documentation */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Book className="w-6 h-6 text-blue-600" />
            <span>Documentation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {documentationLinks.map((doc, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-xl border-2 ${
                doc.highlight ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'
              } hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${doc.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${doc.color} shadow-lg`}>
                      <doc.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={doc.highlight ? "destructive" : "secondary"}
                    className={doc.highlight ? "" : "bg-slate-100 text-slate-700"}
                  >
                    {doc.badge}
                  </Badge>
                </div>
                
                <Button
                  variant={doc.highlight ? "default" : "outline"}
                  className="w-full group-hover:shadow-md transition-shadow"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Read Documentation
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resources & Community */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-red-500" />
            <span>Resources & Community</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Community Resources */}
          <div className="space-y-4">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 border border-slate-100"
              >
                <div className="flex items-center space-x-3">
                  <resource.icon className="w-5 h-5 text-slate-600" />
                  <div>
                    <h4 className="font-medium text-slate-900">{resource.title}</h4>
                    <p className="text-sm text-slate-600">{resource.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Enterprise Features */}
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
              <Code className="w-5 h-5 mr-2" />
              Enterprise-Grade Features
            </h4>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Robust code transformation patterns</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Automatic rollback and error recovery</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Performance optimization and caching</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>AI-driven layer recommendations</span>
              </li>
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-blue-700">Specialized Layers</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-green-700">Open Source</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
