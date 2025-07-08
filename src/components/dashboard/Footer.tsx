
import { Badge } from "@/components/ui/badge";
import { Github, Heart, Zap } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-16 text-center space-y-6">
      <div className="flex justify-center space-x-4">
        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
          <Heart className="w-3 h-3 mr-1 text-red-500" />
          Made with Enterprise-Grade Patterns
        </Badge>
        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
          <Zap className="w-3 h-3 mr-1 text-yellow-500" />
          Powered by AI
        </Badge>
        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
          <Github className="w-3 h-3 mr-1" />
          MIT License
        </Badge>
      </div>
      
      <div className="text-slate-600">
        <p className="text-lg font-medium mb-2">NeuroLint - Advanced Code Orchestration System</p>
        <p className="text-sm">
          Transforming React/Next.js codebases with intelligent automation and enterprise-grade reliability.
        </p>
      </div>
      
      <div className="text-xs text-slate-500">
        © 2024 NeuroLint. Built for developers who demand excellence.
      </div>
    </footer>
  );
};
