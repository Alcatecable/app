
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Eye, Terminal, Zap, Settings, TestTube } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const QuickActions = () => {
  const handleAction = (action: string) => {
    toast({
      title: "Command Executed",
      description: `Running: ${action}`,
    });
  };

  const quickCommands = [
    {
      title: "Quick Fix",
      description: "Apply all automated fixes",
      command: "node fix-master.js",
      icon: Zap,
      variant: "default" as const,
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "Preview Changes",
      description: "Dry run to preview fixes",
      command: "node fix-master.js --dry-run",
      icon: Eye,
      variant: "outline" as const,
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      title: "Interactive CLI",
      description: "Launch interactive mode",
      command: "./src/cli/neurolint-cli.js interactive",
      icon: Terminal,
      variant: "outline" as const,
      gradient: "from-purple-500 to-violet-600"
    },
    {
      title: "Run Tests",
      description: "Execute test suite",
      command: "./src/cli/neurolint-cli.js test",
      icon: TestTube,
      variant: "outline" as const,
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Analyze Code",
      description: "Deep code analysis",
      command: "./src/cli/neurolint-cli.js analyze src/",
      icon: Settings,
      variant: "outline" as const,
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      title: "Performance Check",
      description: "System diagnostics",
      command: "./src/cli/neurolint-cli.js doctor",
      icon: Play,
      variant: "outline" as const,
      gradient: "from-pink-500 to-rose-600"
    }
  ];

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-blue-600" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>
          Common commands to get started with NeuroLint
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickCommands.map((cmd, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cmd.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="p-4 relative">
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${cmd.gradient} shadow-md`}>
                    <cmd.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
                      {cmd.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {cmd.description}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <code className="text-sm text-slate-700 font-mono">
                    {cmd.command}
                  </code>
                </div>
                <Button
                  variant={cmd.variant}
                  size="sm"
                  onClick={() => handleAction(cmd.command)}
                  className="w-full group-hover:shadow-md transition-shadow"
                >
                  Execute
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
