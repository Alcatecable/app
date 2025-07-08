
import { NeuroLintClient } from '@/components/neurolint/NeuroLintClient';

export default function NeuroLintPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">NeuroLint Orchestration</h1>
          <p className="text-muted-foreground mt-2">
            Advanced code analysis and transformation with multi-layer processing
          </p>
        </div>
        <NeuroLintClient />
      </div>
    </div>
  );
}
