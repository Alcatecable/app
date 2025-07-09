import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { patternLearner } from '@/lib/neurolint/pattern-learner';
import { useToast } from "@/hooks/use-toast";
import { CardDescription } from "@/components/ui/card";

export function Layer7Test() {
  const [stats, setStats] = useState(patternLearner.getStatistics());
  const { toast } = useToast();

  const handleGetStats = () => {
    try {
      const stats = patternLearner.getStatistics();
      setStats(stats);
      toast({
        title: "Statistics Retrieved",
        description: `Found ${stats.totalPatterns} learned patterns`
      });
    } catch (error) {
      console.error('Failed to get statistics:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve pattern statistics",
        variant: "destructive"
      });
    }
  };

  const handleClearRules = () => {
    try {
      patternLearner.clearRules();
      const newStats = patternLearner.getStatistics();
      setStats(newStats);
      toast({
        title: "Rules Cleared",
        description: "All learned patterns have been cleared"
      });
    } catch (error) {
      console.error('Failed to clear rules:', error);
      toast({
        title: "Error",
        description: "Failed to clear pattern rules",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pattern Learner Controls</CardTitle>
          <CardDescription>
            Manage and view statistics for the pattern learning system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGetStats}>Get Statistics</Button>
          <Button onClick={handleClearRules} variant="destructive">Clear Rules</Button>
        </CardContent>
      </Card>
      
      {/* Fix the stats display */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Pattern Learning Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalPatterns}</div>
                <div className="text-sm text-muted-foreground">Total Patterns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.successfulApplications}</div>
                <div className="text-sm text-muted-foreground">Successful Applications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(stats.averageConfidence * 100)}%</div>
                <div className="text-sm text-muted-foreground">Average Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.recentlyLearned}</div>
                <div className="text-sm text-muted-foreground">Recently Learned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
