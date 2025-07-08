
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, 
  Zap, 
  Settings, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

export function NeuroLintIntegration() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            NeuroLint Orchestration
          </CardTitle>
          <CardDescription>
            Advanced multi-layer code transformation system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Layer Architecture</h4>
              <div className="space-y-2">
                {[
                  { id: 1, name: 'Configuration', status: 'active' },
                  { id: 2, name: 'Entity Cleanup', status: 'active' },
                  { id: 3, name: 'Components', status: 'active' },
                  { id: 4, name: 'Hydration', status: 'active' }
                ].map((layer) => (
                  <div key={layer.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Layer {layer.id}: {layer.name}</span>
                    <Badge variant={layer.status === 'active' ? 'default' : 'secondary'}>
                      {layer.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">System Status</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Orchestrator Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Validation System Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Error Recovery Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Performance Optimized</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-2">
            <Button size="sm" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Launch Client
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
