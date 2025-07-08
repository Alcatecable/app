
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Terminal, 
  Copy, 
  Play, 
  Eye, 
  Settings, 
  TestTube, 
  Activity,
  Layers
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const CLICommands = () => {
  const copyToClipboard = (command: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: "Copied to clipboard",
      description: command,
    });
  };

  const commandCategories = [
    {
      title: "Basic Operations",
      icon: Play,
      commands: [
        {
          command: "node fix-master.js",
          description: "Apply all automated fixes",
          example: "node fix-master.js"
        },
        {
          command: "node fix-master.js --dry-run",
          description: "Preview changes without applying",
          example: "node fix-master.js --dry-run"
        },
        {
          command: "node fix-master.js --verbose",
          description: "Show detailed output",
          example: "node fix-master.js --verbose"
        }
      ]
    },
    {
      title: "Layer Management",
      icon: Layers,
      commands: [
        {
          command: "node fix-master.js --skip-layers",
          description: "Skip specific layers",
          example: "node fix-master.js --skip-layers 1,2"
        },
        {
          command: "./src/cli/neurolint-cli.js fix",
          description: "Fix specific layers only",
          example: "./src/cli/neurolint-cli.js fix src/ --layers 1,2,3"
        }
      ]
    },
    {
      title: "Analysis & Testing",
      icon: Activity,
      commands: [
        {
          command: "./src/cli/neurolint-cli.js analyze",
          description: "Deep code analysis",
          example: "./src/cli/neurolint-cli.js analyze src/"
        },
        {
          command: "./src/cli/neurolint-cli.js test",
          description: "Run orchestration tests",
          example: "./src/cli/neurolint-cli.js test"
        },
        {
          command: "./src/cli/neurolint-cli.js doctor",
          description: "Performance diagnostics",
          example: "./src/cli/neurolint-cli.js doctor"
        }
      ]
    },
    {
      title: "Advanced Features",
      icon: Settings,
      commands: [
        {
          command: "./src/cli/neurolint-cli.js interactive",
          description: "Launch interactive mode",
          example: "./src/cli/neurolint-cli.js interactive"
        },
        {
          command: "./src/cli/neurolint-cli.js batch",
          description: "Process multiple configs",
          example: "./src/cli/neurolint-cli.js batch config.json"
        }
      ]
    }
  ];

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Terminal className="w-6 h-6 text-blue-600" />
          <span>CLI Commands</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {commandCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
                <category.icon className="w-5 h-5 text-slate-600" />
                <h3 className="font-semibold text-slate-900">{category.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {category.commands.length} commands
                </Badge>
              </div>
              
              <div className="grid gap-3">
                {category.commands.map((cmd, cmdIndex) => (
                  <div
                    key={cmdIndex}
                    className="group bg-slate-50 rounded-lg border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 mb-2">
                            {cmd.description}
                          </p>
                          <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm">
                            <code className="text-green-400">
                              $ {cmd.example}
                            </code>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(cmd.example)}
                          className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Installation Instructions */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Terminal className="w-5 h-5 mr-2" />
            Quick Setup
          </h4>
          <div className="space-y-3">
            <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm">
              <code className="text-green-400">$ npm install</code>
            </div>
            <p className="text-sm text-blue-800">
              Install all dependencies and you're ready to start using NeuroLint!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
