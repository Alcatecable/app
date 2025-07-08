
import { Zap, Code, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  return (
    <header className="text-center space-y-6">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1">
            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="text-left">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NeuroLint
          </h1>
          <p className="text-lg text-slate-600 font-medium">Advanced Code Orchestration System</p>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
          <Code className="w-4 h-4 mr-1" />
          React/Next.js
        </Badge>
        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
          <Cpu className="w-4 h-4 mr-1" />
          Multi-Layer Architecture
        </Badge>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
          AI-Powered
        </Badge>
      </div>
      
      <p className="text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
        A comprehensive multi-layer automated fixing system for React/Next.js codebases with 
        intelligent orchestration, error recovery, and performance optimization.
      </p>
    </header>
  );
};
