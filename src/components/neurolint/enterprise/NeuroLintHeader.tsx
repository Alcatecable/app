
import { Badge } from '@/components/ui/badge';
import { Shield, Cpu } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface NeuroLintHeaderProps {
  sessionId: string;
  successRate: number;
}

export function NeuroLintHeader({ sessionId, successRate }: NeuroLintHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <CardTitle>Enterprise NeuroLint Orchestration</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            Session: {sessionId.slice(-8)}
          </Badge>
          <Badge variant={successRate > 90 ? 'default' : 'destructive'}>
            Success Rate: {successRate}%
          </Badge>
        </div>
      </div>
      <CardDescription>
        Production-ready code analysis and transformation with comprehensive monitoring
      </CardDescription>
    </CardHeader>
  );
}
