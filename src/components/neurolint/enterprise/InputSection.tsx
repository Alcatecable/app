
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Play, Clock } from 'lucide-react';

interface InputSectionProps {
  code: string;
  setCode: (code: string) => void;
  isProcessing: boolean;
  onAnalyze: () => void;
  onTransform: () => void;
}

export function InputSection({ 
  code, 
  setCode, 
  isProcessing, 
  onAnalyze, 
  onTransform 
}: InputSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Code Input</label>
        <Textarea
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={15}
          className="font-mono text-sm"
        />
        <div className="text-xs text-muted-foreground">
          Characters: {code.length} | Max: 1,000,000
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onAnalyze} variant="outline" disabled={!code.trim() || isProcessing}>
          <Zap className="w-4 h-4 mr-2" />
          Analyze Code
        </Button>
        <Button onClick={onTransform} disabled={!code.trim() || isProcessing}>
          {isProcessing ? (
            <Clock className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isProcessing ? 'Processing...' : 'Transform Code'}
        </Button>
      </div>
    </div>
  );
}
