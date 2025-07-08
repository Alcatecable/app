
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LAYER_EXECUTION_ORDER } from '@/lib/neurolint/constants';

interface ConfigurationSectionProps {
  selectedLayers: number[];
  onLayerToggle: (layerId: number, checked: boolean) => void;
}

export function ConfigurationSection({ selectedLayers, onLayerToggle }: ConfigurationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Layer Configuration</CardTitle>
        <CardDescription>
          Select which layers to execute during transformation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {LAYER_EXECUTION_ORDER.map((layer) => (
            <div key={layer.id} className="flex items-center space-x-2">
              <Checkbox
                id={`layer-${layer.id}`}
                checked={selectedLayers.includes(layer.id)}
                onCheckedChange={(checked) => 
                  onLayerToggle(layer.id, checked as boolean)
                }
              />
              <label 
                htmlFor={`layer-${layer.id}`}
                className="flex-1 cursor-pointer"
              >
                <div className="font-medium">Layer {layer.id}: {layer.name}</div>
                <div className="text-sm text-muted-foreground">{layer.description}</div>
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
