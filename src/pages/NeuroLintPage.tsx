
import { NeuroLintClient } from '@/components/neurolint/NeuroLintClient';

export function NeuroLintPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">NeuroLint Orchestration</h1>
            <p className="text-muted-foreground mt-2">
              Advanced multi-layer code analysis and transformation system
            </p>
          </div>
          
          <NeuroLintClient />
        </div>
      </div>
    </div>
  );
}
