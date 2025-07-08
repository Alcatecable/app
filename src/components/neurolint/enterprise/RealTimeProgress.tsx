
import { Progress } from '@/components/ui/progress';
import { CardContent } from '@/components/ui/card';

interface RealTimeProgressProps {
  isProcessing: boolean;
  progress: {
    step: number;
    total: number;
    current: string;
  };
}

export function RealTimeProgress({ isProcessing, progress }: RealTimeProgressProps) {
  if (!isProcessing || progress.total === 0) return null;

  return (
    <CardContent>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>{progress.current}</span>
          <span>{progress.step}/{progress.total}</span>
        </div>
        <Progress value={(progress.step / progress.total) * 100} />
      </div>
    </CardContent>
  );
}
