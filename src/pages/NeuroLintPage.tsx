
import { EnterpriseNeuroLintClient } from '@/components/neurolint/EnterpriseNeuroLintClient';

export default function NeuroLintPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <EnterpriseNeuroLintClient />
      </div>
    </div>
  );
}
